import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvailabilityRuleInput, UpdateAvailabilityRuleInput } from './dto/availability.input';
import { TrainerAvailability } from '@prisma/client';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse "HH:mm" into total minutes from midnight */
function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Format minutes-from-midnight to "HH:mm" label */
function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

/** Build a Date from a YYYY-MM-DD string and HH:mm time, in the given offset */
function buildUtcDate(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr}:00.000Z`);
}

/** Get YYYY-MM-DD string from a Date in UTC */
function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Get dayOfWeek (0=Sun) from a YYYY-MM-DD string */
function dayOfWeekFrom(dateStr: string): number {
  return new Date(`${dateStr}T12:00:00Z`).getUTCDay();
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class TrainerAvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Rule CRUD ────────────────────────────────────────────────────────────

  async getAvailabilityRules(trainerId: number) {
    return this.prisma.trainerAvailability.findMany({
      where: { trainerId },
      orderBy: [{ dayOfWeek: 'asc' }, { specificDate: 'asc' }],
    });
  }

  async createAvailabilityRule(trainerId: number, input: CreateAvailabilityRuleInput) {
    if (input.dayOfWeek == null && !input.specificDate) {
      throw new BadRequestException('Either dayOfWeek or specificDate must be provided');
    }
    if (input.dayOfWeek != null && input.specificDate) {
      throw new BadRequestException('dayOfWeek and specificDate are mutually exclusive');
    }
    if (toMinutes(input.startTime) >= toMinutes(input.endTime)) {
      throw new BadRequestException('startTime must be before endTime');
    }

    return this.prisma.trainerAvailability.create({
      data: {
        trainerId,
        dayOfWeek: input.dayOfWeek ?? null,
        specificDate: input.specificDate ? new Date(input.specificDate) : null,
        startTime: input.startTime,
        endTime: input.endTime,
        isAvailable: input.isAvailable ?? true,
        title: input.title ?? null,
        timezone: input.timezone ?? 'Asia/Jakarta',
      },
    });
  }

  async updateAvailabilityRule(trainerId: number, input: UpdateAvailabilityRuleInput) {
    const rule = await this.prisma.trainerAvailability.findUnique({ where: { id: input.id } });
    if (!rule) throw new NotFoundException('Availability rule not found');
    if (rule.trainerId !== trainerId) throw new ForbiddenException('Not your rule');

    return this.prisma.trainerAvailability.update({
      where: { id: input.id },
      data: {
        ...(input.startTime && { startTime: input.startTime }),
        ...(input.endTime && { endTime: input.endTime }),
        ...(input.isAvailable != null && { isAvailable: input.isAvailable }),
        ...(input.title != null && { title: input.title }),
      },
    });
  }

  async deleteAvailabilityRule(trainerId: number, ruleId: number) {
    const rule = await this.prisma.trainerAvailability.findUnique({ where: { id: ruleId } });
    if (!rule) throw new NotFoundException('Availability rule not found');
    if (rule.trainerId !== trainerId) throw new ForbiddenException('Not your rule');

    await this.prisma.trainerAvailability.delete({ where: { id: ruleId } });
    return true;
  }

  // ── Slot Computation ─────────────────────────────────────────────────────

  /**
   * Returns available time slots for a trainer within a date range.
   * - Respects weekly recurring rules (dayOfWeek).
   * - specificDate rules override dayOfWeek rules (both block and open).
   * - Existing PENDING/ACTIVE bookings are subtracted.
   * - Slots are generated in `slotDurationMinutes` increments (default 60).
   */
  async getAvailableSlots(
    trainerId: number,
    startDate: string, // YYYY-MM-DD
    endDate: string,   // YYYY-MM-DD
    slotDurationMinutes = 60,
  ) {
    const rules = await this.getAvailabilityRules(trainerId);

    // Fetch existing booked windows for the trainer in the date range
    const rangeStart = new Date(`${startDate}T00:00:00Z`);
    const rangeEnd   = new Date(`${endDate}T23:59:59Z`);

    const existingBookings = await this.prisma.booking.findMany({
      where: {
        trainerId,
        status: { in: ['PENDING', 'ACTIVE'] },
        scheduledStart: { gte: rangeStart, lte: rangeEnd },
        scheduledEnd:   { not: null },
      },
      select: { scheduledStart: true, scheduledEnd: true },
    });

    const slots: { start: Date; end: Date; label: string }[] = [];

    // Iterate each day in the range
    const current = new Date(rangeStart);
    while (current <= rangeEnd) {
      const dateStr = toDateStr(current);
      const dow = dayOfWeekFrom(dateStr);

      // 1. Check specificDate rules (override)
      const specificRule = rules.find(
        (r) => r.specificDate && toDateStr(r.specificDate) === dateStr,
      );
      // 2. Fall back to weekly dayOfWeek rule
      const weeklyRule = rules.find((r) => r.dayOfWeek === dow && !r.specificDate);
      const activeRule = specificRule ?? weeklyRule;

      if (activeRule && activeRule.isAvailable) {
        const dayStart = toMinutes(activeRule.startTime);
        const dayEnd   = toMinutes(activeRule.endTime);

        // Generate slot windows
        for (let t = dayStart; t + slotDurationMinutes <= dayEnd; t += slotDurationMinutes) {
          const slotStart = buildUtcDate(dateStr, minutesToLabel(t));
          const slotEnd   = buildUtcDate(dateStr, minutesToLabel(t + slotDurationMinutes));

          // Check no existing booking overlaps this slot
          const isBooked = existingBookings.some((b) => {
            const bStart = new Date(b.scheduledStart!);
            const bEnd   = new Date(b.scheduledEnd!);
            return slotStart < bEnd && slotEnd > bStart;
          });

          if (!isBooked) {
            slots.push({
              start: slotStart,
              end: slotEnd,
              label: `${minutesToLabel(t)} – ${minutesToLabel(t + slotDurationMinutes)}`,
            });
          }
        }
      }

      // Move to next day
      current.setUTCDate(current.getUTCDate() + 1);
    }

    return slots;
  }

  // ── Conflict Check (used by booking creation) ────────────────────────────

  async assertNoSchedulingConflict(
    trainerId: number,
    scheduledStart: Date,
    scheduledEnd: Date,
    excludeBookingId?: number,
  ) {
    const conflict = await this.prisma.booking.findFirst({
      where: {
        trainerId,
        status: { in: ['PENDING', 'ACTIVE'] },
        ...(excludeBookingId && { id: { not: excludeBookingId } }),
        scheduledStart: { lt: scheduledEnd },
        scheduledEnd:   { gt: scheduledStart },
      },
    });

    if (conflict) {
      throw new BadRequestException(
        `Scheduling conflict: the trainer already has a session at that time (Booking #${conflict.id}).`,
      );
    }
  }
}

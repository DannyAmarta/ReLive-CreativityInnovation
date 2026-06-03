import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvailabilityRuleInput, UpdateAvailabilityRuleInput } from './dto/availability.input';
import { TrainerAvailability } from '@prisma/client';
import { buildBlockingBookingWindowWhere } from './pending-booking.util';

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

/** Build a Date from a YYYY-MM-DD string and HH:mm time in WIB (UTC+7) */
function buildUtcDate(dateStr: string, timeStr: string): Date {
  // Trainer times are WIB (UTC+7) — use +07:00 offset so JS converts correctly to UTC
  return new Date(`${dateStr}T${timeStr}:00.000+07:00`);
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

  async assertRulesDoNotConflictWithBookings(trainerId: number, rulesAfterChange: TrainerAvailability[]) {
    const now = new Date();
    const bookings = await this.prisma.booking.findMany({
      where: {
        trainerId,
        ...buildBlockingBookingWindowWhere(now),
        scheduledStart: { not: null },
        scheduledEnd: { not: null },
      },
    });

    for (const b of bookings) {
      const bStart = new Date(b.scheduledStart!);
      const bEnd = new Date(b.scheduledEnd!);
      const dateStr = bStart.toISOString().slice(0, 10);
      const bStartMin = bStart.getUTCHours() * 60 + bStart.getUTCMinutes();
      const duration = Math.round((bEnd.getTime() - bStart.getTime()) / 60000);
      const bEndMin = bStartMin + duration;

      const specificRules = rulesAfterChange.filter(
        (r) => r.specificDate && r.specificDate.toISOString().slice(0, 10) === dateStr,
      );
      const dow = new Date(`${dateStr}T12:00:00Z`).getUTCDay();
      const weeklyRules = rulesAfterChange.filter((r) => r.dayOfWeek === dow && !r.specificDate);
      const activeRules = specificRules.length > 0 ? specificRules : weeklyRules;

      const allowedRules = activeRules.filter((r) => r.isAvailable);
      const isCovered = allowedRules.some((r) => {
        const rStart = toMinutes(r.startTime);
        const rEnd = toMinutes(r.endTime);
        return rStart <= bStartMin && rEnd >= bEndMin;
      });

      if (!isCovered) {
        throw new BadRequestException(
          `Cannot modify availability: slot on ${dateStr} is booked by a client.`
        );
      }

      const blockedRules = activeRules.filter((r) => !r.isAvailable);
      const isBlocked = blockedRules.some((br) => {
        const brStart = toMinutes(br.startTime);
        const brEnd = toMinutes(br.endTime);
        return bStartMin < brEnd && bEndMin > brStart;
      });

      if (isBlocked) {
        throw new BadRequestException(
          `Cannot modify availability: slot on ${dateStr} is booked by a client.`
        );
      }
    }
  }

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

    const virtualRule: TrainerAvailability = {
      id: 0,
      trainerId,
      dayOfWeek: input.dayOfWeek ?? null,
      specificDate: input.specificDate ? new Date(input.specificDate) : null,
      startTime: input.startTime,
      endTime: input.endTime,
      isAvailable: input.isAvailable ?? true,
      title: input.title ?? null,
      timezone: input.timezone ?? 'Asia/Jakarta',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const existingRules = await this.getAvailabilityRules(trainerId);
    const rulesAfterChange = [...existingRules, virtualRule];
    await this.assertRulesDoNotConflictWithBookings(trainerId, rulesAfterChange);

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

    const updatedRule: TrainerAvailability = {
      ...rule,
      ...(input.startTime && { startTime: input.startTime }),
      ...(input.endTime && { endTime: input.endTime }),
      ...(input.isAvailable != null && { isAvailable: input.isAvailable }),
      ...(input.title != null && { title: input.title }),
    };

    const existingRules = await this.getAvailabilityRules(trainerId);
    const rulesAfterChange = existingRules.map(r => r.id === rule.id ? updatedRule : r);
    await this.assertRulesDoNotConflictWithBookings(trainerId, rulesAfterChange);

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

    const existingRules = await this.getAvailabilityRules(trainerId);
    const rulesAfterChange = existingRules.filter(r => r.id !== ruleId);
    await this.assertRulesDoNotConflictWithBookings(trainerId, rulesAfterChange);

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
    const now = new Date();
    const rules = await this.getAvailabilityRules(trainerId);

    // Fetch existing booked windows for the trainer in the date range
    const rangeStart = new Date(`${startDate}T00:00:00Z`);
    const rangeEnd   = new Date(`${endDate}T23:59:59Z`);

    const existingBookings = await this.prisma.booking.findMany({
      where: {
        trainerId,
        ...buildBlockingBookingWindowWhere(now),
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
      const specificRules = rules.filter(
        (r) => r.specificDate && toDateStr(r.specificDate) === dateStr,
      );
      // 2. Fall back to weekly dayOfWeek rules
      const weeklyRules = rules.filter((r) => r.dayOfWeek === dow && !r.specificDate);
      const activeRules = specificRules.length > 0 ? specificRules : weeklyRules;

      const allowedRules = activeRules.filter((r) => r.isAvailable);
      const blockedRules = activeRules.filter((r) => !r.isAvailable);

      for (const activeRule of allowedRules) {
        const dayStart = toMinutes(activeRule.startTime);
        const dayEnd   = toMinutes(activeRule.endTime);

        // Generate slot windows
        for (let t = dayStart; t + slotDurationMinutes <= dayEnd; t += slotDurationMinutes) {
          const slotStart = buildUtcDate(dateStr, minutesToLabel(t));
          const slotEnd   = buildUtcDate(dateStr, minutesToLabel(t + slotDurationMinutes));

          // Check if this slot overlaps with any blocked rule for the day
          const isBlockedByRule = blockedRules.some((br) => {
            const brStart = toMinutes(br.startTime);
            const brEnd   = toMinutes(br.endTime);
            return t < brEnd && (t + slotDurationMinutes) > brStart;
          });

          if (isBlockedByRule) continue;

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
    const now = new Date();
    const conflict = await this.prisma.booking.findFirst({
      where: {
        trainerId,
        ...buildBlockingBookingWindowWhere(now),
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

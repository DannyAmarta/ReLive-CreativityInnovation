"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import { X, User, Clock, CreditCard, Filter, CalendarDays, ChevronDown, ExternalLink, CalendarClock, CircleSlash } from "lucide-react";
import type { BookingRecord } from "@/lib/marketplace";
import { formatIDR, formatDateTime } from "@/lib/format";
import Link from "next/link";
import type { RescheduleRequest, CancellationRequest } from "./ClientBookingTabs";

// ─── Status color map ─────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  PENDING: "#c77a5a",   // Terracotta
  ACTIVE: "#4a5d3e",    // Sage
  COMPLETED: "#6c7662", // Muted Sage
  DISPUTED: "#c53030",  // Crimson
  CANCELLED: "#9ca3af", // Gray
  REJECTED: "#d1d5db",  // Light Gray
};

// ─── Event Detail Drawer ──────────────────────────────────────────────────────
function BookingDrawer({
  booking,
  onClose,
}: {
  booking: BookingRecord;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isVideoLinkActive = booking.status === "ACTIVE" && booking.meetingLink;

  const trainerName = booking.trainer?.user?.name ?? "Trainer";
  const trainerAvatar = booking.trainer?.user?.avatar;

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <div
              className="size-3 rounded-full"
              style={{ background: STATUS_COLORS[booking.status] ?? "#6c7662" }}
            />
            <span className="text-sm font-semibold text-primary-deep">{booking.status}</span>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 hover:bg-muted transition-colors">
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            {trainerAvatar ? (
              <img
                src={trainerAvatar}
                alt={trainerName}
                className="size-12 rounded-2xl object-cover border border-border"
              />
            ) : (
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[rgba(74,93,62,0.1)] text-[#4a5d3e] text-lg font-bold">
                {trainerName.slice(0, 1)}
              </div>
            )}
            <div>
              <p className="font-semibold text-primary-deep">{trainerName}</p>
              <p className="text-xs text-muted-foreground">Your Trainer</p>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-border bg-muted/30 p-4 text-sm">
            <Row icon={<User className="size-4" />} label="Service" value={booking.service?.title ?? "—"} />
            <Row icon={<Clock className="size-4" />} label="Time" value={
              booking.scheduledStart
                ? `${formatDateTime(booking.scheduledStart)} – ${formatDateTime(booking.scheduledEnd ?? "")}`
                : "Not scheduled"
            } />
            <Row icon={<CreditCard className="size-4" />} label="Payment" value={
              booking.paymentType === "FIAT"
                ? formatIDR(booking.fiatAmount ?? booking.servicePriceIdr ?? 0)
                : `${booking.paymentType ?? "—"}`
            } />
          </div>

          {/* Join Session Link */}
          {isVideoLinkActive && (
            <a
              href={booking.meetingLink!}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#4a5d3e] py-3 text-sm font-semibold text-white hover:bg-[#3a4d2e] transition-colors shadow-glow"
            >
              <ExternalLink className="size-4" /> Join Session Call
            </a>
          )}

          {/* Client Actions: Reschedule & Cancellation */}
          {(booking.status === "ACTIVE" || booking.status === "PENDING") && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href="/client/bookings/reschedule"
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-border py-2.5 text-xs font-semibold text-primary hover:bg-muted transition-colors"
              >
                <CalendarClock className="size-3.5" />
                Reschedule
              </Link>
              <Link
                href="/client/bookings/cancel"
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-border py-2.5 text-xs font-semibold text-destructive hover:bg-red-50 transition-colors"
              >
                <CircleSlash className="size-3.5" />
                Cancel Session
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className="text-muted-foreground w-20 shrink-0">{label}</span>
      <span className="font-medium text-primary-deep flex-1 text-right truncate">{value}</span>
    </div>
  );
}

// ─── Main Calendar View ───────────────────────────────────────────────────────
export function ClientCalendarView({
  initialBookings,
  rescheduleRequests = [],
  cancellationRequests = [],
}: {
  initialBookings: BookingRecord[];
  rescheduleRequests?: RescheduleRequest[];
  cancellationRequests?: CancellationRequest[];
}) {
  const calendarRef = useRef<FullCalendar>(null);

  const [bookings] = useState<BookingRecord[]>(initialBookings);
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);

  // Filters State
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([
    "PENDING",
    "ACTIVE",
    "COMPLETED",
    "CANCELLED",
    "DISPUTED",
    "REJECTED"
  ]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  // Map and filter bookings to FullCalendar events
  const filteredEvents = useMemo(() => {
    return bookings
      .filter((b) => b.scheduledStart && b.scheduledEnd)
      .map((b) => {
        const evStart = dayjs(b.scheduledStart);
        const evEnd = dayjs(b.scheduledEnd);

        // Compute display status dynamically based on pending proposals
        const pendingReschedule = rescheduleRequests.find(
          (r) => r.bookingId === b.id && r.status === "PENDING"
        );
        const pendingCancellation = cancellationRequests.find(
          (r) => r.bookingId === b.id && r.status === "PENDING"
        );
        const displayStatus = (pendingReschedule || pendingCancellation) ? "PENDING" : b.status;

        // Status check against displayStatus
        if (!selectedStatuses.includes(displayStatus)) return null;

        // Start Date check: event end time must be at or after filter start date
        if (startDate && evEnd.isBefore(dayjs(startDate).startOf("day"))) return null;

        // End Date check: event start time must be at or before filter end date
        if (endDate && evStart.isAfter(dayjs(endDate).endOf("day"))) return null;

        const trainerName = b.trainer?.user?.name ?? "Trainer";

        const modifiedBooking = {
          ...b,
          status: displayStatus,
        };

        return {
          id: String(b.id),
          title: `${b.service?.title ?? "Session"} with ${trainerName}`,
          start: b.scheduledStart!,
          end: b.scheduledEnd!,
          backgroundColor: STATUS_COLORS[displayStatus] ?? "#6c7662",
          borderColor: "transparent",
          extendedProps: {
            booking: modifiedBooking,
            status: displayStatus,
          },
        };
      })
      .filter((e) => e !== null) as any[];
  }, [bookings, rescheduleRequests, cancellationRequests, selectedStatuses, startDate, endDate]);

  const handleEventClick = useCallback((info: any) => {
    const booking = info.event.extendedProps.booking;
    if (booking) {
      setSelectedBooking(booking);
    }
  }, []);

  return (
    <div className="space-y-6">
      {selectedBooking && (
        <BookingDrawer
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      {/* Scoped CSS styling overrides for FullCalendar elements */}
      <style>{`
        .relive-fullcalendar-container .fc {
          font-family: 'Nunito', sans-serif;
          border: none;
          background: transparent;
        }
        .relive-fullcalendar-container .fc-theme-standard .fc-scrollgrid,
        .relive-fullcalendar-container .fc-theme-standard td,
        .relive-fullcalendar-container .fc-theme-standard th {
          border: 1px solid rgba(88, 120, 74, 0.1) !important;
        }
        .relive-fullcalendar-container .fc-col-header-cell {
          background: rgba(74, 93, 62, 0.05);
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #4a5d3e;
          padding: 10px 0;
        }
        .relive-fullcalendar-container .fc-daygrid-day-frame {
          background: rgba(255, 252, 245, 0.35);
          border-radius: 14px;
          margin: 3px;
          border: 1px solid rgba(88, 120, 74, 0.08);
          transition: all 0.25s ease;
          min-height: 105px;
        }
        .relive-fullcalendar-container .fc-daygrid-day-frame:hover {
          background: rgba(255, 252, 245, 0.85);
          box-shadow: var(--shadow-card);
          border-color: rgba(88, 120, 74, 0.2);
        }
        .relive-fullcalendar-container .fc-day-today .fc-daygrid-day-frame {
          background: rgba(74, 93, 62, 0.08) !important;
          border: 1.5px solid #4a5d3e !important;
          box-shadow: 0 4px 16px rgba(74, 93, 62, 0.1) !important;
        }
        .relive-fullcalendar-container .fc-daygrid-day-number {
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 0.85rem;
          color: #233126;
          margin: 6px;
        }
        .relive-fullcalendar-container .fc-day-today .fc-daygrid-day-number {
          background: #4a5d3e;
          color: #fff !important;
          width: 24px;
          height: 24px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        .relive-fullcalendar-container .fc-event {
          border-radius: 8px;
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
          cursor: pointer;
          margin: 1px 3px !important;
          padding: 0 !important;
          opacity: 1 !important;
        }
        .relive-fullcalendar-container .fc-event:hover .relive-chip {
          filter: brightness(1.08);
          box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        }
        .relive-fullcalendar-container .fc-daygrid-event-harness {
          margin: 2px 0 !important;
        }
        .relive-chip {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 3px 7px;
          border-radius: 7px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          transition: filter 0.15s ease, box-shadow 0.15s ease;
          overflow: hidden;
          white-space: nowrap;
        }
        .relive-chip-time {
          font-size: 0.62rem;
          font-weight: 700;
          opacity: 0.85;
          shrink: 0;
        }
        .relive-chip-title {
          font-size: 0.72rem;
          font-weight: 700;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .relive-fullcalendar-container .fc-toolbar {
          margin-bottom: 1.5rem !important;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        .relive-fullcalendar-container .fc-toolbar-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.35rem;
          font-weight: 800;
          color: #233126;
          letter-spacing: -0.02em;
        }
        .relive-fullcalendar-container .fc-button {
          background: rgba(255, 252, 245, 0.9) !important;
          color: #4a5d3e !important;
          border: 1px solid rgba(88, 120, 74, 0.2) !important;
          border-radius: 14px !important;
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 0.8rem !important;
          padding: 7px 14px !important;
          transition: all 0.2s ease !important;
          box-shadow: 0 2px 4px rgba(50, 63, 43, 0.04) !important;
          text-transform: capitalize !important;
        }
        .relive-fullcalendar-container .fc-button:hover {
          background: rgba(74, 93, 62, 0.08) !important;
          border-color: #4a5d3e !important;
        }
        .relive-fullcalendar-container .fc-button-active {
          background: #4a5d3e !important;
          color: #fff !important;
          border-color: #4a5d3e !important;
        }
        .relive-fullcalendar-container .fc-button:focus {
          box-shadow: 0 0 0 3px rgba(74, 93, 62, 0.2) !important;
        }
        .relive-fullcalendar-container .fc-scroller {
          scrollbar-width: thin;
          scrollbar-color: rgba(88, 120, 74, 0.2) transparent;
        }
        .relive-fullcalendar-container .fc-theme-standard .fc-list {
          border: none !important;
          background: transparent !important;
        }
        .relive-fullcalendar-container .fc-list-day-cushion {
          background: rgba(74, 93, 62, 0.05) !important;
        }
        .relive-fullcalendar-container .fc-list-event:hover td {
          background: rgba(74, 93, 62, 0.04) !important;
        }
      `}</style>

      {/* Filter Section Card */}
      <div className="glass-card-elevated p-6 space-y-4">
        <div className="flex flex-wrap gap-5 items-end">
          {/* Status Multi-Select */}
          <div className="flex-1 min-w-[220px] space-y-1.5 relative">
            <label className="text-xs font-bold uppercase tracking-wider text-[#4a5d3e] flex items-center gap-1.5">
              <Filter className="size-3.5" /> Filter Status
            </label>
            <div>
              <button
                type="button"
                onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                className="w-full flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-left font-medium text-primary-deep outline-none hover:bg-muted/40 transition-colors"
              >
                <span className="truncate">
                  {selectedStatuses.length === 0
                    ? "None selected"
                    : selectedStatuses.length === Object.keys(STATUS_COLORS).length
                    ? "All Statuses"
                    : `${selectedStatuses.length} Statuses selected`}
                </span>
                <ChevronDown className={`size-4 text-muted-foreground transform transition-transform ${statusMenuOpen ? "rotate-180" : ""}`} />
              </button>
              
              {statusMenuOpen && (
                <>
                  <div className="fixed inset-0 z-15" onClick={() => setStatusMenuOpen(false)} />
                  <div className="absolute left-0 mt-2 w-full min-w-[220px] z-20 rounded-2xl border border-border bg-card shadow-xl p-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    {Object.keys(STATUS_COLORS).map((status) => {
                      const isSelected = selectedStatuses.includes(status);
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            setSelectedStatuses((prev) =>
                              isSelected
                                ? prev.filter((s) => s !== status)
                                : [...prev, status]
                            );
                          }}
                          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-left hover:bg-muted/60 transition-colors font-medium"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="rounded border-border text-[#4a5d3e] focus:ring-[#4a5d3e]"
                          />
                          <div className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[status] }} />
                          <span className="text-primary-deep flex-1 text-xs">{status}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Start Date */}
          <div className="flex-1 min-w-[160px] space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#4a5d3e] flex items-center gap-1.5">
              <CalendarDays className="size-3.5" /> Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-primary-deep outline-none focus:border-[#4a5d3e] focus:ring-2 focus:ring-[rgba(74,93,62,0.2)] transition-all"
            />
          </div>

          {/* End Date */}
          <div className="flex-1 min-w-[160px] space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#4a5d3e] flex items-center gap-1.5">
              <CalendarDays className="size-3.5" /> End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-primary-deep outline-none focus:border-[#4a5d3e] focus:ring-2 focus:ring-[rgba(74,93,62,0.2)] transition-all"
            />
          </div>

          {/* Reset Filters */}
          {(selectedStatuses.length !== Object.keys(STATUS_COLORS).length || startDate || endDate) && (
            <button
              onClick={() => {
                setSelectedStatuses(Object.keys(STATUS_COLORS));
                setStartDate("");
                setEndDate("");
              }}
              className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold hover:bg-muted text-muted-foreground transition-colors self-end h-[44px]"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Color Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-border/60">
          <span className="text-xs font-semibold text-muted-foreground">Legend:</span>
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <div className="size-2.5 rounded-full" style={{ background: color }} />
              {status}
            </div>
          ))}
          <span className="ml-auto text-xs text-muted-foreground hidden sm:inline">Click any session to view details</span>
        </div>
      </div>

      {/* Calendar Wrapper */}
      <div className="relive-panel p-6 relive-fullcalendar-container">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,listWeek",
          }}
          events={filteredEvents}
          eventClick={handleEventClick}
          editable={false}
          dayMaxEvents={true}
          height="auto"
          eventContent={(arg) => {
            const status: string = arg.event.extendedProps.status ?? "ACTIVE";
            const color = STATUS_COLORS[status] ?? "#4a5d3e";
            const textColor = ["CANCELLED", "REJECTED"].includes(status) ? "#374151" : "#ffffff";
            const timeText = arg.timeText;
            const title = arg.event.title;
            return (
              <div
                className="relive-chip"
                style={{ backgroundColor: color, color: textColor }}
                title={title}
              >
                {timeText && (
                  <span className="relive-chip-time">{timeText}</span>
                )}
                <span className="relive-chip-title">{title}</span>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}

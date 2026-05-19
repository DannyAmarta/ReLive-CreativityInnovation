"use client";

import { useState, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { id } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CheckCircle2, X, AlertTriangle, User, Clock, CreditCard, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import type { BookingRecord } from "@/lib/marketplace";
import { formatIDR, formatDateTime } from "@/lib/format";
import { authFetchGraphql } from "@/lib/fetchGraphQL";
import { print } from "graphql";
import { UPDATE_BOOKING_STATUS_MUTATION } from "@/lib/gqlQueries";
import { useRouter } from "next/navigation";

// ─── Localizer ────────────────────────────────────────────────────────────────
const locales = { id };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// ─── Status color map ─────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  PENDING: "#c77a5a",
  ACTIVE: "#4a5d3e",
  COMPLETED: "#6c7662",
  DISPUTED: "#c53030",
  CANCELLED: "#9ca3af",
  REJECTED: "#d1d5db",
};

type CalendarEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: BookingRecord;
  color: string;
};

function bookingsToEvents(bookings: BookingRecord[]): CalendarEvent[] {
  return bookings
    .filter((b) => b.scheduledStart && b.scheduledEnd)
    .map((b) => ({
      id: b.id,
      title: `${b.client?.name ?? "Client"} — ${b.service?.title ?? "Session"}`,
      start: new Date((b as any).scheduledStart),
      end: new Date((b as any).scheduledEnd),
      resource: b,
      color: STATUS_COLORS[b.status] ?? "#6c7662",
    }));
}

// ─── Event Detail Drawer ──────────────────────────────────────────────────────
function BookingDrawer({
  booking,
  onClose,
  onAction,
}: {
  booking: BookingRecord;
  onClose: () => void;
  onAction: (id: number, status: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  async function handle(status: string) {
    setLoading(true);
    try {
      await onAction(booking.id, status);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <div
              className="size-3 rounded-full"
              style={{ background: STATUS_COLORS[booking.status] }}
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
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[rgba(74,93,62,0.1)] text-[#4a5d3e] text-lg font-bold">
              {booking.client?.name?.slice(0, 1) ?? "C"}
            </div>
            <div>
              <p className="font-semibold text-primary-deep">{booking.client?.name ?? "Client"}</p>
              <p className="text-xs text-muted-foreground">{booking.client?.email}</p>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-border bg-muted/30 p-4 text-sm">
            <Row icon={<User className="size-4" />} label="Service" value={booking.service?.title ?? "—"} />
            <Row icon={<Clock className="size-4" />} label="Time" value={
              (booking as any).scheduledStart
                ? `${formatDateTime((booking as any).scheduledStart)} – ${formatDateTime((booking as any).scheduledEnd)}`
                : "Not scheduled"
            } />
            <Row icon={<CreditCard className="size-4" />} label="Payment" value={
              booking.paymentType === "FIAT"
                ? formatIDR(booking.fiatAmount ?? booking.servicePriceIdr ?? 0)
                : `${booking.paymentType ?? "—"}`
            } />
          </div>

          {booking.status === "PENDING" && (
            <>
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3">
                <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700">
                  Accepting will confirm the session. Rejecting will cancel the booking and notify the client.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handle("REJECTED")}
                  disabled={loading}
                  className="flex-1 rounded-2xl border border-border py-3 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => handle("ACTIVE")}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#4a5d3e] py-3 text-sm font-semibold text-white hover:bg-[#3a4d2e] transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="size-4" /> Accept
                </button>
              </div>
            </>
          )}

          {booking.status === "ACTIVE" && (
            <button
              onClick={() => handle("COMPLETED")}
              disabled={loading}
              className="w-full rounded-2xl bg-[#4a5d3e] py-3 text-sm font-semibold text-white hover:bg-[#3a4d2e] transition-colors disabled:opacity-50"
            >
              Mark as Completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-muted-foreground w-20 shrink-0">{label}</span>
      <span className="font-medium text-primary-deep flex-1 text-right">{value}</span>
    </div>
  );
}

// ─── Main Calendar View ───────────────────────────────────────────────────────
export function TrainerCalendarView({ initialBookings }: { initialBookings: BookingRecord[] }) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings);
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());

  const events = bookingsToEvents(bookings);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedBooking(event.resource);
  }, []);

  async function handleStatusAction(bookingId: number, status: string) {
    try {
      await authFetchGraphql(print(UPDATE_BOOKING_STATUS_MUTATION), {
        input: { bookingId, newStatus: status },
      });
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b)),
      );
      toast.success(`Booking ${status === "ACTIVE" ? "accepted" : status === "REJECTED" ? "rejected" : "completed"} successfully`);
      router.refresh();
    } catch (err) {
      toast.error((err as any)?.message ?? "Action failed");
    }
  }

  const eventStyleGetter = useCallback((event: CalendarEvent) => ({
    style: {
      backgroundColor: event.color,
      borderRadius: "10px",
      border: "none",
      color: "#fff",
      fontSize: "12px",
      fontWeight: 600,
      padding: "2px 6px",
    },
  }), []);

  return (
    <>
      {selectedBooking && (
        <BookingDrawer
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onAction={handleStatusAction}
        />
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="size-2.5 rounded-full" style={{ background: color }} />
            {status}
          </div>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">Click any session to view details or accept/reject</span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setDate(new Date())} className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors">Today</button>
          <button onClick={() => {
            const d = new Date(date);
            view === "week" ? d.setDate(d.getDate() - 7) : d.setMonth(d.getMonth() - 1);
            setDate(d);
          }} className="rounded-xl border border-border p-1.5 hover:bg-muted transition-colors">
            <ChevronLeft className="size-4" />
          </button>
          <button onClick={() => {
            const d = new Date(date);
            view === "week" ? d.setDate(d.getDate() + 7) : d.setMonth(d.getMonth() + 1);
            setDate(d);
          }} className="rounded-xl border border-border p-1.5 hover:bg-muted transition-colors">
            <ChevronRight className="size-4" />
          </button>
          <span className="text-sm font-semibold text-primary-deep">
            {format(date, view === "week" ? "MMMM yyyy" : "MMMM yyyy")}
          </span>
        </div>
        <div className="flex rounded-xl border border-border overflow-hidden text-xs font-semibold">
          {([Views.WEEK, Views.DAY, Views.MONTH] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 capitalize transition-colors ${view === v ? "bg-[#4a5d3e] text-white" : "hover:bg-muted text-muted-foreground"}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden" style={{ height: 620 }}>
        <Calendar
          localizer={localizer}
          events={events}
          view={view}
          date={date}
          onView={setView}
          onNavigate={setDate}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          toolbar={false}
          startAccessor="start"
          endAccessor="end"
        />
      </div>
    </>
  );
}

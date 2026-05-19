"use client";

import { useState, useEffect, useTransition } from "react";
import { format, addDays } from "date-fns";
import { Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
import { getAvailableSlots, AvailableSlot } from "@/lib/actions/availability";
import { CryptoBookingButton, FiatBookingButton } from "./BookingButtons";
import { formatIDR, formatUSDC } from "@/lib/format";

type Service = {
  id: number;
  title: string;
  description: string;
  priceInIdr?: number | null;
  priceInLamports?: number | null;
};

export function ServiceBookingFlow({ service, trainerId }: { service: Service; trainerId: number }) {
  const [dateStr, setDateStr] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load slots when date changes
  useEffect(() => {
    setSelectedSlot(null); // Reset selection
    startTransition(async () => {
      const res = await getAvailableSlots(trainerId, dateStr, dateStr);
      setSlots(res);
    });
  }, [trainerId, dateStr]);

  // Generate the next 14 days for the horizontal date picker
  const dates = Array.from({ length: 14 }).map((_, i) => {
    const d = addDays(new Date(), i);
    return {
      iso: format(d, "yyyy-MM-dd"),
      dayOfWeek: format(d, "EEE"), // Mon
      dayOfMonth: format(d, "d"), // 15
    };
  });

  const tokenUnits = service.priceInLamports ? (service.priceInLamports / 1e9) : 0; // naive conversion for UI

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      {/* 1. Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-bold text-primary-deep">{service.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">{service.priceInLamports ? formatUSDC(tokenUnits) : ""}</p>
          <p className="font-display text-lg font-bold text-primary">
            {service.priceInIdr ? formatIDR(service.priceInIdr) : "IDR not set"}
          </p>
        </div>
      </div>

      {/* 2. Date Picker (Horizontal Scroll) */}
      <div className="mt-6 border-t border-border pt-5">
        <p className="text-sm font-semibold text-primary-deep flex items-center gap-1.5 mb-3">
          <CalendarIcon className="size-4 text-muted-foreground" /> Select Date
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {dates.map((d) => {
            const isSelected = dateStr === d.iso;
            return (
              <button
                key={d.iso}
                onClick={() => setDateStr(d.iso)}
                className={`flex-none snap-start w-14 rounded-xl border py-2 text-center transition-all ${
                  isSelected
                    ? "border-[#4a5d3e] bg-[rgba(74,93,62,0.08)] text-[#4a5d3e]"
                    : "border-border bg-background hover:bg-muted text-muted-foreground"
                }`}
              >
                <span className="block text-[10px] font-semibold uppercase">{d.dayOfWeek}</span>
                <span className={`block text-lg font-bold mt-0.5 ${isSelected ? "text-[#4a5d3e]" : "text-foreground"}`}>
                  {d.dayOfMonth}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Time Slots Grid */}
      <div className="mt-4">
        <p className="text-sm font-semibold text-primary-deep flex items-center gap-1.5 mb-3">
          <Clock className="size-4 text-muted-foreground" /> Time Slots
        </p>
        {isPending ? (
          <div className="flex justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : slots.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-muted/40 rounded-xl p-4 text-center">
            No availability on this date.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot) => {
              const isSelected = selectedSlot?.start === slot.start;
              return (
                <button
                  key={slot.start}
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-all ${
                    isSelected
                      ? "border-[#4a5d3e] bg-[#4a5d3e] text-white"
                      : "border-border bg-background text-foreground hover:border-primary/40"
                  }`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Payment Buttons (Only show when slot is selected) */}
      {selectedSlot && (
        <div className="mt-6 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2 rounded-lg mb-3">
            You are booking: <span className="font-semibold">{format(new Date(selectedSlot.start), "MMM d, yyyy")}</span> at <span className="font-semibold">{selectedSlot.label}</span>
          </div>
          {service.priceInLamports ? (
            <CryptoBookingButton
              service={service as any}
              trainerId={trainerId}
              slot={selectedSlot}
            />
          ) : null}
          {service.priceInIdr ? (
            <FiatBookingButton
              service={service as any}
              trainerId={trainerId}
              slot={selectedSlot}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

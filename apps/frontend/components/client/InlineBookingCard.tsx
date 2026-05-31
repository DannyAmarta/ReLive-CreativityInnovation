"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { format, isBefore, startOfToday } from "date-fns";
import { Calendar as CalendarIcon, Clock, Loader2, MessageSquare, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { getAvailableSlots, AvailableSlot } from "@/lib/actions/availability";
import { CryptoBookingButton, FiatBookingButton } from "@/components/relive/BookingButtons";
import { formatIDR, formatUSDC } from "@/lib/format";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";

type Service = {
  id: number;
  title: string;
  description: string;
  priceInIdr?: number | null;
  priceInLamports?: number | null;
  tokenMintAddress?: string | null;
  isActive: boolean;
};

interface InlineBookingCardProps {
  services: Service[];
  trainerId: number;
  trainerName: string;
}

export function InlineBookingCard({ services, trainerId, trainerName }: InlineBookingCardProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(
    services.length > 0 ? services[0] : null
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [isPending, startTransition] = useTransition();
  const [currentWIBTime, setCurrentWIBTime] = useState("");

  // Live WIB clock — ticks every second
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentWIBTime(
        now.toLocaleTimeString("id-ID", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Reset selected slot and load slots when selected date or service changes
  useEffect(() => {
    if (!selectedService || !selectedDate) {
      setSlots([]);
      setSelectedSlot(null);
      return;
    }

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    setSelectedSlot(null); // Reset slot selection

    startTransition(async () => {
      try {
        const res = await getAvailableSlots(trainerId, dateStr, dateStr);
        // Filter out slots that have already ended
        const futureSlots = res.filter(slot => new Date(slot.end).getTime() > Date.now());
        setSlots(futureSlots);
      } catch (err) {
        console.error("Failed to load available slots", err);
        setSlots([]);
      }
    });
  }, [trainerId, selectedDate, selectedService]);

  if (!selectedService) {
    return (
      <div className="glass-card-elevated p-6 text-center border border-dashed border-border/80">
        <AlertCircle className="size-8 text-muted-foreground/50 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No active services available for booking.</p>
      </div>
    );
  }

  const tokenUnits = selectedService.priceInLamports ? selectedService.priceInLamports / 1e9 : 0;
  const today = startOfToday();

  return (
    <div className="glass-card-elevated p-6 space-y-6 md:sticky md:top-6 h-fit transition-all duration-300">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-lg font-bold text-primary-deep tracking-tight">
              Book a Session
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select a service, choose a date and time, and confirm your workout
            </p>
          </div>
          {/* Live WIB clock */}
          {currentWIBTime && (
            <div className="shrink-0 flex items-center gap-1.5 bg-[#4a5d3e]/8 border border-[#4a5d3e]/20 rounded-xl px-2.5 py-1.5">
              <Clock className="size-3 text-[#4a5d3e]" />
              <span className="text-[11px] font-bold text-[#4a5d3e] tabular-nums tracking-tight">
                {currentWIBTime}
              </span>
              <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">WIB</span>
            </div>
          )}
        </div>
      </div>

      {/* Step 1: Service Selector */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-primary-soft block">
          1. Select Service
        </label>
        <div className="grid gap-2.5">
          {services.map((service) => {
            const isSelected = selectedService.id === service.id;
            const sTokenUnits = service.priceInLamports ? service.priceInLamports / 1e9 : 0;
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => {
                  setSelectedService(service);
                  setSelectedDate(undefined);
                  setSelectedSlot(null);
                }}
                className={`w-full text-left rounded-2xl border p-4 transition-all duration-200 active:scale-[0.99] flex flex-col justify-between gap-2 ${
                  isSelected
                    ? "border-[#4a5d3e] bg-[#4a5d3e]/[0.03] shadow-sm"
                    : "border-border bg-white/40 hover:bg-white/70 hover:border-border/80"
                }`}
              >
                <div className="flex justify-between items-start w-full gap-3">
                  <h4 className={`text-sm font-bold leading-snug transition-colors ${
                    isSelected ? "text-[#4a5d3e]" : "text-foreground"
                  }`}>
                    {service.title}
                  </h4>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-primary block">
                      {service.priceInIdr ? formatIDR(service.priceInIdr) : "IDR not set"}
                    </span>
                    {service.priceInLamports && (
                      <span className="text-[10px] text-muted-foreground block font-medium">
                        {formatUSDC(sTokenUnits)}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {service.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Date Selector (Month View) */}
      <div className="space-y-2.5 border-t border-border/40 pt-5">
        <label className="text-xs font-bold uppercase tracking-wider text-primary-soft flex items-center gap-1.5">
          <CalendarIcon className="size-3.5" /> 2. Select Date
        </label>
        <div className="flex justify-center border border-border/60 rounded-2xl bg-white/40 p-2">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => isBefore(date, today)}
            className="w-full justify-center"
            classNames={{
              day_selected: "bg-[#4a5d3e] text-white hover:bg-[#3a4d2e] hover:text-white focus:bg-[#4a5d3e] focus:text-white rounded-xl font-bold",
              day_today: "border border-[#4a5d3e]/30 text-[#4a5d3e] font-semibold rounded-xl bg-[#4a5d3e]/5",
              day: "h-9 w-9 p-0 font-medium hover:bg-muted hover:rounded-xl rounded-xl transition-all text-xs",
              head_cell: "text-muted-foreground rounded-md w-9 font-bold text-[10px] uppercase tracking-wider py-1.5",
              cell: "h-9 w-9 text-center p-0 relative focus-within:z-20",
            }}
          />
        </div>
      </div>

      {/* Step 3: Time Slots Grid */}
      <div className="space-y-2.5 border-t border-border/40 pt-5">
        <label className="text-xs font-bold uppercase tracking-wider text-primary-soft flex items-center gap-1.5">
          <Clock className="size-3.5" /> 3. Available Slots
        </label>
        {currentWIBTime && (
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Info className="size-3 shrink-0" />
            Slots before current time (<span className="font-semibold text-[#4a5d3e]">{currentWIBTime} WIB</span>) are hidden automatically.
          </p>
        )}
        
        {!selectedDate ? (
          <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-4 border border-border/40 text-center justify-center">
            <Info className="size-4 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground font-medium">
              Please choose a date from the calendar.
            </p>
          </div>
        ) : isPending ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Loader2 className="size-6 animate-spin text-[#4a5d3e]" />
            <p className="text-xs text-muted-foreground">Checking slots...</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-6 px-4 border border-dashed border-terracotta-200 rounded-2xl bg-terracotta-50/40 space-y-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-terracotta-100 text-terracotta-600 mx-auto">
              <CalendarIcon className="size-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-terracotta-700 uppercase tracking-wide">
                No Available Slots
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {trainerName} is fully booked or has not scheduled availability for {format(selectedDate, "PPP")}.
              </p>
            </div>

          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {slots.map((slot) => {
              const isSelected = selectedSlot?.start === slot.start;
              return (
                <button
                  key={slot.start}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${
                    isSelected
                      ? "border-[#4a5d3e] bg-[#4a5d3e] text-white shadow-lift"
                      : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted/10"
                  }`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Step 4: Confirm & Payment */}
      {selectedSlot && selectedDate && (
        <div className="border-t border-border/40 pt-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-[#4a5d3e]/5 border border-[#4a5d3e]/15 text-[#4a5d3e] text-xs px-3.5 py-3 rounded-2xl flex items-start gap-2">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-[#4a5d3e]" />
            <div>
              <p className="font-semibold">Selected Booking Details:</p>
              <p className="text-muted-foreground mt-0.5 font-medium">
                {format(selectedDate, "eeee, MMMM d, yyyy")}
              </p>
              <p className="text-muted-foreground font-medium">
                at {selectedSlot.label} (60 mins)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {selectedService.priceInIdr && (
              <FiatBookingButton
                service={selectedService as any}
                trainerId={trainerId}
                slot={selectedSlot}
              />
            )}
            {selectedService.priceInLamports && (
              <CryptoBookingButton
                service={selectedService as any}
                trainerId={trainerId}
                trainerName={trainerName}
                slot={selectedSlot}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

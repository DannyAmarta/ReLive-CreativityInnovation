"use client";

import { useState, useEffect } from "react";
import { proposeRescheduleAction } from "@/lib/actions/marketplace";
import { CalendarDays, Clock, MessageSquare, Send } from "lucide-react";

interface ClientRescheduleFormProps {
  bookingId: number;
  timezone: string;
  redirectTo: string;
}

export function ClientRescheduleForm({
  bookingId,
  timezone,
  redirectTo,
}: ClientRescheduleFormProps) {
  // Get tomorrow's date string as the default min date
  const getTomorrowStr = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split("T")[0];
  };

  const [date, setDate] = useState(getTomorrowStr());
  const [startHour, setStartHour] = useState("09");
  const [endHour, setEndHour] = useState("10");

  const handleStartChange = (val: string) => {
    setStartHour(val);
    const startNum = parseInt(val, 10);
    const nextHour = (startNum + 1) % 24;
    setEndHour(nextHour.toString().padStart(2, "0"));
  };

  const handleEndChange = (val: string) => {
    setEndHour(val);
    const endNum = parseInt(val, 10);
    const prevHour = (endNum - 1 + 24) % 24;
    setStartHour(prevHour.toString().padStart(2, "0"));
  };

  // Construct ISO datetime-local strings
  const proposedStart = `${date}T${startHour}:00`;
  // If end hour is smaller or equal to start hour, it means it crosses into the next day
  const getEndDateTime = () => {
    const startNum = parseInt(startHour, 10);
    const endNum = parseInt(endHour, 10);
    if (endNum <= startNum) {
      // Add 1 day to the end date
      const d = new Date(date);
      d.setDate(d.getDate() + 1);
      const dateStr = d.toISOString().split("T")[0];
      return `${dateStr}T${endHour}:00`;
    }
    return `${date}T${endHour}:00`;
  };

  const proposedEnd = getEndDateTime();

  // Generate 24 hourly options
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));

  return (
    <form
      action={proposeRescheduleAction}
      className="mt-6 space-y-6 rounded-2xl border border-border bg-gradient-to-b from-card to-muted/20 p-6 shadow-sm"
    >
      {/* Hidden Fields for Server Action */}
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="timezone" value={timezone} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input type="hidden" name="proposedStart" value={proposedStart} />
      <input type="hidden" name="proposedEnd" value={proposedEnd} />

      {/* Form Content */}
      <div className="space-y-4">
        {/* Date Picker Row */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-primary" />
            Select Reschedule Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={date}
              min={getTomorrowStr()}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Start and End Times Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Start Time Select */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Start Time (Hourly)
            </label>
            <select
              value={startHour}
              onChange={(e) => handleStartChange(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
            >
              {hours.map((h) => (
                <option key={h} value={h}>
                  {h}:00
                </option>
              ))}
            </select>
          </div>

          {/* End Time Select */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              End Time (Hourly)
            </label>
            <select
              value={endHour}
              onChange={(e) => handleEndChange(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
            >
              {hours.map((h) => (
                <option key={h} value={h}>
                  {h}:00
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reason Textarea */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            Reason for Rescheduling
          </label>
          <textarea
            name="reason"
            placeholder="Please provide a brief reason for requesting this reschedule (e.g. shift conflict, personal emergency...)"
            required
            rows={3}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
          />
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all duration-200 active:scale-[0.98] shadow-[0_8px_16px_rgba(74,93,62,0.15)]"
        >
          <Send className="h-4 w-4" />
          Send Proposal
        </button>
      </div>
    </form>
  );
}

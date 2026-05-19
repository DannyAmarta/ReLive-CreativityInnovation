"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function FloatingNotice({
  kind,
  message,
  onClose,
}: {
  kind: "success" | "error" | "info";
  message: string;
  onClose: () => void;
}) {
  const color =
    kind === "success"
      ? "border-sage-200 bg-sage-50 text-sage-800"
      : kind === "error"
      ? "border-terracotta-200 bg-terracotta-50 text-terracotta-800"
      : "border-sky-200 bg-sky-50 text-sky-800";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="mx-auto mb-5 w-full max-w-xl"
    >
      <button
        type="button"
        onClick={onClose}
        className={`w-full rounded-2xl border px-4 py-3 text-left text-sm shadow-sm transition ${color}`}
      >
        {message}
      </button>
    </motion.div>
  );
}

export function PreviewCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-sage-100/70 bg-cream-50/80 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-medium tracking-tight text-olive-900">
        {value}
      </p>
    </div>
  );
}

export function FieldBlock({
  label,
  children,
  error,
}: {
  label: string;
  children: ReactNode;
  error?: string;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-sm font-medium text-olive-700">{label}</span>
      {children}
      {error && <p className="text-xs text-terracotta-600">{error}</p>}
    </label>
  );
}

export function ValidationSummary({ errors }: { errors: string[] }) {
  const uniqueErrors = Array.from(new Set(errors));
  if (uniqueErrors.length === 0) return null;

  return (
    <div className="rounded-2xl border border-terracotta-200 bg-terracotta-50/60 p-4">
      <p className="text-sm font-semibold text-terracotta-800">
        Please fix these fields
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-terracotta-700">
        {uniqueErrors.map((err) => (
          <li key={err}>{err}</li>
        ))}
      </ul>
    </div>
  );
}

export function SetPearlBackground() {
  return (
    <>
      <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-sage-100/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-72 w-72 rounded-full bg-terracotta-100/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-yellow-50/50 blur-3xl" />
    </>
  );
}

export function inputClassName(hasError: boolean) {
  return [
    "w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-olive-900 outline-none transition",
    "placeholder:text-stone-400 focus:border-sage-400 focus:ring-2 focus:ring-sage-200/70",
    hasError ? "border-terracotta-300 focus:ring-terracotta-100" : "border-sage-200",
  ].join(" ");
}

export function primaryButtonClassName(disabled: boolean) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition",
    disabled
      ? "cursor-not-allowed bg-sage-200 text-sage-500"
      : "bg-sage-700 text-white hover:bg-sage-800",
  ].join(" ");
}

export function secondaryButtonClassName(disabled: boolean) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition",
    disabled
      ? "cursor-not-allowed border-sage-200 bg-cream-100 text-stone-400"
      : "border-sage-300 bg-white text-olive-800 hover:bg-sage-50",
  ].join(" ");
}

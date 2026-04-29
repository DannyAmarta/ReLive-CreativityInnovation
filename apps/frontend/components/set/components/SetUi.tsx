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
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="mx-auto mb-4 w-full max-w-xl"
    >
      <button
        type="button"
        onClick={onClose}
        className={[
          "w-full rounded-[1.4rem] border px-4 py-3 text-left text-sm shadow-sm transition",
          kind === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : kind === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-sky-200 bg-sky-50 text-sky-900",
        ].join(" ")}
      >
        {message}
      </button>
    </motion.div>
  );
}

export function PreviewCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">
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
    <label className="space-y-2">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      {children}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </label>
  );
}

export function ValidationSummary({ errors }: { errors: string[] }) {
  const uniqueErrors = Array.from(new Set(errors));

  if (uniqueErrors.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50/80 p-4">
      <p className="text-sm font-semibold text-rose-700">Please fix these fields</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-rose-700">
        {uniqueErrors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  );
}

export function SetPearlBackground() {
  return (
    <>
      <div className="pointer-events-none absolute -left-20 top-14 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-72 w-72 rounded-full bg-sky-200/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-rose-100/40 blur-3xl" />
    </>
  );
}

export function inputClassName(hasError: boolean) {
  return [
    "w-full rounded-[1.2rem] border bg-white px-4 py-3 text-sm text-stone-900 outline-none transition",
    "placeholder:text-stone-400 focus:border-stone-400 focus:ring-2 focus:ring-stone-200",
    hasError ? "border-rose-300 focus:ring-rose-100" : "border-stone-200",
  ].join(" ");
}

export function primaryButtonClassName(disabled: boolean) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-[1.2rem] px-4 py-3 text-sm font-semibold transition",
    disabled
      ? "cursor-not-allowed bg-stone-200 text-stone-500"
      : "bg-stone-950 text-white hover:bg-stone-800",
  ].join(" ");
}

export function secondaryButtonClassName(disabled: boolean) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-[1.2rem] border px-4 py-3 text-sm font-semibold transition",
    disabled
      ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400"
      : "border-stone-300 bg-white text-stone-900 hover:bg-stone-50",
  ].join(" ");
}

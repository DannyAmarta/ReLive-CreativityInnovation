"use client";
import Link from "next/link";

import { useMemo, useState } from "react";
import { MapPin, Search, Star } from "lucide-react";
import { Header } from "@/components/relive/Header";
import { SPECIALTIES, TRAINERS, lowestIdr, type Specialty } from '@/lib/fiat-mock-data';
import { formatIDR } from "@/lib/format";
import { cn } from "@/lib/utils";



export default function TrainersPage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Specialty | "All">("All");

  const results = useMemo(() => {
    return TRAINERS.filter((t) => {
      const matchQ =
        !query ||
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.headline.toLowerCase().includes(query.toLowerCase()) ||
        t.specialties.some((s) => s.toLowerCase().includes(query.toLowerCase()));
      const matchS = active === "All" || t.specialties.includes(active);
      return matchQ && matchS;
    });
  }, [query, active]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <div className="mb-8 max-w-2xl">
          <h1 className="font-display text-3xl font-bold tracking-tight text-primary-deep md:text-4xl">
            Find your trainer
          </h1>
          <p className="mt-2 text-muted-foreground">
            Verified coaches across Indonesia. Book in IDR with GoPay, QRIS, or bank transfer.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or specialty"
              className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-4 text-sm outline-none transition-colors focus:border-primary"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(["All", ...SPECIALTIES] as const).map((s) => (
              <button
                key={s}
                onClick={() => setActive(s)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                  active === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-primary-deep",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          {results.length} trainer{results.length === 1 ? "" : "s"} found
        </p>

        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="font-medium text-primary-deep">No trainers match your search.</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different filter.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((t) => (
              <Link
                key={t.id}
                href={`/client/trainers/${t.id}`}
                className="group block overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={t.photo}
                    alt={t.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg font-bold text-primary-deep">{t.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{t.headline}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                      <span className="font-semibold text-foreground">{t.rating}</span>
                      <span>({t.reviewCount})</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {t.city}
                    </span>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">From</p>
                      <p className="font-display text-base font-bold text-primary">
                        {formatIDR(lowestIdr(t))}
                        <span className="text-xs font-normal text-muted-foreground">/session</span>
                      </p>
                    </div>
                    <span className="rounded-full border border-primary/30 px-3 py-1 text-xs font-semibold text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                      View
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


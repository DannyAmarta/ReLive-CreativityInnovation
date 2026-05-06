"use client";

import Link from "next/link";
import { ArrowRight, Shield, Wallet, Zap } from "lucide-react";
import { Header } from "@/components/relive/Header";
import heroImg from "@/assets/hero.jpg";



export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:gap-16 md:px-6 md:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Now in Indonesia · Pay with GoPay & QRIS
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-primary-deep md:text-6xl">
              Train smarter.<br />
              <span className="text-primary">Pay your way.</span>
            </h1>
            <p className="mt-5 max-w-md text-base text-muted-foreground md:text-lg">
              Book vetted Indonesian coaches in IDR or USDC. Funds are held safely until your session is done — no awkward conversations.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/client/trainers"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Find a trainer <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/trainer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-semibold text-primary-deep hover:border-primary/50"
              >
                I'm a trainer
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6">
              <Stat label="Trainers" value="120+" />
              <Stat label="Sessions / mo" value="3.4k" />
              <Stat label="Avg rating" value="4.92" />
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[var(--shadow-lift)]">
              <img src={heroImg.src} alt="Trainer in studio" className="aspect-[4/5] w-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-lift)] md:block">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Booked</p>
              <p className="font-display text-lg font-bold text-primary">IDR 157,750</p>
              <p className="text-xs text-muted-foreground">Strength · 60 min</p>
            </div>
            <div className="absolute -right-3 top-8 hidden rounded-2xl bg-primary p-4 text-primary-foreground shadow-[var(--shadow-lift)] md:block">
              <p className="text-xs opacity-80">Trainer balance</p>
              <p className="font-display text-lg font-bold">IDR 1,250,000</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 md:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Feature icon={<Wallet className="h-5 w-5" />} title="Pay in IDR" body="GoPay, QRIS, or bank transfer. No crypto wallet required." />
            <Feature icon={<Shield className="h-5 w-5" />} title="Held in escrow" body="Funds release only when you confirm the session is done." />
            <Feature icon={<Zap className="h-5 w-5" />} title="Instant payouts" body="Trainers withdraw to bank or e-wallet from a single dashboard." />
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold text-primary-deep">{value}</p>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</span>
      <h3 className="mt-4 font-display text-lg font-bold text-primary-deep">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}


"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, Loader2, Plus, Sparkles, Wallet, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { registerTrainerFiatAction } from "@/lib/actions/trainerRegistration";

// ─── Step definitions ──────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "About You" },
  { id: 2, label: "Certifications" },
  { id: 3, label: "Payment" },
];

// ─── Left panel gradient blobs ─────────────────────────────────────────────
function BackgroundBlobs() {
  return (
    <>
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#4a5d3e] opacity-20 blur-3xl" />
      <div className="absolute top-1/2 -right-20 w-64 h-64 rounded-full bg-[#c77a5a] opacity-15 blur-3xl" />
      <div className="absolute -bottom-20 left-1/4 w-56 h-56 rounded-full bg-[#4a5d3e] opacity-10 blur-3xl" />
    </>
  );
}

// ─── Stepper ──────────────────────────────────────────────────────────────
function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, i) => {
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center gap-2">
            <div
              className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                done
                  ? "bg-[#4a5d3e] text-white"
                  : active
                    ? "bg-white text-[#4a5d3e] shadow-md"
                    : "bg-white/20 text-white/50"
              }`}
            >
              {done ? <CheckCircle2 className="size-4" /> : step.id}
            </div>
            <span
              className={`text-xs font-medium hidden sm:inline ${
                active ? "text-white" : done ? "text-white/70" : "text-white/40"
              }`}
            >
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-px mx-1 ${done ? "bg-white/60" : "bg-white/20"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Certification tag input ───────────────────────────────────────────────
function CertTagInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function add() {
    const trimmed = input.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setInput("");
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="e.g. NSCA-CPT, ACSM, Yoga Alliance RYT-200…"
          className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none ring-0 focus:border-[#4a5d3e] focus:ring-2 focus:ring-[rgba(74,93,62,0.2)] transition-all"
        />
        <button
          type="button"
          onClick={add}
          className="flex size-12 items-center justify-center rounded-xl bg-[#4a5d3e] text-white hover:bg-[#3a4d2e] transition-colors"
        >
          <Plus className="size-4" />
        </button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((cert) => (
            <span
              key={cert}
              className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(74,93,62,0.25)] bg-[rgba(74,93,62,0.08)] px-3 py-1 text-xs font-medium text-[#4a5d3e]"
            >
              <CheckCircle2 className="size-3" />
              {cert}
              <button
                type="button"
                onClick={() => onChange(value.filter((c) => c !== cert))}
                className="ml-0.5 rounded-full hover:text-destructive transition-colors"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Press Enter or click + to add. You can edit these later.
      </p>
    </div>
  );
}

// ─── Payment Option Card ───────────────────────────────────────────────────
function PaymentOptionCard({
  icon,
  title,
  description,
  badge,
  selected,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  selected: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`relative w-full rounded-2xl border-2 p-5 text-left transition-all ${
        disabled
          ? "border-border bg-muted/40 opacity-60 cursor-not-allowed"
          : selected
            ? "border-[#4a5d3e] bg-[rgba(74,93,62,0.06)] shadow-md"
            : "border-border bg-card hover:border-[rgba(74,93,62,0.4)] hover:bg-[rgba(74,93,62,0.03)]"
      }`}
    >
      {badge && (
        <span className="absolute right-4 top-4 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {badge}
        </span>
      )}
      {selected && !disabled && (
        <CheckCircle2 className="absolute right-4 top-4 size-5 text-[#4a5d3e]" />
      )}
      <div className="flex items-start gap-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[rgba(74,93,62,0.1)] text-[#4a5d3e]">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-primary-deep">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground leading-5">{description}</p>
        </div>
      </div>
    </button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function BecomeTrainerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [bio, setBio] = useState("");
  const [certs, setCerts] = useState<string[]>([]);
  const [paymentMethod] = useState<"fiat">("fiat"); // only fiat active for now
  const [isPending, startTransition] = useTransition();

  const bioValid = bio.trim().length >= 10;
  const canSubmit = bioValid;

  function handleNext() {
    if (step < 3) setStep((s) => s + 1);
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  function handleSubmit() {
    startTransition(async () => {
      const result = await registerTrainerFiatAction({
        bio: bio.trim(),
        certifications: certs,
      });

      if (result.success) {
        setStep(4); // success state
        // Redirect after a short celebration delay
        setTimeout(() => router.push("/trainer"), 2500);
      } else {
        toast.error(result.error ?? "Registration failed. Please try again.");
      }
    });
  }

  // ── Success screen ─────────────────────────────────────────────────────
  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="relative mx-auto size-24">
            <div className="absolute inset-0 rounded-full bg-[rgba(74,93,62,0.15)] animate-ping" />
            <div className="relative flex size-24 items-center justify-center rounded-full bg-[#4a5d3e]">
              <CheckCircle2 className="size-10 text-white" />
            </div>
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-primary-deep">
              Welcome to the Team! 🎉
            </h1>
            <p className="mt-3 text-muted-foreground leading-6">
              Your trainer profile is live. Taking you to your Trainer Dashboard…
            </p>
          </div>
          <div className="flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="size-2 rounded-full bg-[#4a5d3e] animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-surface flex">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex relative w-[420px] shrink-0 flex-col justify-between overflow-hidden bg-[#31442a] px-10 py-12 text-white">
        <BackgroundBlobs />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="size-3.5" />
            ReLive Trainer Program
          </div>
          <h1 className="mt-8 font-display text-4xl font-bold leading-tight">
            Share your expertise. Build your practice.
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/70">
            Join Indonesia's growing wellness marketplace. Set your own prices, manage your schedule, and earn — all in one place.
          </p>
        </div>

        <div className="relative z-10 space-y-5">
          {[
            { icon: "💰", label: "IDR Payouts", sub: "Get paid directly to your bank via Duitku" },
            { icon: "🗓️", label: "Full Control", sub: "You decide your availability and session limits" },
            { icon: "🌱", label: "Grow Together", sub: "Access to our client community from day one" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-xl">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-white/60">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10">
          <Stepper current={step} />
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 lg:hidden">
          <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4a5d3e]">
            <Sparkles className="size-4" /> Become a Trainer
          </div>
          <Stepper current={step} />
        </div>

        <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-lg space-y-8">

            {/* Step 1: Bio */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="font-display text-2xl font-bold text-primary-deep">
                    Tell us about yourself
                  </h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    This will be your public bio — be genuine, clients love authenticity.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Your Bio <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    rows={6}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="I'm a certified strength and conditioning coach with 5 years of experience helping people move better and feel stronger. I specialise in…"
                    className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none ring-0 focus:border-[#4a5d3e] focus:ring-2 focus:ring-[rgba(74,93,62,0.2)] transition-all placeholder:text-muted-foreground/60"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{bioValid ? "✓ Looks good!" : "Minimum 10 characters"}</span>
                    <span className={bio.length >= 10 ? "text-[#4a5d3e]" : ""}>{bio.length} chars</span>
                  </div>
                </div>
                <button
                  onClick={handleNext}
                  disabled={!bioValid}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4a5d3e] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#3a4d2e] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                  Continue <ChevronRight className="size-4" />
                </button>
              </div>
            )}

            {/* Step 2: Certifications */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="font-display text-2xl font-bold text-primary-deep">
                    Your certifications
                  </h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Optional but strongly recommended — clients trust certified trainers more.
                  </p>
                </div>
                <CertTagInput value={certs} onChange={setCerts} />
                <div className="flex gap-3">
                  <button
                    onClick={handleBack}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border px-6 py-3.5 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#4a5d3e] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#3a4d2e] hover:-translate-y-0.5"
                  >
                    Continue <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="font-display text-2xl font-bold text-primary-deep">
                    How do you want to get paid?
                  </h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Choose your preferred payment method. You can add more options later.
                  </p>
                </div>

                <div className="space-y-3">
                  <PaymentOptionCard
                    icon={<Wallet className="size-5" />}
                    title="Fiat (IDR) via Duitku"
                    description="Receive payments directly to your Indonesian bank account. Fast, local, and hassle-free."
                    selected={paymentMethod === "fiat"}
                    onClick={() => {}}
                  />
                  <PaymentOptionCard
                    icon={<Zap className="size-5" />}
                    title="Crypto (USDC on Solana)"
                    description="Accept payments in USDC stablecoin with on-chain escrow for trustless sessions."
                    badge="Coming Soon"
                    selected={false}
                    disabled
                  />
                </div>

                <div className="rounded-xl border border-[rgba(74,93,62,0.2)] bg-[rgba(74,93,62,0.05)] p-4">
                  <p className="text-xs text-[#67715f] leading-5">
                    <strong className="text-[#4a5d3e]">Note:</strong> Fiat payouts are processed via Duitku. You'll set up your bank details and create your first service from the Trainer Dashboard after registration.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleBack}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border px-6 py-3.5 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isPending || !canSubmit}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#4a5d3e] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#3a4d2e] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Registering…
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" /> Launch My Profile
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

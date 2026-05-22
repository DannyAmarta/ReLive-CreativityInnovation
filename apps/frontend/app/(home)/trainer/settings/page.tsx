"use client";
import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/trainer/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { payoutSettings, trainerProfile } from "@/lib/mock-data";
import { AlertTriangle, FlaskConical, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [payout, setPayout] = useState(payoutSettings);
  const [profile, setProfile] = useState(trainerProfile);

  return (
    <div className="space-y-6">
      <Link
        href="/trainer"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>

      <PageHeader title="Settings" description="Payout destinations and your public trainer profile." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payout settings */}
        <div className="glass-card-elevated overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Payout settings</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Where you receive crypto and fiat earnings.</p>
          </div>
          <div className="p-5 space-y-6">
            {/* Crypto */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-accent">crypto · usdc</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sol">Solana wallet address</Label>
                <Input id="sol" value={payout.solanaAddress} onChange={(e) => setPayout({ ...payout, solanaAddress: e.target.value })} className="font-mono text-sm" />
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-warning/10 border border-warning/20">
                  <AlertTriangle className="size-4 text-warning shrink-0 mt-0.5" />
                  <p className="text-xs text-warning-foreground">Double-check this address. Funds sent to a wrong address cannot be recovered.</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Bank */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-accent">fiat · bank</span>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Bank</Label>
                  <Select value={payout.bank.name} onValueChange={(v: string) => setPayout({ ...payout, bank: { ...payout.bank, name: v } })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BCA">BCA</SelectItem>
                      <SelectItem value="Mandiri">Mandiri</SelectItem>
                      <SelectItem value="BNI">BNI</SelectItem>
                      <SelectItem value="BRI">BRI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="acct">Account number</Label>
                    <Input id="acct" value={payout.bank.accountNumber} onChange={(e) => setPayout({ ...payout, bank: { ...payout.bank, accountNumber: e.target.value } })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="aname">Account name</Label>
                    <Input id="aname" value={payout.bank.accountName} onChange={(e) => setPayout({ ...payout, bank: { ...payout.bank, accountName: e.target.value } })} />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* E-wallet */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-accent">fiat · e-wallet</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Provider</Label>
                  <Select value={payout.ewallet.provider} onValueChange={(v: string) => setPayout({ ...payout, ewallet: { ...payout.ewallet, provider: v } })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GoPay">GoPay</SelectItem>
                      <SelectItem value="OVO">OVO</SelectItem>
                      <SelectItem value="Dana">Dana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input id="phone" value={payout.ewallet.phone} onChange={(e) => setPayout({ ...payout, ewallet: { ...payout.ewallet, phone: e.target.value } })} />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={() => toast.success("Payout settings saved")} className="bg-gradient-primary text-primary-foreground">
                <Save className="size-4 mr-1.5" /> Save changes
              </Button>
              <Button variant="outline" onClick={() => toast.success("Test payout sent (sandbox)")}>
                <FlaskConical className="size-4 mr-1.5" /> Test payout
              </Button>
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="glass-card-elevated overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Profile</h2>
            <p className="text-xs text-muted-foreground mt-0.5">How clients see you on ReLive.</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-2xl bg-gradient-mint flex items-center justify-center text-highlight-foreground font-semibold text-lg">
                {profile.displayName.split(" ").map((p) => p[0]).join("")}
              </div>
              <Button variant="outline" size="sm">Upload avatar</Button>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" value={profile.displayName} onChange={(e) => setProfile({ ...profile, displayName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="head">Headline</Label>
              <Input id="head" value={profile.headline} onChange={(e) => setProfile({ ...profile, headline: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="loc">Location</Label>
                <Input id="loc" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Specialties</Label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profile.specialties.map((s) => (
                    <span key={s} className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{s}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Certifications</Label>
              <div className="flex flex-wrap gap-1.5">
                {profile.certifications.map((c) => (
                  <span key={c} className="text-[11px] px-2 py-1 rounded-full bg-accent/10 text-accent-foreground border border-accent/20">{c}</span>
                ))}
              </div>
            </div>
            <Button onClick={() => toast.success("Profile saved")} className="bg-gradient-primary text-primary-foreground">
              <Save className="size-4 mr-1.5" /> Save changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


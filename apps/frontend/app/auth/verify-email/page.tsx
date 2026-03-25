import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmailClient } from "@/components/auth/VerifyEmailClient";

export const metadata: Metadata = {
  title: "Verify Email | ReLive",
  description: "Confirm your new email address for your ReLive account.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailClient />
    </Suspense>
  );
}

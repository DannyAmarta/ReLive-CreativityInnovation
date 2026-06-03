"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, LogOut } from "lucide-react";

interface SessionExpiryWatcherProps {
  expiryTime: string | null;
}

export function SessionExpiryWatcher({ expiryTime }: SessionExpiryWatcherProps) {
  const [isExpired, setIsExpired] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const router = useRouter();

  useEffect(() => {
    if (!expiryTime) return;
    const expiryTimestamp = new Date(expiryTime).getTime();

    const checkSession = () => {
      const now = Date.now();
      if (now >= expiryTimestamp) {
        setIsExpired(true);
      }
    };

    // Run initial check
    checkSession();

    // Check every second
    const interval = setInterval(checkSession, 1000);
    return () => clearInterval(interval);
  }, [expiryTime]);

  useEffect(() => {
    if (!isExpired) return;

    if (countdown <= 0) {
      router.push("/auth/logout?next=/auth/login");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isExpired, countdown, router]);

  if (!isExpired) return null;

  const handleLogout = () => {
    router.push("/auth/logout?next=/auth/login");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300 animate-in fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-[rgba(199,122,90,0.3)] bg-[rgba(255,246,238,0.98)] p-8 text-center text-[#6d3f2b] shadow-[0_24px_50px_rgba(199,122,90,0.18)] transition-all duration-300 transform scale-100 animate-in zoom-in-95">
        
        {/* Glow decorative effects */}
        <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-[rgba(199,122,90,0.12)] blur-3xl pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 h-40 w-40 rounded-full bg-[rgba(88,120,74,0.1)] blur-3xl pointer-events-none" />

        {/* Warning Icon & Circular Progress */}
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[rgba(199,122,90,0.08)]">
          <div className="absolute inset-0 animate-ping rounded-full bg-[rgba(199,122,90,0.08)] opacity-75 pointer-events-none" />
          
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-[rgba(199,122,90,0.1)]"
              strokeWidth="4"
              stroke="currentColor"
              fill="transparent"
              r="44"
              cx="50"
              cy="50"
            />
            <circle
              className="text-[#b35d3b] transition-all duration-1000 ease-linear"
              strokeWidth="4"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - countdown / 10)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="44"
              cx="50"
              cy="50"
            />
          </svg>
          
          <Clock className="h-10 w-10 text-[#b35d3b] animate-pulse" />
        </div>

        <h3 className="mt-6 text-2xl font-bold tracking-tight text-[#5a3321]">
          Session Expired
        </h3>
        
        <p className="mt-3 text-sm leading-relaxed text-[#8a5a46]">
          Your active session has expired. To secure your data, you will be automatically redirected to log in again.
        </p>

        {/* Big Countdown Number */}
        <div className="mt-6 flex flex-col items-center justify-center">
          <span className="text-5xl font-extrabold tracking-tighter text-[#b35d3b] tabular-nums transition-all duration-300">
            {countdown}
          </span>
          <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#a47562]">
            seconds remaining
          </span>
        </div>

        {/* Action Button */}
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#b35d3b] py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:bg-[#974a2b] hover:shadow-xl active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4" />
            Sign Out Now
          </button>
        </div>
      </div>
    </div>
  );
}

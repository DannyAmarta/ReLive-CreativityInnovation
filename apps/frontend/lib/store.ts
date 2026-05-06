import { useSyncExternalStore } from "react";
import {
  INITIAL_BOOKINGS,
  INITIAL_WITHDRAWALS,
  type Booking,
  type Withdrawal,
} from './fiat-mock-data';

type State = {
  bookings: Booking[];
  withdrawals: Withdrawal[];
  fiatBalance: number;
  wallet: WalletState;
};

export type WalletProvider = "Phantom" | "Solflare" | "Backpack";
export type WalletState = {
  connected: boolean;
  provider?: WalletProvider;
  address?: string;
  usdcBalance: number;
};

const MOCK_ADDRESSES: Record<WalletProvider, string> = {
  Phantom: "7nF3kQ91vL2pXeWcZpYrTm8bH4dRsKuJaQ2r",
  Solflare: "9aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uVwXyZaQ2r",
  Backpack: "2xM9pT0eN1bV3cR4dF5gH6jK7lM8nP9qS0aQ2r",
};

let state: State = {
  bookings: INITIAL_BOOKINGS,
  withdrawals: INITIAL_WITHDRAWALS,
  fiatBalance: 1_250_000,
  wallet: { connected: false, usdcBalance: 220 },
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => state;

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getSnapshot()),
    () => selector(getSnapshot()),
  );
}

const set = (updater: (s: State) => State) => {
  state = updater(state);
  emit();
};

export const actions = {
  addBooking(b: Booking) {
    set((s) => ({ ...s, bookings: [b, ...s.bookings] }));
  },
  setBookingStatus(id: string, status: Booking["status"]) {
    set((s) => ({
      ...s,
      bookings: s.bookings.map((b) => (b.id === id ? { ...b, status } : b)),
    }));
  },
  completeSession(bookingId: string) {
    const b = state.bookings.find((x) => x.id === bookingId);
    set((s) => ({
      ...s,
      bookings: s.bookings.map((bk) =>
        bk.id === bookingId ? { ...bk, status: "COMPLETED" } : bk,
      ),
      fiatBalance:
        b && b.paymentType === "FIAT" && b.amountIdr
          ? s.fiatBalance + Math.round(b.amountIdr * 0.9)
          : s.fiatBalance,
    }));
  },
  addWithdrawal(w: Withdrawal) {
    set((s) => ({
      ...s,
      withdrawals: [w, ...s.withdrawals],
      fiatBalance: s.fiatBalance - w.amountIdr,
    }));
  },
  retryWithdrawal(id: string) {
    set((s) => ({
      ...s,
      withdrawals: s.withdrawals.map((w) =>
        w.id === id ? { ...w, status: "PENDING", failureReason: undefined } : w,
      ),
    }));
  },
  connectWallet(provider: WalletProvider) {
    set((s) => ({
      ...s,
      wallet: {
        connected: true,
        provider,
        address: MOCK_ADDRESSES[provider],
        usdcBalance: s.wallet.usdcBalance,
      },
    }));
  },
  disconnectWallet() {
    set((s) => ({
      ...s,
      wallet: { connected: false, usdcBalance: s.wallet.usdcBalance },
    }));
  },
};

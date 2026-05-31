import { print } from "graphql";
import { authFetchGraphql, fetchGraphql } from "./fetchGraphQL";
import {
  GET_MY_CLIENT_BOOKINGS_QUERY,
  GET_MY_FIAT_WALLET_QUERY,
  GET_MY_TRAINER_BOOKINGS_QUERY,
  GET_MY_TRAINER_PROFILE_QUERY,
  GET_MY_WITHDRAWAL_REQUESTS_QUERY,
  GET_TRAINER_PROFILE_QUERY,
  GET_TRAINER_PROFILES_QUERY,
} from "./gqlQueries";

export type TrainerServiceRecord = {
  id: number;
  title: string;
  description: string;
  priceInLamports: number;
  priceInIdr?: number | null;
  tokenMintAddress: string;
  isActive: boolean;
};

export type ReviewRecord = {
  id: number;
  bookingId: number;
  clientId: number;
  trainerProfileId: number;
  rating: number;
  comment?: string | null;
  isAnonymous: boolean;
  createdAt: string;
  client?: {
    id: number;
    name: string;
    avatar?: string | null;
  } | null;
};

export type TrainerProfileRecord = {
  id: number;
  bio?: string | null;
  certifications: string[];
  rating: number;
  user: {
    id: number;
    name: string;
    avatar?: string | null;
    bio?: string | null;
  };
  services: TrainerServiceRecord[];
  reviews?: ReviewRecord[];
};

export type BookingRecord = {
  id: number;
  clientId: number;
  status: string;
  paymentType?: string | null;
  txHash?: string | null;
  escrowAddress?: string | null;
  fiatAmount?: number | null;
  servicePriceIdr?: number | null;
  processingFeeIdr?: number | null;
  gatewayPaymentMethod?: string | null;
  disputeReason?: string | null;
  // ── Scheduling ───────────────────────────────────────────────
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  timezone?: string | null;
  meetingLink?: string | null;
  // ─────────────────────────────────────────────────
  createdAt: string;
  updatedAt: string;
  client?: {
    id: number;
    name: string;
    avatar?: string | null;
    email?: string | null;
  } | null;
  trainer?: {
    id: number;
    bio?: string | null;
    user: {
      id: number;
      name: string;
      avatar?: string | null;
    };
  } | null;
  service?: TrainerServiceRecord | null;
  review?: ReviewRecord | null;
};


export type FiatWalletRecord = {
  id: number;
  trainerId: number;
  balanceIdr: number;
  updatedAt: string;
};

export type WithdrawalRequestRecord = {
  id: number;
  trainerId: number;
  amountIdr: number;
  bankCode?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  paymentMethod: string;
  status: string;
  gatewayReference?: string | null;
  requestedAt: string;
  processedAt?: string | null;
  failureReason?: string | null;
};

type TrainersResponse = {
  getTrainerProfiles: TrainerProfileRecord[];
};

type TrainerResponse = {
  getTrainerProfile: TrainerProfileRecord;
};

type MyTrainerResponse = {
  myTrainerProfile: TrainerProfileRecord;
};

type ClientBookingsResponse = {
  myClientBookings: BookingRecord[];
};

type TrainerBookingsResponse = {
  myTrainerBookings: BookingRecord[];
};

type WalletResponse = {
  myFiatWallet: FiatWalletRecord;
};

type WithdrawalsResponse = {
  myWithdrawalRequests: WithdrawalRequestRecord[];
};

export async function getTrainerProfiles() {
  const data = await fetchGraphql<TrainersResponse>(print(GET_TRAINER_PROFILES_QUERY));
  return data.getTrainerProfiles ?? [];
}

export async function getTrainerProfile(id: number) {
  const data = await fetchGraphql<TrainerResponse>(print(GET_TRAINER_PROFILE_QUERY), { id });
  return data.getTrainerProfile;
}

export async function getMyTrainerProfile() {
  const data = await authFetchGraphql<MyTrainerResponse>(print(GET_MY_TRAINER_PROFILE_QUERY));
  return data.myTrainerProfile;
}

export async function getMyClientBookings() {
  const data = await authFetchGraphql<ClientBookingsResponse>(print(GET_MY_CLIENT_BOOKINGS_QUERY));
  return data.myClientBookings ?? [];
}

export async function getMyTrainerBookings() {
  const data = await authFetchGraphql<TrainerBookingsResponse>(print(GET_MY_TRAINER_BOOKINGS_QUERY));
  return data.myTrainerBookings ?? [];
}

export async function getMyFiatWallet() {
  const data = await authFetchGraphql<WalletResponse>(print(GET_MY_FIAT_WALLET_QUERY));
  return data.myFiatWallet;
}

export async function getMyWithdrawalRequests() {
  const data = await authFetchGraphql<WithdrawalsResponse>(print(GET_MY_WITHDRAWAL_REQUESTS_QUERY));
  return data.myWithdrawalRequests ?? [];
}

export function lamportsToTokenUnits(value?: number | null) {
  if (!value) return 0;
  return value / 1_000_000;
}

export function getTrainerLowestIdr(trainer: TrainerProfileRecord) {
  const idrValues = trainer.services
    .map((service) => service.priceInIdr)
    .filter((value): value is number => typeof value === "number");

  if (idrValues.length === 0) return null;
  return Math.min(...idrValues);
}



// ── Client Wallet helpers ────────────────────────────────────────────────────

export async function getMyClientFiatBookings(): Promise<BookingRecord[]> {
  const all = await getMyClientBookings();
  return [...all]
    .filter((b) => b.paymentType === "FIAT")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function computeClientFiatMetrics(bookings: BookingRecord[]) {
  const completed = bookings.filter((b) => b.status === "COMPLETED");
  const active = bookings.filter((b) => b.status === "ACTIVE" || b.status === "PENDING");

  const lifetimeSpent = completed.reduce(
    (sum, b) => sum + (b.fiatAmount ?? b.servicePriceIdr ?? 0),
    0,
  );
  const activeInvested = active.reduce(
    (sum, b) => sum + (b.fiatAmount ?? b.servicePriceIdr ?? 0),
    0,
  );
  const avgSessionCost = completed.length > 0 ? lifetimeSpent / completed.length : 0;

  return { lifetimeSpent, activeInvested, avgSessionCost, completedCount: completed.length };
}


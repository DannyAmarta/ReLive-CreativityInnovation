// Mock data for ReLive Trainer Hub
export type BookingStatus = "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "DISPUTED";
export type PaymentMethod = "CRYPTO" | "FIAT";

export interface Booking {
  id: string;
  client: { name: string; avatar: string };
  serviceTitle: string;
  scheduledAt: string; // ISO
  paymentMethod: PaymentMethod;
  amountUsdc?: number;
  amountIdr?: number;
  status: BookingStatus;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  durationMin: number;
  priceUsdc: number;
  priceIdr: number;
}

export interface WalletTx {
  id: string;
  type: "CREDIT" | "WITHDRAWAL";
  amountIdr: number;
  status: "COMPLETED" | "PENDING" | "FAILED";
  description: string;
  createdAt: string;
  failureReason?: string;
}

export interface Conversation {
  id: string;
  bookingId: string;
  client: { name: string; avatar: string };
  serviceTitle: string;
  bookingDate: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
}

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: "trainer" | "client";
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: "booking" | "withdrawal" | "completion" | "rating";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  link: string;
}

const initials = (n: string) => n.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
export const avatarFor = (name: string) => initials(name);

const now = Date.now();
const hours = (h: number) => new Date(now + h * 3600_000).toISOString();
const daysAgo = (d: number) => new Date(now - d * 86400_000).toISOString();

export const trainerProfile = {
  displayName: "Marcus Thorne",
  headline: "Elite Strength & Mobility Coach",
  bio: "10+ years coaching athletes and busy professionals. NASM-CPT, FRCms.",
  location: "Bali, Indonesia",
  specialties: ["Strength", "Mobility", "HIIT"],
  certifications: ["NASM-CPT", "FRCms", "Precision Nutrition L1"],
};

export const overviewStats = {
  totalEarningsUsdc: 4250,
  totalEarningsIdr: 12_500_000,
  activeBookings: 3,
  completed30d: 18,
  rating: 4.92,
  ratingCount: 147,
  pendingWithdrawalIdr: 500_000,
};

export const bookings: Booking[] = [
  {
    id: "BK-2401",
    client: { name: "Maya Carter", avatar: avatarFor("Maya Carter") },
    serviceTitle: "Strength Foundations",
    scheduledAt: hours(2),
    paymentMethod: "FIAT",
    amountIdr: 450_000,
    status: "ACTIVE",
  },
  {
    id: "BK-2402",
    client: { name: "Jordan Riley", avatar: avatarFor("Jordan Riley") },
    serviceTitle: "Mobility Flow",
    scheduledAt: hours(26),
    paymentMethod: "CRYPTO",
    amountUsdc: 45,
    status: "ACTIVE",
  },
  {
    id: "BK-2403",
    client: { name: "Priya Sharma", avatar: avatarFor("Priya Sharma") },
    serviceTitle: "HIIT Interval",
    scheduledAt: hours(50),
    paymentMethod: "CRYPTO",
    amountUsdc: 35,
    status: "PENDING",
  },
  {
    id: "BK-2404",
    client: { name: "Devon Park", avatar: avatarFor("Devon Park") },
    serviceTitle: "Strength Foundations",
    scheduledAt: hours(72),
    paymentMethod: "FIAT",
    amountIdr: 450_000,
    status: "PENDING",
  },
  {
    id: "BK-2390",
    client: { name: "Aisha Khan", avatar: avatarFor("Aisha Khan") },
    serviceTitle: "Mobility Flow",
    scheduledAt: daysAgo(2),
    paymentMethod: "FIAT",
    amountIdr: 350_000,
    status: "COMPLETED",
  },
  {
    id: "BK-2388",
    client: { name: "Leo Tan", avatar: avatarFor("Leo Tan") },
    serviceTitle: "HIIT Interval",
    scheduledAt: daysAgo(3),
    paymentMethod: "CRYPTO",
    amountUsdc: 35,
    status: "COMPLETED",
  },
  {
    id: "BK-2380",
    client: { name: "Sara Müller", avatar: avatarFor("Sara Muller") },
    serviceTitle: "Strength Foundations",
    scheduledAt: daysAgo(5),
    paymentMethod: "CRYPTO",
    amountUsdc: 60,
    status: "DISPUTED",
  },
  {
    id: "BK-2375",
    client: { name: "Tom Becker", avatar: avatarFor("Tom Becker") },
    serviceTitle: "Mobility Flow",
    scheduledAt: daysAgo(7),
    paymentMethod: "FIAT",
    amountIdr: 350_000,
    status: "CANCELLED",
  },
];

export const services: Service[] = [
  {
    id: "SVC-01",
    title: "Strength Foundations",
    description: "60-minute 1:1 strength session focused on compound lifts and progressive overload.",
    durationMin: 60,
    priceUsdc: 60,
    priceIdr: 450_000,
  },
  {
    id: "SVC-02",
    title: "Mobility Flow",
    description: "45-minute mobility and movement quality session. Joint CARs, breathwork, control.",
    durationMin: 45,
    priceUsdc: 45,
    priceIdr: 350_000,
  },
  {
    id: "SVC-03",
    title: "HIIT Interval",
    description: "30-minute high-intensity conditioning. Heart-rate driven intervals.",
    durationMin: 30,
    priceUsdc: 35,
    priceIdr: 250_000,
  },
];

export const wallet = {
  balanceIdr: 3_250_000,
  pendingIdr: 500_000,
  lifetimeWithdrawnIdr: 18_700_000,
};

export const transactions: WalletTx[] = [
  { id: "TX-501", type: "CREDIT", amountIdr: 450_000, status: "COMPLETED", description: "Session — Maya Carter", createdAt: daysAgo(1) },
  { id: "TX-500", type: "WITHDRAWAL", amountIdr: 500_000, status: "PENDING", description: "Withdrawal to BCA •• 4521", createdAt: daysAgo(1) },
  { id: "TX-499", type: "CREDIT", amountIdr: 350_000, status: "COMPLETED", description: "Session — Aisha Khan", createdAt: daysAgo(2) },
  { id: "TX-498", type: "WITHDRAWAL", amountIdr: 1_200_000, status: "COMPLETED", description: "Withdrawal to BCA •• 4521", createdAt: daysAgo(4) },
  { id: "TX-497", type: "CREDIT", amountIdr: 250_000, status: "COMPLETED", description: "Session — Tom Becker", createdAt: daysAgo(6) },
  { id: "TX-496", type: "WITHDRAWAL", amountIdr: 300_000, status: "FAILED", description: "Withdrawal to GoPay 0812-xxxx", createdAt: daysAgo(8), failureReason: "Recipient account name mismatch." },
  { id: "TX-495", type: "CREDIT", amountIdr: 450_000, status: "COMPLETED", description: "Session — Leo Tan", createdAt: daysAgo(9) },
];

export const conversations: Conversation[] = [
  {
    id: "CV-1",
    bookingId: "BK-2401",
    client: { name: "Maya Carter", avatar: avatarFor("Maya Carter") },
    serviceTitle: "Strength Foundations",
    bookingDate: hours(2),
    lastMessage: "See you in 2 hours! Should I bring my lifting belt?",
    lastMessageAt: new Date(now - 12 * 60_000).toISOString(),
    unread: 2,
  },
  {
    id: "CV-2",
    bookingId: "BK-2402",
    client: { name: "Jordan Riley", avatar: avatarFor("Jordan Riley") },
    serviceTitle: "Mobility Flow",
    bookingDate: hours(26),
    lastMessage: "Thanks, looking forward to tomorrow.",
    lastMessageAt: new Date(now - 3 * 3600_000).toISOString(),
    unread: 0,
  },
  {
    id: "CV-3",
    bookingId: "BK-2390",
    client: { name: "Aisha Khan", avatar: avatarFor("Aisha Khan") },
    serviceTitle: "Mobility Flow",
    bookingDate: daysAgo(2),
    lastMessage: "Felt great after — really grateful.",
    lastMessageAt: daysAgo(1),
    unread: 0,
  },
];

export const messagesByBooking: Record<string, ChatMessage[]> = {
  "BK-2401": [
    { id: "M1", bookingId: "BK-2401", senderId: "client", content: "Hey Marcus! Excited for our session today.", createdAt: new Date(now - 2 * 3600_000).toISOString() },
    { id: "M2", bookingId: "BK-2401", senderId: "trainer", content: "Same here Maya — we'll be working on hinge patterns and posterior chain.", createdAt: new Date(now - 1.5 * 3600_000).toISOString() },
    { id: "M3", bookingId: "BK-2401", senderId: "client", content: "See you in 2 hours! Should I bring my lifting belt?", createdAt: new Date(now - 12 * 60_000).toISOString() },
    { id: "M4", bookingId: "BK-2401", senderId: "client", content: "Also — wrist wraps?", createdAt: new Date(now - 11 * 60_000).toISOString() },
  ],
  "BK-2402": [
    { id: "M5", bookingId: "BK-2402", senderId: "trainer", content: "Confirmed for tomorrow 10am. Bring a yoga mat.", createdAt: new Date(now - 5 * 3600_000).toISOString() },
    { id: "M6", bookingId: "BK-2402", senderId: "client", content: "Thanks, looking forward to tomorrow.", createdAt: new Date(now - 3 * 3600_000).toISOString() },
  ],
  "BK-2390": [
    { id: "M7", bookingId: "BK-2390", senderId: "client", content: "Felt great after — really grateful.", createdAt: daysAgo(1) },
  ],
};

export const notifications: Notification[] = [
  { id: "N1", type: "booking", title: "New booking", body: "Devon Park booked Strength Foundations.", createdAt: new Date(now - 30 * 60_000).toISOString(), read: false, link: "/trainer-hub/bookings" },
  { id: "N2", type: "completion", title: "Session marked complete", body: "Aisha Khan — IDR 350,000 credited.", createdAt: daysAgo(2), read: false, link: "/trainer-hub/wallet" },
  { id: "N3", type: "withdrawal", title: "Withdrawal completed", body: "IDR 1,200,000 transferred to BCA •• 4521.", createdAt: daysAgo(4), read: true, link: "/trainer-hub/wallet" },
  { id: "N4", type: "rating", title: "New 5★ rating", body: "Leo Tan rated your HIIT Interval session.", createdAt: daysAgo(3), read: true, link: "/trainer-hub" },
];

export const payoutSettings = {
  solanaAddress: "8xK3...m9Qp",
  bank: { name: "BCA", accountNumber: "•• •• 4521", accountName: "Marcus Thorne" },
  ewallet: { provider: "GoPay", phone: "+62 812-xxxx-3344" },
};

// Formatters
export const fmtIdr = (n: number) => `IDR ${n.toLocaleString("id-ID")}`;
export const fmtUsdc = (n: number) => `${n.toFixed(2)} USDC`;
export const fmtUsd = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
export const fmtDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};
export const fmtRelative = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

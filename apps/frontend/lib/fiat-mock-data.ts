import heroImg from "@/assets/hero.jpg";

export type Specialty =
  | "Strength"
  | "Yoga"
  | "Boxing"
  | "Nutrition"
  | "HIIT"
  | "Mobility"
  | "CrossFit";

export const SPECIALTIES: Specialty[] = [
  "Strength",
  "Yoga",
  "Boxing",
  "Nutrition",
  "HIIT",
  "Mobility",
  "CrossFit",
];

export type Service = {
  id: string;
  title: string;
  durationMin?: number;
  priceUsdc: number;
  priceIdr: number;
};

export type Trainer = {
  id: string;
  name: string;
  headline: string;
  city: string;
  rating: number;
  reviewCount: number;
  photo: string;
  bio: string;
  certifications: string[];
  specialties: Specialty[];
  services: Service[];
};

const photo = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=800&q=80`;

export const TRAINERS: Trainer[] = [
  {
    id: "t1",
    name: "Maya Carter",
    headline: "Strength & conditioning coach",
    city: "Jakarta",
    rating: 4.95,
    reviewCount: 187,
    photo: (heroImg as any).src || heroImg,
    bio: "Helping busy professionals build strength with sustainable, science-based programming. 8 years coaching, ex-national rower.",
    certifications: ["NSCA-CSCS", "Precision Nutrition L1", "FRC Mobility"],
    specialties: ["Strength", "HIIT", "Mobility"],
    services: [
      { id: "s1", title: "Strength Session", durationMin: 60, priceUsdc: 85, priceIdr: 150_000 },
      { id: "s2", title: "Nutrition Audit", durationMin: 45, priceUsdc: 120, priceIdr: 210_000 },
      { id: "s3", title: "12-Week Program", priceUsdc: 480, priceIdr: 820_000 },
    ],
  },
  {
    id: "t2",
    name: "Agung Pratama",
    headline: "Boxing & HIIT specialist",
    city: "Bandung",
    rating: 4.88,
    reviewCount: 142,
    photo: photo("1583454110551-21f2fa2afe61"),
    bio: "Former amateur boxer turned coach. Sharp footwork, sharper conditioning.",
    certifications: ["ISSA Boxing", "ACE-CPT"],
    specialties: ["Boxing", "HIIT"],
    services: [
      { id: "s4", title: "Boxing Fundamentals", durationMin: 60, priceUsdc: 70, priceIdr: 125_000 },
      { id: "s5", title: "HIIT Burner", durationMin: 45, priceUsdc: 55, priceIdr: 95_000 },
    ],
  },
  {
    id: "t3",
    name: "Sari Wijaya",
    headline: "Yoga & mobility coach",
    city: "Bali",
    rating: 4.99,
    reviewCount: 312,
    photo: photo("1518611012118-696072aa579a"),
    bio: "Vinyasa-rooted yoga, breathwork and joint mobility. Sessions in studio or live online.",
    certifications: ["RYT-500", "FRC Mobility Specialist"],
    specialties: ["Yoga", "Mobility"],
    services: [
      { id: "s6", title: "Vinyasa Flow", durationMin: 60, priceUsdc: 50, priceIdr: 85_000 },
      { id: "s7", title: "Mobility Reset", durationMin: 45, priceUsdc: 65, priceIdr: 110_000 },
    ],
  },
  {
    id: "t4",
    name: "Daniel Hartono",
    headline: "CrossFit & Olympic lifting",
    city: "Surabaya",
    rating: 4.82,
    reviewCount: 98,
    photo: photo("1571019613454-1cb2f99b2d8b"),
    bio: "Box owner & competitive lifter. Loud cues, clean technique.",
    certifications: ["CrossFit L2", "USAW-1"],
    specialties: ["CrossFit", "Strength"],
    services: [
      { id: "s8", title: "CrossFit WOD", durationMin: 60, priceUsdc: 60, priceIdr: 105_000 },
      { id: "s9", title: "Olympic Lifting", durationMin: 75, priceUsdc: 95, priceIdr: 165_000 },
    ],
  },
  {
    id: "t5",
    name: "Lina Saputra",
    headline: "Sports dietitian",
    city: "Jakarta",
    rating: 4.91,
    reviewCount: 76,
    photo: photo("1594381898411-846e7d193883"),
    bio: "Personalized nutrition for athletes and recreational lifters. Evidence-based, no fads.",
    certifications: ["RD", "Precision Nutrition L2"],
    specialties: ["Nutrition"],
    services: [
      { id: "s10", title: "Diet Strategy Call", durationMin: 60, priceUsdc: 90, priceIdr: 158_000 },
      { id: "s11", title: "Monthly Coaching", priceUsdc: 320, priceIdr: 560_000 },
    ],
  },
  {
    id: "t6",
    name: "Reza Mahendra",
    headline: "Mobility & rehab coach",
    city: "Yogyakarta",
    rating: 4.86,
    reviewCount: 64,
    photo: photo("1517836357463-d25dfeac3438"),
    bio: "Post-injury return-to-sport specialist. Mobility, control, longevity.",
    certifications: ["FRC", "DNS-A"],
    specialties: ["Mobility", "Yoga"],
    services: [
      { id: "s12", title: "Mobility Assessment", durationMin: 60, priceUsdc: 75, priceIdr: 130_000 },
    ],
  },
];

export const lowestIdr = (t: Trainer) =>
  Math.min(...t.services.map((s) => s.priceIdr));

export type PaymentType = "CRYPTO" | "FIAT";
export type BookingStatus =
  | "PENDING"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED";

export type Booking = {
  id: string;
  trainerId: string;
  trainerName: string;
  trainerPhoto: string;
  serviceTitle: string;
  scheduledAt: string;
  paymentType: PaymentType;
  amountIdr?: number;
  amountUsdc?: number;
  status: BookingStatus;
  paymentUrl?: string;
};

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "b1",
    trainerId: "t1",
    trainerName: "Maya Carter",
    trainerPhoto: (heroImg as any).src || heroImg,
    serviceTitle: "Strength Session",
    scheduledAt: "2026-05-04T18:00:00",
    paymentType: "FIAT",
    amountIdr: 157_750,
    status: "ACTIVE",
  },
  {
    id: "b2",
    trainerId: "t3",
    trainerName: "Sari Wijaya",
    trainerPhoto: photo("1518611012118-696072aa579a"),
    serviceTitle: "Vinyasa Flow",
    scheduledAt: "2026-04-28T07:30:00",
    paymentType: "CRYPTO",
    amountUsdc: 50,
    status: "COMPLETED",
  },
  {
    id: "b3",
    trainerId: "t2",
    trainerName: "Agung Pratama",
    trainerPhoto: photo("1583454110551-21f2fa2afe61"),
    serviceTitle: "Boxing Fundamentals",
    scheduledAt: "2026-05-08T19:00:00",
    paymentType: "FIAT",
    amountIdr: 132_125,
    status: "PENDING",
    paymentUrl: "#mock-duitku",
  },
];

export type WithdrawalStatus = "PENDING" | "COMPLETED" | "FAILED";
export type WithdrawalMethod = "BANK_TRANSFER" | "EWALLET";

export type Withdrawal = {
  id: string;
  amountIdr: number;
  status: WithdrawalStatus;
  method: WithdrawalMethod;
  reference: string;
  createdAt: string;
  failureReason?: string;
  bankCode?: string;
  accountNumber?: string;
  accountName?: string;
  ewalletPhone?: string;
};

export const INITIAL_WITHDRAWALS: Withdrawal[] = [
  {
    id: "w1",
    amountIdr: 100_000,
    status: "COMPLETED",
    method: "BANK_TRANSFER",
    reference: "DUITKU-7nF3kQ91",
    createdAt: "2026-05-02T10:24:00",
    bankCode: "BCA",
    accountNumber: "1234567890",
    accountName: "Agung Pratama",
  },
  {
    id: "w2",
    amountIdr: 200_000,
    status: "PENDING",
    method: "EWALLET",
    reference: "DUITKU-qL8kH4mZ",
    createdAt: "2026-04-30T15:02:00",
    ewalletPhone: "62812xxxxxxx",
  },
  {
    id: "w3",
    amountIdr: 300_000,
    status: "FAILED",
    method: "BANK_TRANSFER",
    reference: "DUITKU-2xM9pT0e",
    createdAt: "2026-04-28T09:11:00",
    failureReason: "Invalid account number",
    bankCode: "Mandiri",
    accountNumber: "0009998",
    accountName: "Agung Pratama",
  },
];

export const BANKS = ["BCA", "Mandiri", "BRI", "BNI", "CIMB Niaga", "Permata"];

export const computeFee = (amount: number) =>
  Math.round(amount * 0.025) + 4_000;
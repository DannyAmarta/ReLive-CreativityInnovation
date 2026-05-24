import { faker } from '@faker-js/faker';
import { hash } from 'argon2';
import {
  BookingStatus,
  PaymentType,
  Prisma,
  PrismaClient,
  Role,
  WithdrawalStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

type UserType = Prisma.UserGetPayload<{}>;

const exercises = [
  {
    id: 'bench-press',
    name: 'Bench Press',
    category: 'Chest',
    formula: 'Epley',
    description: 'Compound chest exercise',
    requiredMetrics: ['weight', 'reps'],
  },
  {
    id: 'squat',
    name: 'Squat',
    category: 'Legs',
    formula: 'Epley',
    description: 'Compound leg exercise',
    requiredMetrics: ['weight', 'reps'],
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    category: 'Back',
    formula: 'Epley',
    description: 'Compound posterior chain exercise',
    requiredMetrics: ['weight', 'reps'],
  },
  {
    id: 'pull-up',
    name: 'Pull Up',
    category: 'Back',
    formula: 'Bodyweight',
    description: 'Upper body pulling movement',
    requiredMetrics: ['reps'],
  },
  {
    id: 'running',
    name: 'Running',
    category: 'Cardio',
    formula: 'Distance',
    description: 'Cardio endurance activity',
    requiredMetrics: ['duration', 'distance'],
  },
];

const trainerServices = [
  'Online Coaching',
  'Home Personal Training',
  'Weight Loss Program',
  'Muscle Gain Program',
  'Strength Coaching',
  'Nutrition Consultation',
];

async function main() {
  console.log('🌱 Starting seed...');

  const password = await hash('123456');

  // =========================
  // ADMIN
  // =========================

  await prisma.user.upsert({
    where: {
      email: 'admin@relive.app',
    },
    update: {},
    create: {
      email: 'admin@relive.app',
      password,
      name: 'ReLive Admin',
      role: Role.ADMIN,
      avatar: faker.image.avatar(),
      bio: 'System administrator',
      vitalityScore: 95,
      streakDays: 120,
      profileCompleted: true,
    },
  });

  const demoTrainer = await prisma.user.upsert({
    where: { email: 'trainer.demo@relive.app' },
    update: {
      name: 'Demo Trainer',
      role: Role.TRAINER,
      bio: 'Stable seeded trainer account for frontend verification.',
      phone: '081234567890',
      profileCompleted: true,
      fitnessLevel: 'Evergreen',
      dailyActivity: 'Aerial',
      primaryGoal: 'Strength',
      vitalityScore: 92,
      streakDays: 180,
    },
    create: {
      email: 'trainer.demo@relive.app',
      password,
      name: 'Demo Trainer',
      role: Role.TRAINER,
      avatar: faker.image.avatar(),
      bio: 'Stable seeded trainer account for frontend verification.',
      phone: '081234567890',
      profileCompleted: true,
      fitnessLevel: 'Evergreen',
      dailyActivity: 'Aerial',
      primaryGoal: 'Strength',
      vitalityScore: 92,
      streakDays: 180,
    },
  });

  const demoClient = await prisma.user.upsert({
    where: { email: 'client.demo@relive.app' },
    update: {
      name: 'Demo Client',
      role: Role.USER,
      bio: 'Stable seeded client account for frontend verification.',
      phone: '081298765432',
      profileCompleted: true,
      fitnessLevel: 'Growing',
      dailyActivity: 'Shifting',
      primaryGoal: 'Energy',
      vitalityScore: 78,
      streakDays: 42,
    },
    create: {
      email: 'client.demo@relive.app',
      password,
      name: 'Demo Client',
      role: Role.USER,
      avatar: faker.image.avatar(),
      bio: 'Stable seeded client account for frontend verification.',
      phone: '081298765432',
      profileCompleted: true,
      fitnessLevel: 'Growing',
      dailyActivity: 'Shifting',
      primaryGoal: 'Energy',
      vitalityScore: 78,
      streakDays: 42,
    },
  });

  // =========================
  // TRAINERS
  // =========================

  const trainers: UserType[] = [];

  for (let i = 0; i < 10; i++) {
    const trainer = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password,
        name: faker.person.fullName(),
        role: Role.TRAINER,
        avatar: faker.image.avatar(),
        bio: faker.lorem.paragraph(),
        phone: faker.phone.number(),
        profileCompleted: true,
        fitnessLevel: faker.helpers.arrayElement([
          'Sprouting',
          'Growing',
          'Evergreen',
        ]),
        dailyActivity: faker.helpers.arrayElement([
          'Rooted',
          'Shifting',
          'Aerial',
        ]),
        primaryGoal: faker.helpers.arrayElement([
          'Strength',
          'Weight Loss',
          'Energy',
        ]),
        vitalityScore: faker.number.int({
          min: 70,
          max: 100,
        }),
        streakDays: faker.number.int({
          min: 10,
          max: 365,
        }),
      },
    });

    trainers.push(trainer);

    await prisma.trainerProfile.create({
      data: {
        userId: trainer.id,
        bio: faker.lorem.paragraph(),
        certifications: [
          'Certified Personal Trainer',
          'Nutrition Specialist',
        ],
        rating: faker.number.float({
          min: 4,
          max: 5,
          fractionDigits: 1,
        }),
      },
    });

    await prisma.fiatWallet.create({
      data: {
        trainerId: trainer.id,
        balanceIdr: faker.number.int({
          min: 500000,
          max: 10000000,
        }),
      },
    });
  }

  const demoTrainerProfile = await prisma.trainerProfile.upsert({
    where: { userId: demoTrainer.id },
    update: {
      bio: 'Demo trainer profile with stable services for frontend work.',
      certifications: ['Certified Personal Trainer', 'Solana Escrow Pilot'],
      rating: 4.9,
    },
    create: {
      userId: demoTrainer.id,
      bio: 'Demo trainer profile with stable services for frontend work.',
      certifications: ['Certified Personal Trainer', 'Solana Escrow Pilot'],
      rating: 4.9,
    },
  });

  await prisma.fiatWallet.upsert({
    where: { trainerId: demoTrainer.id },
    update: { balanceIdr: 1750000 },
    create: {
      trainerId: demoTrainer.id,
      balanceIdr: 1750000,
    },
  });

  // =========================
  // USERS
  // =========================

  const users: UserType[] = [];

  for (let i = 0; i < 30; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password,
        name: faker.person.fullName(),
        role: Role.USER,
        avatar: faker.image.avatar(),
        bio: faker.lorem.sentence(),
        phone: faker.phone.number(),
        profileCompleted: true,
        fitnessLevel: faker.helpers.arrayElement([
          'Sprouting',
          'Growing',
          'Evergreen',
        ]),
        dailyActivity: faker.helpers.arrayElement([
          'Rooted',
          'Shifting',
          'Aerial',
        ]),
        primaryGoal: faker.helpers.arrayElement([
          'Strength',
          'Weight Loss',
          'Energy',
        ]),
        vitalityScore: faker.number.int({
          min: 40,
          max: 90,
        }),
        streakDays: faker.number.int({
          min: 1,
          max: 200,
        }),
      },
    });

    users.push(user);
  }

  // =========================
  // EXERCISES
  // =========================

  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: {
        id: exercise.id,
      },
      update: {},
      create: exercise,
    });
  }

  const allExercises =
    await prisma.exercise.findMany();

  // =========================
  // TRAINER SERVICES
  // =========================

  const trainerProfiles =
    await prisma.trainerProfile.findMany();

  for (const profile of trainerProfiles) {
    for (let i = 0; i < 3; i++) {
      await prisma.trainerService.create({
        data: {
          trainerId: profile.id,
          title:
            faker.helpers.arrayElement(
              trainerServices
            ),
          description:
            faker.lorem.paragraph(),
          priceInLamports:
            faker.number.int({
              min: 1000000,
              max: 10000000,
            }),
          priceInIdr: faker.number.int({
            min: 50000,
            max: 500000,
          }),
        },
      });
    }
  }

  const existingDemoServices = await prisma.trainerService.findMany({
    where: { trainerId: demoTrainerProfile.id },
  });

  if (existingDemoServices.length === 0) {
    await prisma.trainerService.createMany({
      data: [
        {
          trainerId: demoTrainerProfile.id,
          title: 'Demo Strength Session',
          description: 'A stable demo listing for client and trainer page validation.',
          priceInLamports: 6_500_000,
          priceInIdr: 175000,
        },
        {
          trainerId: demoTrainerProfile.id,
          title: 'Demo Mobility Reset',
          description: 'Focused movement session used for seeded browsing and booking flows.',
          priceInLamports: 5_000_000,
          priceInIdr: 145000,
        },
        {
          trainerId: demoTrainerProfile.id,
          title: 'Demo Nutrition Review',
          description: 'Planning session for validating fiat and booking state transitions.',
          priceInLamports: 8_000_000,
          priceInIdr: 220000,
        },
      ],
    });
  }

  // =========================
  // WORKOUT SETS
  // =========================

  for (const user of users) {
    for (let i = 0; i < 20; i++) {
      const exercise =
        faker.helpers.arrayElement(
          allExercises
        );

      await prisma.workoutSet.create({
        data: {
          userId: user.id,
          exerciseId: exercise.id,
          weightLifted:
            faker.number.float({
              min: 20,
              max: 120,
            }),
          actualReps:
            faker.number.int({
              min: 5,
              max: 15,
            }),
          rirLogged:
            faker.number.int({
              min: 0,
              max: 4,
            }),
          calculated1Rm:
            faker.number.float({
              min: 40,
              max: 180,
            }),
          formulaUsed: 'Epley',
          durationMinutes:
            faker.number.float({
              min: 20,
              max: 120,
            }),
          distanceMeters:
            faker.number.float({
              min: 500,
              max: 10000,
            }),
          rpeLogged:
            faker.number.float({
              min: 5,
              max: 10,
            }),
          notes:
            faker.lorem.sentence(),
          createdAt:
            faker.date.recent({
              days: 90,
            }),
        },
      });
    }
  }

  // =========================
  // SNAPSHOTS
  // =========================

  for (const user of users) {
    for (const exercise of allExercises) {
      await prisma.dailyPerformanceSnapshot.create({
        data: {
          userId: user.id,
          exerciseId: exercise.id,
          snapshotDate:
            faker.date.recent({
              days: 30,
            }),
          periodDays: 14,
          emaOneRepMax:
            faker.number.float({
              min: 40,
              max: 180,
            }),
          baselineAverage1Rm:
            faker.number.float({
              min: 40,
              max: 180,
            }),
          latestLogged1Rm:
            faker.number.float({
              min: 40,
              max: 180,
            }),
          latestClean1Rm:
            faker.number.float({
              min: 40,
              max: 180,
            }),
          latestRirTrend:
            faker.number.float({
              min: 0,
              max: 4,
            }),
          latestSessionFlagged:
            faker.datatype.boolean(),
          contextSummary:
            faker.lorem.sentence(),
          sampleSize:
            faker.number.int({
              min: 5,
              max: 50,
            }),
        },
      });
    }
  }

  // =========================
  // BOOKINGS
  // =========================

  const services =
    await prisma.trainerService.findMany();

  for (let i = 0; i < 100; i++) {
    const client =
      faker.helpers.arrayElement(users);

    const service =
      faker.helpers.arrayElement(
        services
      );

    const booking =
      await prisma.booking.create({
        data: {
          clientId: client.id,
          trainerId: service.trainerId,
          serviceId: service.id,
          status:
            faker.helpers.arrayElement([
              BookingStatus.PENDING,
              BookingStatus.ACTIVE,
              BookingStatus.COMPLETED,
              BookingStatus.CANCELLED,
            ]),
          paymentType:
            faker.helpers.arrayElement([
              PaymentType.CRYPTO,
              PaymentType.FIAT,
            ]),
          fiatAmount:
            faker.number.int({
              min: 50000,
              max: 500000,
            }),
          servicePriceIdr:
            faker.number.int({
              min: 50000,
              max: 500000,
            }),
          processingFeeIdr:
            faker.number.int({
              min: 1000,
              max: 10000,
            }),
          gatewayTxId:
            faker.string.uuid(),
          gatewayPaymentMethod:
            faker.helpers.arrayElement([
              'QRIS',
              'BCA_VA',
              'GOPAY',
            ]),
        },
      });

    await prisma.paymentTransaction.create({
      data: {
        bookingId: booking.id,
        gateway: 'DUITKU',
        gatewayTxId:
          faker.string.uuid(),
        amountIdr:
          booking.fiatAmount || 0,
        feeIdr:
          booking.processingFeeIdr ||
          0,
        status:
          faker.helpers.arrayElement([
            'SUCCESS',
            'PENDING',
            'REFUNDED',
          ]),
      },
    });
  }

  const demoServices = await prisma.trainerService.findMany({
    where: { trainerId: demoTrainerProfile.id },
    take: 2,
  });

  const existingDemoBookings = await prisma.booking.count({
    where: { clientId: demoClient.id, trainerId: demoTrainerProfile.id },
  });

  if (existingDemoBookings === 0 && demoServices.length > 0) {
    await prisma.booking.create({
      data: {
        clientId: demoClient.id,
        trainerId: demoTrainerProfile.id,
        serviceId: demoServices[0].id,
        status: BookingStatus.PENDING,
        paymentType: PaymentType.FIAT,
        fiatAmount: (demoServices[0].priceInIdr ?? 175000) + 4000,
        servicePriceIdr: demoServices[0].priceInIdr ?? 175000,
        processingFeeIdr: 4000,
        gatewayTxId: `demo-fiat-${faker.string.uuid()}`,
        gatewayPaymentMethod: 'QRIS',
      },
    });

    await prisma.booking.create({
      data: {
        clientId: demoClient.id,
        trainerId: demoTrainerProfile.id,
        serviceId: demoServices[Math.min(1, demoServices.length - 1)].id,
        status: BookingStatus.COMPLETED,
        paymentType: PaymentType.FIAT,
        fiatAmount:
          (demoServices[Math.min(1, demoServices.length - 1)].priceInIdr ?? 145000) + 4000,
        servicePriceIdr: demoServices[Math.min(1, demoServices.length - 1)].priceInIdr ?? 145000,
        processingFeeIdr: 4000,
        gatewayTxId: `demo-complete-${faker.string.uuid()}`,
        gatewayPaymentMethod: 'BCA_VA',
      },
    });
  }

  // =========================
  // REVIEWS
  // =========================

  // Seed reviews for random COMPLETED bookings (to give trainers real ratings)
  const completedBookings = await prisma.booking.findMany({
    where: { status: BookingStatus.COMPLETED },
    include: { review: true },
  });

  const reviewComments = [
    'Amazing trainer! Helped me achieve my goals faster than I expected.',
    'Very professional and knowledgeable. Highly recommend!',
    'Great session, very motivating. Will definitely book again.',
    'Excellent communication and personalized training plan.',
    'Good trainer but sessions could be a bit longer.',
    'Incredibly patient and supportive. Perfect for beginners!',
    'Top-notch expertise. My form has improved drastically.',
    'Very friendly and encouraging. Loved every session.',
    null,
    null,
  ];

  const seenBookingsForReview = new Set<number>();

  for (const booking of completedBookings) {
    if (booking.review || seenBookingsForReview.has(booking.id)) continue;
    seenBookingsForReview.add(booking.id);
    if (faker.number.float() > 0.7) continue;
    const rating = faker.number.int({ min: 3, max: 5 });
    const comment = faker.helpers.arrayElement(reviewComments);
    const isAnonymous = faker.datatype.boolean({ probability: 0.2 });
    await prisma.review.upsert({
      where: { bookingId: booking.id },
      update: {},
      create: {
        bookingId: booking.id,
        clientId: booking.clientId,
        trainerProfileId: booking.trainerId,
        rating,
        comment,
        isAnonymous,
      },
    });
  }

  // Recalculate ratings for all trainer profiles
  const allTrainerProfiles = await prisma.trainerProfile.findMany({
    include: { reviews: { select: { rating: true } } },
  });
  for (const profile of allTrainerProfiles) {
    if (profile.reviews.length === 0) continue;
    const avg = profile.reviews.reduce((sum, r) => sum + r.rating, 0) / profile.reviews.length;
    await prisma.trainerProfile.update({
      where: { id: profile.id },
      data: { rating: Math.round(avg * 10) / 10 },
    });
  }

  // Seed a specific review for the demo client's completed booking
  const demoCompletedBooking = await prisma.booking.findFirst({
    where: {
      clientId: demoClient.id,
      trainerId: demoTrainerProfile.id,
      status: BookingStatus.COMPLETED,
    },
    include: { review: true },
  });

  if (demoCompletedBooking && !demoCompletedBooking.review) {
    await prisma.review.create({
      data: {
        bookingId: demoCompletedBooking.id,
        clientId: demoClient.id,
        trainerProfileId: demoTrainerProfile.id,
        rating: 5,
        comment: 'Absolutely incredible session! The demo trainer is incredibly knowledgeable and pushes you to achieve your best.',
        isAnonymous: false,
      },
    });
    const demoReviews = await prisma.review.findMany({
      where: { trainerProfileId: demoTrainerProfile.id },
      select: { rating: true },
    });
    if (demoReviews.length > 0) {
      const avg = demoReviews.reduce((sum, r) => sum + r.rating, 0) / demoReviews.length;
      await prisma.trainerProfile.update({
        where: { id: demoTrainerProfile.id },
        data: { rating: Math.round(avg * 10) / 10 },
      });
    }
  }

  // =========================
  // WITHDRAWALS
  // =========================

  for (const trainer of trainers) {
    await prisma.withdrawalRequest.create({
      data: {
        trainerId: trainer.id,
        amountIdr: faker.number.int({ min: 100000, max: 2000000 }),
        bankCode: 'BCA',
        accountNumber: faker.finance.accountNumber(),
        accountName: trainer.name || 'Trainer',
        paymentMethod: 'BANK_TRANSFER',
        status: faker.helpers.arrayElement([
          WithdrawalStatus.PENDING,
          WithdrawalStatus.COMPLETED,
          WithdrawalStatus.FAILED,
        ]),
      },
    });
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
// npx prisma db seed

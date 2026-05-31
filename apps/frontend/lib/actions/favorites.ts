"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session.server";
import prisma from "@/lib/prisma";

// ── Types ────────────────────────────────────────────────────────────────────

export type FavoriteTrainerRecord = {
  trainerProfileId: number;
  createdAt: string;
  trainer: {
    id: number;
    bio: string | null;
    rating: number;
    certifications: string[];
    user: {
      id: number;
      name: string;
      avatar: string | null;
      bio: string | null;
    };
    services: {
      id: number;
      title: string;
      description: string;
      priceInIdr: number | null;
      priceInLamports: number | null;
      isActive: boolean;
    }[];
  };
};

// ── Queries ──────────────────────────────────────────────────────────────────

/**
 * Returns the list of trainer profiles the current user has favorited.
 * Safe to call from Server Components.
 */
export async function getMyFavoriteTrainers(): Promise<FavoriteTrainerRecord[]> {
  const session = await getSession();
  if (!session?.user?.id) return [];

  const userId = Number(session.user.id);

  const rows = await prisma.favoriteTrainer.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      trainer: {
        include: {
          user: true,
          services: { where: { isActive: true } },
        },
      },
    },
  });

  return rows.map((row) => ({
    trainerProfileId: row.trainerProfileId,
    createdAt: row.createdAt.toISOString(),
    trainer: {
      id: row.trainer.id,
      bio: row.trainer.bio,
      rating: row.trainer.rating,
      certifications: row.trainer.certifications,
      user: {
        id: row.trainer.user.id,
        name: row.trainer.user.name ?? "Unknown",
        avatar: row.trainer.user.avatar,
        bio: row.trainer.user.bio,
      },
      services: row.trainer.services.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        priceInIdr: s.priceInIdr,
        priceInLamports: s.priceInLamports,
        isActive: s.isActive,
      })),
    },
  }));
}



// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Adds or removes a trainer from the current user's favorites (toggle).
 * Returns the new state: true = now favorited, false = now unfavorited.
 */
export async function toggleFavoriteTrainerAction(
  trainerProfileId: number,
): Promise<{ isFavorited: boolean; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { isFavorited: false, error: "You must be logged in to favorite a trainer." };
  }

  const userId = Number(session.user.id);

  const existing = await prisma.favoriteTrainer.findUnique({
    where: { userId_trainerProfileId: { userId, trainerProfileId } },
  });

  if (existing) {
    await prisma.favoriteTrainer.delete({
      where: { userId_trainerProfileId: { userId, trainerProfileId } },
    });
    revalidatePath("/client/trainers");
    return { isFavorited: false };
  } else {
    await prisma.favoriteTrainer.create({
      data: { userId, trainerProfileId },
    });
    revalidatePath("/client/trainers");
    return { isFavorited: true };
  }
}

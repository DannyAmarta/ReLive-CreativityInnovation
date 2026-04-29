-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dailyActivity" TEXT,
ADD COLUMN     "fitnessLevel" TEXT,
ADD COLUMN     "primaryGoal" TEXT,
ADD COLUMN     "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "streakDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vitalityScore" INTEGER NOT NULL DEFAULT 0;

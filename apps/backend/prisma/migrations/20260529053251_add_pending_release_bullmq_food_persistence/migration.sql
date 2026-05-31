-- CreateEnum
CREATE TYPE "FoodSource" AS ENUM ('USDA', 'OFF');

-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'PENDING_RELEASE';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "releaseJobId" TEXT;

-- CreateTable
CREATE TABLE "UserFavoriteFood" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "foodId" TEXT NOT NULL,
    "foodName" TEXT NOT NULL,
    "brand" TEXT,
    "source" "FoodSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFavoriteFood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMealItem" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "foodId" TEXT NOT NULL,
    "foodName" TEXT NOT NULL,
    "brand" TEXT,
    "source" "FoodSource" NOT NULL,
    "servingSize" DOUBLE PRECISION NOT NULL,
    "nutrientsJson" JSONB NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMealItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserFavoriteFood_userId_idx" ON "UserFavoriteFood"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFavoriteFood_userId_foodId_source_key" ON "UserFavoriteFood"("userId", "foodId", "source");

-- CreateIndex
CREATE INDEX "UserMealItem_userId_idx" ON "UserMealItem"("userId");

-- AddForeignKey
ALTER TABLE "UserFavoriteFood" ADD CONSTRAINT "UserFavoriteFood_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMealItem" ADD CONSTRAINT "UserMealItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

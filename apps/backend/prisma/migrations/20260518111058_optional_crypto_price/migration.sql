-- AlterTable
ALTER TABLE "TrainerService" ALTER COLUMN "priceInLamports" DROP NOT NULL,
ALTER COLUMN "tokenMintAddress" DROP NOT NULL,
ALTER COLUMN "tokenMintAddress" DROP DEFAULT;

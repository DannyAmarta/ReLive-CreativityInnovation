CREATE TYPE "WalletProvider" AS ENUM ('SOLFLARE', 'PHANTOM', 'OTHER');

CREATE TABLE "UserWalletAccount" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "provider" "WalletProvider" NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserWalletAccount_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserWalletAccount_userId_walletAddress_key" ON "UserWalletAccount"("userId", "walletAddress");
CREATE INDEX "UserWalletAccount_userId_isActive_idx" ON "UserWalletAccount"("userId", "isActive");

ALTER TABLE "UserWalletAccount"
ADD CONSTRAINT "UserWalletAccount_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

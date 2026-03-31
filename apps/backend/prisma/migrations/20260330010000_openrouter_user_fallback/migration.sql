ALTER TABLE "User"
ADD COLUMN "openRouterApiKeyEncrypted" TEXT,
ADD COLUMN "openRouterKeyLabel" TEXT,
ADD COLUMN "openRouterUserId" TEXT,
ADD COLUMN "openRouterConnectedAt" TIMESTAMP(3);

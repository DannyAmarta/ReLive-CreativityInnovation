-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "bio" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodCache" (
    "id" SERIAL NOT NULL,
    "source" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "description" TEXT,
    "brand" TEXT,
    "referenceServingSize" DOUBLE PRECISION,
    "referenceServingUnit" TEXT,
    "caloriesPer100g" DOUBLE PRECISION,
    "proteinGramsPer100g" DOUBLE PRECISION,
    "carbsGramsPer100g" DOUBLE PRECISION,
    "fatGramsPer100g" DOUBLE PRECISION,
    "fiberGramsPer100g" DOUBLE PRECISION,
    "sugarGramsPer100g" DOUBLE PRECISION,
    "sodiumMilligramsPer100g" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeCache" (
    "id" SERIAL NOT NULL,
    "source" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "normalizedTitle" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "calories" DOUBLE PRECISION,
    "protein" DOUBLE PRECISION,
    "cookTime" INTEGER,
    "ingredients" TEXT[],
    "instructions" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "dietTags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "FoodCache_normalizedName_idx" ON "FoodCache"("normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "FoodCache_source_sourceId_key" ON "FoodCache"("source", "sourceId");

-- CreateIndex
CREATE INDEX "RecipeCache_normalizedTitle_idx" ON "RecipeCache"("normalizedTitle");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeCache_source_sourceId_key" ON "RecipeCache"("source", "sourceId");

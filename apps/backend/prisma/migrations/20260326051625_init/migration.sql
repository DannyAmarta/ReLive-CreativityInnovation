-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "formula" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "repCap" INTEGER,
    "requiredMetrics" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutSet" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "weightLifted" DOUBLE PRECISION,
    "actualReps" INTEGER,
    "rirLogged" INTEGER,
    "calculated1Rm" DOUBLE PRECISION,
    "formulaUsed" TEXT NOT NULL,
    "isCnsFatigue" BOOLEAN NOT NULL DEFAULT false,
    "durationMinutes" DOUBLE PRECISION,
    "distanceMeters" DOUBLE PRECISION,
    "rpeLogged" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPerformanceSnapshot" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "periodDays" INTEGER NOT NULL DEFAULT 14,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "emaOneRepMax" DOUBLE PRECISION,
    "baselineAverage1Rm" DOUBLE PRECISION,
    "latestLogged1Rm" DOUBLE PRECISION,
    "latestClean1Rm" DOUBLE PRECISION,
    "latestRirTrend" DOUBLE PRECISION,
    "latestSessionFlagged" BOOLEAN NOT NULL DEFAULT false,
    "contextSummary" TEXT NOT NULL,
    "sampleSize" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyPerformanceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkoutSet_userId_exerciseId_createdAt_idx" ON "WorkoutSet"("userId", "exerciseId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "WorkoutSet_userId_createdAt_idx" ON "WorkoutSet"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "DailyPerformanceSnapshot_userId_exerciseId_snapshotDate_idx" ON "DailyPerformanceSnapshot"("userId", "exerciseId", "snapshotDate" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "DailyPerformanceSnapshot_userId_exerciseId_periodDays_snaps_key" ON "DailyPerformanceSnapshot"("userId", "exerciseId", "periodDays", "snapshotDate");

-- AddForeignKey
ALTER TABLE "WorkoutSet" ADD CONSTRAINT "WorkoutSet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSet" ADD CONSTRAINT "WorkoutSet_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPerformanceSnapshot" ADD CONSTRAINT "DailyPerformanceSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPerformanceSnapshot" ADD CONSTRAINT "DailyPerformanceSnapshot_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

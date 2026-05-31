-- Rename existing table to back up data
ALTER TABLE "WorkoutSet" RENAME TO "WorkoutSet_old";

-- Drop constraints and indices from the old table to avoid naming conflicts on the new partitioned table
ALTER TABLE "WorkoutSet_old" DROP CONSTRAINT IF EXISTS "WorkoutSet_pkey";
ALTER TABLE "WorkoutSet_old" DROP CONSTRAINT IF EXISTS "WorkoutSet_userId_fkey";
ALTER TABLE "WorkoutSet_old" DROP CONSTRAINT IF EXISTS "WorkoutSet_exerciseId_fkey";
DROP INDEX IF EXISTS "WorkoutSet_userId_exerciseId_createdAt_idx";
DROP INDEX IF EXISTS "WorkoutSet_userId_createdAt_idx";

-- Create table WorkoutSet as partitioned
CREATE TABLE "WorkoutSet" (
    "id" SERIAL,
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

    CONSTRAINT "WorkoutSet_pkey" PRIMARY KEY ("id", "createdAt"),
    CONSTRAINT "WorkoutSet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkoutSet_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE
) PARTITION BY RANGE ("createdAt");

-- Create default partition
CREATE TABLE "WorkoutSet_default" PARTITION OF "WorkoutSet" DEFAULT;

-- Pre-create partitions for the near future
CREATE TABLE "WorkoutSet_y2026m05" PARTITION OF "WorkoutSet" FOR VALUES FROM ('2026-05-01 00:00:00') TO ('2026-06-01 00:00:00');
CREATE TABLE "WorkoutSet_y2026m06" PARTITION OF "WorkoutSet" FOR VALUES FROM ('2026-06-01 00:00:00') TO ('2026-07-01 00:00:00');
CREATE TABLE "WorkoutSet_y2026m07" PARTITION OF "WorkoutSet" FOR VALUES FROM ('2026-07-01 00:00:00') TO ('2026-08-01 00:00:00');

-- Create indices
CREATE INDEX "WorkoutSet_userId_exerciseId_createdAt_idx" ON "WorkoutSet"("userId", "exerciseId", "createdAt" DESC);
CREATE INDEX "WorkoutSet_userId_createdAt_idx" ON "WorkoutSet"("userId", "createdAt" DESC);

-- Copy data from old table to new partitioned table (handling empty table scenario gracefully)
INSERT INTO "WorkoutSet" (
    "id", "userId", "exerciseId", "weightLifted", "actualReps", "rirLogged", 
    "calculated1Rm", "formulaUsed", "isCnsFatigue", "durationMinutes", 
    "distanceMeters", "rpeLogged", "notes", "createdAt"
)
SELECT 
    "id", "userId", "exerciseId", "weightLifted", "actualReps", "rirLogged", 
    "calculated1Rm", "formulaUsed", "isCnsFatigue", "durationMinutes", 
    "distanceMeters", "rpeLogged", "notes", "createdAt"
FROM "WorkoutSet_old";

-- Reset serial sequence to continue auto-increment correctly
SELECT setval(pg_get_serial_sequence('"WorkoutSet"', 'id'), coalesce(max(id), 1), max(id) IS NOT NULL) FROM "WorkoutSet";

-- Drop backup table
DROP TABLE "WorkoutSet_old";

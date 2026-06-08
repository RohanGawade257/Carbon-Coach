CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "householdSize" INTEGER NOT NULL,
    "homeType" TEXT NOT NULL,
    "dietType" TEXT NOT NULL,
    "transportMode" TEXT NOT NULL,
    "energySource" TEXT NOT NULL,
    "goalReason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "emission_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "emission_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "emission_factors" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "kgCo2ePerUnit" DECIMAL(10,4) NOT NULL,
    "source" TEXT NOT NULL,
    CONSTRAINT "emission_factors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "footprint_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "emissionFactorId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "kgCo2e" DECIMAL(12,2) NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "footprint_entries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "carbon_twin_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "baselineKgCo2eMonthly" DECIMAL(12,2) NOT NULL,
    "topEmissionSource" TEXT NOT NULL,
    "biggestOpportunity" TEXT NOT NULL,
    "userGoal" TEXT NOT NULL,
    "userConstraints" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "carbon_twin_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "carbon_twin_simulations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scenarioName" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "projectedKgCo2e" DECIMAL(12,2) NOT NULL,
    "estimatedSavingsKgCo2e" DECIMAL(12,2) NOT NULL,
    "assumptions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "carbon_twin_simulations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "action_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "action_plans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "action_plan_items" (
    "id" TEXT NOT NULL,
    "actionPlanId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "estimatedSavingsKgCo2e" DECIMAL(12,2) NOT NULL,
    "difficulty" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    CONSTRAINT "action_plan_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedSavingsKgCo2e" DECIMAL(12,2) NOT NULL,
    "difficulty" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'New',
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "durationDays" INTEGER NOT NULL,
    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_challenges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Joined',
    "progressValue" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "user_challenges_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconKey" TEXT NOT NULL,
    "ruleKey" TEXT NOT NULL,
    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");
CREATE UNIQUE INDEX "emission_categories_slug_key" ON "emission_categories"("slug");
CREATE INDEX "emission_factors_categoryId_activityType_idx" ON "emission_factors"("categoryId", "activityType");
CREATE INDEX "footprint_entries_userId_occurredAt_idx" ON "footprint_entries"("userId", "occurredAt");
CREATE INDEX "footprint_entries_userId_categoryId_idx" ON "footprint_entries"("userId", "categoryId");
CREATE UNIQUE INDEX "carbon_twin_profiles_userId_key" ON "carbon_twin_profiles"("userId");
CREATE INDEX "carbon_twin_simulations_userId_createdAt_idx" ON "carbon_twin_simulations"("userId", "createdAt");
CREATE INDEX "action_plans_userId_status_idx" ON "action_plans"("userId", "status");
CREATE INDEX "action_plan_items_actionPlanId_dayNumber_idx" ON "action_plan_items"("actionPlanId", "dayNumber");
CREATE INDEX "recommendations_userId_status_idx" ON "recommendations"("userId", "status");
CREATE UNIQUE INDEX "user_challenges_userId_challengeId_key" ON "user_challenges"("userId", "challengeId");
CREATE UNIQUE INDEX "badges_ruleKey_key" ON "badges"("ruleKey");
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");
CREATE INDEX "ai_conversations_userId_updatedAt_idx" ON "ai_conversations"("userId", "updatedAt");
CREATE INDEX "ai_messages_conversationId_createdAt_idx" ON "ai_messages"("conversationId", "createdAt");

ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "emission_factors" ADD CONSTRAINT "emission_factors_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "emission_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "footprint_entries" ADD CONSTRAINT "footprint_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "footprint_entries" ADD CONSTRAINT "footprint_entries_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "emission_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "footprint_entries" ADD CONSTRAINT "footprint_entries_emissionFactorId_fkey" FOREIGN KEY ("emissionFactorId") REFERENCES "emission_factors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "carbon_twin_profiles" ADD CONSTRAINT "carbon_twin_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "carbon_twin_simulations" ADD CONSTRAINT "carbon_twin_simulations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "action_plans" ADD CONSTRAINT "action_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "action_plan_items" ADD CONSTRAINT "action_plan_items_actionPlanId_fkey" FOREIGN KEY ("actionPlanId") REFERENCES "action_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "emission_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "emission_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "user_challenges" ADD CONSTRAINT "user_challenges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_challenges" ADD CONSTRAINT "user_challenges_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;


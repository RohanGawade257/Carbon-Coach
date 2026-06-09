WITH ranked_recommendations AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "userId", title
      ORDER BY "createdAt" DESC, id DESC
    ) AS rn
  FROM "recommendations"
)
DELETE FROM "recommendations"
WHERE id IN (
  SELECT id FROM ranked_recommendations WHERE rn > 1
);

WITH ranked_action_plan_items AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "actionPlanId", "dayNumber"
      ORDER BY id DESC
    ) AS rn
  FROM "action_plan_items"
)
DELETE FROM "action_plan_items"
WHERE id IN (
  SELECT id FROM ranked_action_plan_items WHERE rn > 1
);

WITH ranked_active_plans AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "userId"
      ORDER BY "createdAt" DESC, id DESC
    ) AS rn
  FROM "action_plans"
  WHERE status = 'Active'
)
UPDATE "action_plans"
SET status = 'Archived'
WHERE id IN (
  SELECT id FROM ranked_active_plans WHERE rn > 1
);

CREATE UNIQUE INDEX "action_plan_items_actionPlanId_dayNumber_key"
  ON "action_plan_items"("actionPlanId", "dayNumber");

CREATE UNIQUE INDEX "recommendations_userId_title_key"
  ON "recommendations"("userId", "title");

CREATE UNIQUE INDEX "action_plans_one_active_per_user_idx"
  ON "action_plans"("userId")
  WHERE status = 'Active';

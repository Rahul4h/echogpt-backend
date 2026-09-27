-- This is an empty migration.
CREATE UNIQUE INDEX "AiProvider_single_default_idx"
ON "AiProvider" ("isDefault")
WHERE "isDefault" = true;
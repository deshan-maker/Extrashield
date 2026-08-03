-- Clean up: null out any commission.deviceId that no longer points to an
-- existing device (e.g. devices deleted directly, before this FK existed).
-- Without this, adding the foreign key below would fail.
UPDATE "Commission"
SET "deviceId" = NULL
WHERE "deviceId" IS NOT NULL
  AND "deviceId" NOT IN (SELECT "id" FROM "Device");

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
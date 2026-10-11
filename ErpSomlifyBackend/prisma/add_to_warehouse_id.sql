-- Add to_warehouse_id to warehouse_transfers (destination warehouse/store)
ALTER TABLE "warehouse_transfers" ADD COLUMN IF NOT EXISTS "to_warehouse_id" INTEGER NULL;

-- Add foreign key to warehouses (only if column was just added / constraint doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'warehouse_transfers_to_warehouse_id_fkey'
  ) THEN
    ALTER TABLE "warehouse_transfers"
      ADD CONSTRAINT "warehouse_transfers_to_warehouse_id_fkey"
      FOREIGN KEY ("to_warehouse_id") REFERENCES "warehouses"("warehouse_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Add index for to_warehouse_id
CREATE INDEX IF NOT EXISTS "warehouse_transfers_to_warehouse_id_idx" ON "warehouse_transfers"("to_warehouse_id");

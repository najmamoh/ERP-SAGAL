-- Add category and description to products
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "category" VARCHAR(100);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "description" VARCHAR(500);

-- Add stock_id to product_sales for company store sales
ALTER TABLE "product_sales" ADD COLUMN IF NOT EXISTS "stock_id" INTEGER;

-- Add FK only if it doesn't exist (ignore error if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_sales_stock_id_fkey'
  ) THEN
    ALTER TABLE "product_sales"
      ADD CONSTRAINT "product_sales_stock_id_fkey"
      FOREIGN KEY ("stock_id") REFERENCES "warehouse_stock"("stock_id")
      ON DELETE NO ACTION ON UPDATE NO ACTION;
  END IF;
END $$;

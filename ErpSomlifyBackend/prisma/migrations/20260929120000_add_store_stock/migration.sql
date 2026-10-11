-- CreateTable
CREATE TABLE "store_stock" (
    "stock_id" SERIAL NOT NULL,
    "store_id" VARCHAR NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_stock_pkey" PRIMARY KEY ("stock_id")
);

-- CreateIndex
CREATE INDEX "store_stock_store_id_idx" ON "store_stock"("store_id");

-- CreateIndex
CREATE INDEX "store_stock_product_id_idx" ON "store_stock"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "store_stock_store_id_product_id_key" ON "store_stock"("store_id", "product_id");

-- AddForeignKey
ALTER TABLE "store_stock" ADD CONSTRAINT "store_stock_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_stock" ADD CONSTRAINT "store_stock_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "purchase_payment_entries" (
    "id" SERIAL NOT NULL,
    "purchase_id" INTEGER NOT NULL,
    "amount" MONEY NOT NULL,
    "discount" MONEY NOT NULL DEFAULT 0,
    "description" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_payment_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "purchase_payment_entries_purchase_id_idx" ON "purchase_payment_entries"("purchase_id");

-- AddForeignKey
ALTER TABLE "purchase_payment_entries" ADD CONSTRAINT "purchase_payment_entries_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "product_purchases"("purchase_id") ON DELETE CASCADE ON UPDATE CASCADE;

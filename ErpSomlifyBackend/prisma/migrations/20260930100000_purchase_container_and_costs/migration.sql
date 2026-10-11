ALTER TABLE "product_purchases" ADD COLUMN "container_number" VARCHAR(64);
ALTER TABLE "product_purchases" ADD COLUMN "extra_cost" MONEY NOT NULL DEFAULT 0;

CREATE TABLE "purchase_cost_entries" (
    "id" SERIAL NOT NULL,
    "purchase_id" INTEGER NOT NULL,
    "amount" MONEY NOT NULL,
    "description" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_cost_entries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "purchase_cost_entries_purchase_id_idx" ON "purchase_cost_entries"("purchase_id");

ALTER TABLE "purchase_cost_entries" ADD CONSTRAINT "purchase_cost_entries_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "product_purchases"("purchase_id") ON DELETE CASCADE ON UPDATE CASCADE;

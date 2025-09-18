-- CreateTable
CREATE TABLE "public"."loyal_customers" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "numberOfOrders" INTEGER NOT NULL DEFAULT 0,
    "amountSpent" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "loyaltyTitle" TEXT NOT NULL DEFAULT 'Welcomed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyal_customers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "loyal_customers_email_key" ON "public"."loyal_customers"("email");

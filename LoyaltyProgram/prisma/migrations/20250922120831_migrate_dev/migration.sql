/*
  Warnings:

  - You are about to drop the column `discount` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the column `tiers` on the `Offer` table. All the data in the column will be lost.
  - Added the required column `offerType` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Offer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."OfferType" AS ENUM ('PERCENTAGE', 'FIXED', 'POINTS', 'CASHBACK');

-- AlterTable
ALTER TABLE "public"."Offer" DROP COLUMN "discount",
DROP COLUMN "tiers",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "offerType" "public"."OfferType" NOT NULL,
ADD COLUMN     "tierRequired" TEXT,
ADD COLUMN     "usageLimit" INTEGER,
ADD COLUMN     "value" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "image" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."OfferRedemption" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "OfferRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OfferRedemption_offerId_idx" ON "public"."OfferRedemption"("offerId");

-- CreateIndex
CREATE INDEX "OfferRedemption_userId_idx" ON "public"."OfferRedemption"("userId");

-- AddForeignKey
ALTER TABLE "public"."OfferRedemption" ADD CONSTRAINT "OfferRedemption_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "public"."Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OfferRedemption" ADD CONSTRAINT "OfferRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

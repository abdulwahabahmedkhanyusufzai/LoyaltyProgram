/*
  Warnings:

  - Added the required column `conversion` to the `LoyaltyProgram` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LoyaltyProgram" ADD COLUMN     "conversion" JSONB NOT NULL;

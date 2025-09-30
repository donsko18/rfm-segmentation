/*
  Warnings:

  - You are about to alter the column `customer_id` on the `dataset` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `dataset` MODIFY `customer_id` INTEGER NOT NULL;

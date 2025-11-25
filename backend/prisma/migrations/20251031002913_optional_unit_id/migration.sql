/*
  Warnings:

  - You are about to alter the column `created_at` on the `Attachment` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `created_at` on the `Feedback` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `created_at` on the `Unit` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `created_at` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/
-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_unitId_fkey`;

-- DropIndex
DROP INDEX `Unit_number_key` ON `Unit`;

-- DropIndex
DROP INDEX `User_unitId_fkey` ON `User`;

-- AlterTable
ALTER TABLE `User` MODIFY `unitId` CHAR(40) NULL;


-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `Unit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

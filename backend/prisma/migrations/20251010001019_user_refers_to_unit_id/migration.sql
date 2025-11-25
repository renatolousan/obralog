-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_unit_number_fkey`;

-- DropIndex
DROP INDEX `User_unit_number_fkey` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `unit_number`,
    ADD COLUMN `unitId` CHAR(40) NOT NULL;


-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `Unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

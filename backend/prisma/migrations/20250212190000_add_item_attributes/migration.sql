-- AlterTable
ALTER TABLE `Item` ADD COLUMN `value` DECIMAL(10, 2) NULL,
    ADD COLUMN `batch` VARCHAR(50) NULL,
    ADD COLUMN `warranty` INT NULL;


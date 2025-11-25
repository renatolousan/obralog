-- AlterTable
ALTER TABLE `Visit` DROP COLUMN `installerId`,
    MODIFY `date` TIMESTAMP NOT NULL;

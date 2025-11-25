
-- DropIndex
DROP INDEX `Visit_supervisor_id_key` ON `Visit`;

-- AlterTable
ALTER TABLE `Visit` DROP COLUMN `supervisor_id`,
    MODIFY `date` TIMESTAMP NOT NULL;

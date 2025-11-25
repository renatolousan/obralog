
-- DropForeignKey
ALTER TABLE `Attachment` DROP FOREIGN KEY `Attachment_feedback_id_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_unit_number_fkey`;

-- DropIndex
DROP INDEX `Attachment_feedback_id_idx` ON `Attachment`;

-- DropIndex
DROP INDEX `User_unit_number_fkey` ON `User`;

-- AlterTable
ALTER TABLE `Attachment` MODIFY `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    MODIFY `feedback_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Feedback` MODIFY `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE `Unit` MODIFY `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `userType` CHAR(40) NOT NULL,
    MODIFY `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    MODIFY `unit_number` INTEGER NULL;

-- CreateTable
CREATE TABLE `UserType` (
    `id` CHAR(40) NOT NULL,
    `label` VARCHAR(8) NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_unit_number_fkey` FOREIGN KEY (`unit_number`) REFERENCES `Unit`(`number`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_userType_fkey` FOREIGN KEY (`userType`) REFERENCES `UserType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attachment` ADD CONSTRAINT `Attachment_feedback_id_fkey` FOREIGN KEY (`feedback_id`) REFERENCES `Feedback`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

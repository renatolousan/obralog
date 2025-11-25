-- AlterTable
ALTER TABLE `Feedback` ADD COLUMN `user_comment` VARCHAR(500) NULL,
    ADD COLUMN `user_like` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `Visit` (
    `id` CHAR(40) NOT NULL,
    `date` TIMESTAMP NOT NULL,
    `duration` INTEGER NOT NULL DEFAULT 60,
    `supervisor_id` VARCHAR(40) NOT NULL,
    `feedback_id` VARCHAR(40) NOT NULL,

    UNIQUE INDEX `Visit_supervisor_id_key`(`supervisor_id`),
    UNIQUE INDEX `Visit_feedback_id_key`(`feedback_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Visit` ADD CONSTRAINT `Visit_supervisor_id_fkey` FOREIGN KEY (`supervisor_id`) REFERENCES `Installer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Visit` ADD CONSTRAINT `Visit_feedback_id_fkey` FOREIGN KEY (`feedback_id`) REFERENCES `Feedback`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

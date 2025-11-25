-- CreateTable
CREATE TABLE `Attachment` (
    `id` CHAR(40) NOT NULL,
    `original_name` VARCHAR(255) NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `path` VARCHAR(255) NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `size` BIGINT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `feedback_id` CHAR(40) NOT NULL,

    INDEX `Attachment_feedback_id_idx`(`feedback_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Attachment` ADD CONSTRAINT `Attachment_feedback_id_fkey` FOREIGN KEY (`feedback_id`) REFERENCES `Feedback`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

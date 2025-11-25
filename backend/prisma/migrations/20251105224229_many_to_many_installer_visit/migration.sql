-- DropForeignKey
ALTER TABLE `Visit` DROP FOREIGN KEY `Visit_supervisor_id_fkey`;

-- AlterTable
ALTER TABLE `Installer` ADD COLUMN `visitId` CHAR(40) NULL;

-- AlterTable
ALTER TABLE `Visit` ADD COLUMN `installerId` CHAR(40) NULL,
    MODIFY `date` TIMESTAMP NOT NULL;

-- CreateTable
CREATE TABLE `_visit_installer` (
    `A` CHAR(40) NOT NULL,
    `B` CHAR(40) NOT NULL,

    UNIQUE INDEX `_visit_installer_AB_unique`(`A`, `B`),
    INDEX `_visit_installer_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_visit_installer` ADD CONSTRAINT `_visit_installer_A_fkey` FOREIGN KEY (`A`) REFERENCES `Installer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_visit_installer` ADD CONSTRAINT `_visit_installer_B_fkey` FOREIGN KEY (`B`) REFERENCES `Visit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

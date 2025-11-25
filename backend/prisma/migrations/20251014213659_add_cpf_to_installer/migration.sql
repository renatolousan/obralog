-- AlterTable
ALTER TABLE `Building` ADD COLUMN `name` VARCHAR(191) NOT NULL;


-- AlterTable
ALTER TABLE `Installer` ADD COLUMN `cpf` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Installer_cpf_key` ON `Installer`(`cpf`);

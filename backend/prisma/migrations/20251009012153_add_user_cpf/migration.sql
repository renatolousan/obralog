-- AlterTable
ALTER TABLE `User` ADD COLUMN `cpf` CHAR(14) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_cpf_key` ON `User`(`cpf`);

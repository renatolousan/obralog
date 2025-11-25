-- AlterTable
ALTER TABLE `User`
  ADD COLUMN `status` ENUM('AGUARDANDO_1_ACESSO', 'ATIVO') NOT NULL DEFAULT 'AGUARDANDO_1_ACESSO';

-- DataMigration
UPDATE `User`
SET `status` = 'ATIVO'
WHERE `isFirstAccess` = false;

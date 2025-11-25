-- AlterTable
ALTER TABLE `Development` ADD COLUMN `userId` CHAR(40) NOT NULL;

-- AddForeignKey
ALTER TABLE `Development` ADD CONSTRAINT `Development_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

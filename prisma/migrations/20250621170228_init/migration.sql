-- CreateTable
CREATE TABLE `ManagerTable` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `RobloxId` BIGINT NOT NULL,
    `DiscordId` BIGINT NOT NULL,
    `District` VARCHAR(25) NOT NULL,
    `AssignedAt` DATETIME(0) NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

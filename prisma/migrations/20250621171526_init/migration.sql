/*
  Warnings:

  - You are about to drop the column `RobloxId` on the `ManagerTable` table. All the data in the column will be lost.
  - Added the required column `TrelloId` to the `ManagerTable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ManagerTable` DROP COLUMN `RobloxId`,
    ADD COLUMN `TrelloId` BIGINT NOT NULL;

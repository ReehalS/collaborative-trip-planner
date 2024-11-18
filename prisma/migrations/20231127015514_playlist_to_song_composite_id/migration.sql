/*
  Warnings:

  - The primary key for the `PlaylistToSong` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `PlaylistToSong` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PlaylistToSong" DROP CONSTRAINT "PlaylistToSong_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "PlaylistToSong_pkey" PRIMARY KEY ("playlistId", "songId");

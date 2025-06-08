/*
  Warnings:

  - You are about to drop the column `criadoEm` on the `Usuario` table. All the data in the column will be lost.
  - Made the column `telefone` on table `Usuario` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "criadoEm",
ADD COLUMN     "perfil" TEXT NOT NULL DEFAULT 'padrao',
ALTER COLUMN "telefone" SET NOT NULL;

/*
  Warnings:

  - You are about to drop the column `usuarioId` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `usuarioId` on the `Profissional` table. All the data in the column will be lost.
  - You are about to drop the `Usuario` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `Paciente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Profissional` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cpf` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emergencyContactPhone` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nome` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senha` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sexo` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefone` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cpf` to the `Profissional` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Profissional` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emergencyContactPhone` to the `Profissional` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nome` to the `Profissional` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senha` to the `Profissional` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sexo` to the `Profissional` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefone` to the `Profissional` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo` to the `Profissional` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Paciente" DROP CONSTRAINT "Paciente_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Profissional" DROP CONSTRAINT "Profissional_usuarioId_fkey";

-- DropIndex
DROP INDEX "Paciente_usuarioId_key";

-- DropIndex
DROP INDEX "Profissional_usuarioId_key";

-- AlterTable
ALTER TABLE "Paciente" DROP COLUMN "usuarioId",
ADD COLUMN     "biometricEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cpf" TEXT NOT NULL,
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "emergencyContactPhone" TEXT NOT NULL,
ADD COLUMN     "nome" TEXT NOT NULL,
ADD COLUMN     "senha" TEXT NOT NULL,
ADD COLUMN     "sexo" TEXT NOT NULL,
ADD COLUMN     "telefone" TEXT NOT NULL,
ADD COLUMN     "tipo" TEXT NOT NULL,
ADD COLUMN     "tipoSanguineo" TEXT;

-- AlterTable
ALTER TABLE "Profissional" DROP COLUMN "usuarioId",
ADD COLUMN     "alergias" TEXT,
ADD COLUMN     "biometricEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cirurgias" TEXT,
ADD COLUMN     "cpf" TEXT NOT NULL,
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "doencas" TEXT,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "emergencyContactPhone" TEXT NOT NULL,
ADD COLUMN     "nome" TEXT NOT NULL,
ADD COLUMN     "senha" TEXT NOT NULL,
ADD COLUMN     "sexo" TEXT NOT NULL,
ADD COLUMN     "telefone" TEXT NOT NULL,
ADD COLUMN     "tipo" TEXT NOT NULL,
ADD COLUMN     "tipoSanguineo" TEXT;

-- DropTable
DROP TABLE "Usuario";

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_email_key" ON "Paciente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profissional_email_key" ON "Profissional"("email");

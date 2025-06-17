import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'; // ✅ Correção aqui

const prisma = new PrismaClient(); // ✅ Instanciando o PrismaClient corretamente

export const obterPacientePorIdQr = async (req: Request, res: Response) => {
  try {
    const paciente = await prisma.paciente.findUnique({
      where: { id: req.params.id },
      select: {
        nome: true,
        tipoSanguineo: true,
        doencas: true,
        alergias: true,
        cirurgias: true
      }
    });

    if (!paciente) {
      return res.status(404).json({ erro: 'Paciente não encontrado' });
    }

    res.json(paciente);
  } catch (error) {
    console.error('Erro ao buscar paciente pelo QR:', error);
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
};

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /paciente/qr/:id
 * Solo médicos autenticados pueden acceder
 */
router.get('/paciente/qr/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user as any;

    if (!user || user.tipo !== 'profissional' || user.profissao?.toLowerCase() !== 'médico') {
      res.status(403).json({ error: 'Acesso negado. Apenas médicos podem acessar dados do paciente.' });
      return;
    }

    const paciente = await prisma.paciente.findUnique({
      where: { id },
      select: {
        nome: true,
        tipoSanguineo: true,
        doencas: true,
        alergias: true,
        cirurgias: true,
      },
    });

    if (!paciente) {
      res.status(404).json({ error: 'Paciente não encontrado.' });
      return;
    }

    res.json(paciente);
  } catch (error) {
    console.error('Erro ao buscar dados do paciente por QR:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

export default router;

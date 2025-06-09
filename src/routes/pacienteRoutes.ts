import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/authorize';

const router = Router();
const prisma = new PrismaClient();

router.get('/meus-dados', authMiddleware, authorize('paciente'), async (req: Request, res: Response) => {
  const user = req.user!;
  try {
    const paciente = await prisma.paciente.findUnique({ where: { id: user.id } });
    if (!paciente) {
      res.status(404).json({ error: 'Paciente não encontrado' });
      return;
    }
    res.json(paciente);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao buscar dados' });
  }
});

export default router;

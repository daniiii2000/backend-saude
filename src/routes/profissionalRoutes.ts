import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

router.get('/meus-dados', authMiddleware, async (req: Request, res: Response) => {
  console.log('User em /profissional/meus-dados:', req.user);

  const user = req.user;

  if (!user || user.tipo.toLowerCase() !== 'profissional') {
    res.status(403).json({ error: 'Acesso permitido apenas para profissionais' });
    return; // importante para não continuar o código
  }

  try {
    const profissional = await prisma.profissional.findUnique({
      where: { id: user.id }
    });

    if (!profissional) {
      res.status(404).json({ error: 'Profissional não encontrado' });
      return;
    }

    res.json(profissional);
  } catch (error) {
    console.error('Erro ao buscar dados do profissional:', error);
    res.status(400).json({ error: 'Erro ao buscar dados' });
  }
});

export default router;

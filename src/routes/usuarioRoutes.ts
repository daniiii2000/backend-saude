import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Atualizar dados pessoais do próprio usuário
router.put('/meus-dados', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const user = req.user;
  const { nome, email, telefone } = req.body;

  if (!user) {
    res.status(401).json({ error: 'Usuário não autenticado' });
    return;
  }

  try {
    const usuario = await prisma.usuario.update({
      where: { id: user.id },
      data: {
        nome,
        email,
        telefone
      }
    });

    res.json({
      message: 'Dados atualizados com sucesso',
      usuario
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar dados do usuário:', error);
    res.status(400).json({ error: 'Erro ao atualizar dados' });
  }
});

export default router;

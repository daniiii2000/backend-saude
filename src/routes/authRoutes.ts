import { Router, Request, Response } from 'express';
import authController from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Cadastro e login
router.post('/register', authController.register);
router.post('/login', authController.login);

// Perfil autenticado com retorno completo
router.get('/perfil', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const user = req.user;

  if (!user) {
    res.status(401).json({ error: 'Usuário não autenticado' });
    return;
  }

  const { id, tipo } = user;

  try {
    if (tipo === 'paciente') {
      const paciente = await prisma.paciente.findUnique({ where: { id } });
      if (!paciente) {
        res.status(404).json({ error: 'Paciente não encontrado' });
        return;
      }
      res.json(paciente);
    } else if (tipo === 'profissional') {
      const profissional = await prisma.profissional.findUnique({ where: { id } });
      if (!profissional) {
        res.status(404).json({ error: 'Profissional não encontrado' });
        return;
      }
      res.json(profissional);
    } else {
      res.status(400).json({ error: 'Tipo de usuário inválido' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar dados do perfil' });
  }
});

export default router;

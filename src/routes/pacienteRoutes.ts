import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/authorize';

const router = Router();
const prisma = new PrismaClient();

// ✅ Obter dados do paciente autenticado
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

// ✅ Atualizar dados do próprio paciente
router.patch('/atualizar', authMiddleware, authorize('paciente'), async (req: Request, res: Response) => {
  const { id } = req.user!;
  const { nome, telefone, sexo, doencas, alergias, cirurgias, tipoSanguineo } = req.body;

  try {
    const paciente = await prisma.paciente.update({
      where: { id },
      data: { nome, telefone, sexo, doencas, alergias, cirurgias, tipoSanguineo },
    });
    res.json({ message: 'Dados atualizados com sucesso', paciente });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar dados' });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/authorize';

const router = Router();
const prisma = new PrismaClient();

// ✅ Ver dados do profissional autenticado
router.get('/meus-dados', authMiddleware, authorize('profissional'), async (req: Request, res: Response): Promise<void> => {
  const user = req.user!;
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

// ✅ Atualizar dados do próprio profissional (não pode alterar profissão)
router.patch('/atualizar', authMiddleware, authorize('profissional'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.user!;
  const { nome, telefone, sexo } = req.body;

  try {
    const profissional = await prisma.profissional.update({
      where: { id },
      data: { nome, telefone, sexo },
    });

    res.json({ message: 'Dados atualizados com sucesso', profissional });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar dados' });
  }
});

// ✅ Médico pode atualizar dados de qualquer paciente
router.patch('/atualizar-paciente/:id', authMiddleware, authorize('profissional'), async (req: Request, res: Response): Promise<void> => {
  const { id: pacienteId } = req.params;
  const { id: profissionalId } = req.user!;

  try {
    const profissional = await prisma.profissional.findUnique({ where: { id: profissionalId } });

    if (!profissional || profissional.profissao.toLowerCase() !== 'médico') {
      res.status(403).json({ error: 'Apenas médicos podem atualizar dados de pacientes' });
      return;
    }

    const { nome, telefone, sexo, doencas, alergias, cirurgias, tipoSanguineo } = req.body;

    const pacienteAtualizado = await prisma.paciente.update({
      where: { id: pacienteId },
      data: { nome, telefone, sexo, doencas, alergias, cirurgias, tipoSanguineo },
    });

    res.json({ message: 'Paciente atualizado com sucesso', paciente: pacienteAtualizado });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar paciente' });
  }
});

export default router;

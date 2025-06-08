import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/authorize';

const router = Router();
const prisma = new PrismaClient();

// 🔁 Atualizar dados clínicos – somente profissionais
router.put('/:id', authMiddleware, authorize('profissional'), async (req: Request, res: Response): Promise<void> => {
  const pacienteId = req.params.id;
  const { doencas, alergias, cirurgias } = req.body;

  console.log('🔄 Atualizando paciente ID:', pacienteId);

  try {
    const paciente = await prisma.paciente.update({
      where: { id: pacienteId },
      data: {
        doencas,
        alergias,
        cirurgias
      }
    });

    res.json({ message: 'Dados clínicos atualizados com sucesso', paciente });
  } catch (error) {
    console.error('❌ Erro ao atualizar paciente:', error);
    res.status(400).json({ error: 'Erro ao atualizar paciente' });
  }
});

// 🔍 Ver um paciente (profissional)
router.get('/:id', authMiddleware, authorize('profissional'), async (req: Request, res: Response): Promise<void> => {
  const pacienteId = req.params.id;

  try {
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId },
      include: {
        usuario: {
          select: { nome: true, email: true, telefone: true }
        }
      }
    });

    if (!paciente) {
      res.status(404).json({ error: 'Paciente não encontrado' });
      return;
    }

    res.json(paciente);
  } catch (error) {
    console.error('❌ Erro ao buscar paciente:', error);
    res.status(400).json({ error: 'Erro ao buscar paciente' });
  }
});

// 👤 Paciente vê seus próprios dados
router.get('/meus-dados', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const user = req.user;

  if (!user || user.tipo !== 'paciente') {
    res.status(403).json({ error: 'Acesso permitido apenas para pacientes' });
    return;
  }

  try {
    const paciente = await prisma.paciente.findUnique({
      where: { usuarioId: user.id },
      include: {
        usuario: {
          select: { nome: true, email: true, telefone: true }
        }
      }
    });

    if (!paciente) {
      res.status(404).json({ error: 'Paciente não encontrado' });
      return;
    }

    res.json(paciente);
  } catch (error) {
    console.error('❌ Erro ao buscar dados do paciente:', error);
    res.status(400).json({ error: 'Erro ao buscar dados' });
  }
});

// 📋 Listar todos os pacientes – somente profissionais
router.get('/', authMiddleware, authorize('profissional'), async (req: Request, res: Response): Promise<void> => {
  try {
    const pacientes = await prisma.paciente.findMany({
      include: {
        usuario: {
          select: { nome: true, email: true, telefone: true }
        }
      }
    });

    res.json(pacientes);
  } catch (error) {
    console.error('❌ Erro ao listar pacientes:', error);
    res.status(400).json({ error: 'Erro ao listar pacientes' });
  }
});

export default router;

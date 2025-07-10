import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/authorize';

const router = Router();
const prisma = new PrismaClient();

// ✅ Obter dados do paciente autenticado
router.get('/meus-dados', authMiddleware, authorize('paciente'), async (req: Request, res: Response): Promise<void> => {
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
router.patch('/atualizar', authMiddleware, authorize('paciente'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.user!;
  const {
    nome,
    telefone,
    sexo,
    doencas,
    alergias,
    cirurgias,
    tipoSanguineo,
    planoDeSaude,
    hospitalPreferido
  } = req.body;

  try {
    const paciente = await prisma.paciente.update({
      where: { id },
      data: {
        nome,
        telefone,
        sexo,
        doencas,
        alergias,
        cirurgias,
        tipoSanguineo,
        planoDeSaude,
        hospitalPreferido
      },
    });
    res.json({ message: 'Dados atualizados com sucesso', paciente });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar dados' });
  }
});

// ✅ Cadastro de novo paciente com todos os campos obrigatórios
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const {
    nome,
    email,
    senha,
    cpf,
    sexo,
    telefone,
    tipo,
    tipoSanguineo,
    alergias,
    doencas,
    cirurgias,
    planoDeSaude,
    hospitalPreferido,
    emergencyContactPhone,
    biometricEnabled
  } = req.body;

  if (
    !nome || !email || !senha || !cpf || !sexo || !telefone ||
    !tipo || !emergencyContactPhone
  ) {
    res.status(400).json({ error: 'Campos obrigatórios faltando' });
    return;
  }

  try {
    const novoPaciente = await prisma.paciente.create({
      data: {
        nome,
        email,
        senha,
        cpf,
        sexo,
        telefone,
        tipo,
        tipoSanguineo,
        alergias,
        doencas,
        cirurgias,
        planoDeSaude,
        hospitalPreferido,
        emergencyContactPhone,
        biometricEnabled: biometricEnabled ?? false
      }
    });

    res.status(201).json(novoPaciente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cadastrar paciente' });
  }
});

export default router;

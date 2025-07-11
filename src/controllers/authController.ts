// src/controllers/authController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'chave_padrao';

const authController = {
  // ---------------------------------------------------
  // Registro de usuário
  // ---------------------------------------------------
  async register(req: Request, res: Response): Promise<void> {
    const {
      nome,
      email,
      senha,
      cpf,
      sexo,
      telefone,
      tipo,
      tipoSanguineo,
      profissao,
      alergias,
      doencas,
      cirurgias,
      planoDeSaude,
      hospitalPreferido,
      emergencyContactPhone,
      biometricEnabled = false,
    } = req.body;

    const tipoNormalized = (tipo || '').toLowerCase().trim();
    if (!['paciente', 'profissional'].includes(tipoNormalized)) {
      res.status(400).json({ error: 'Tipo deve ser "paciente" ou "profissional".' });
      return;
    }

    const telefoneClean = String(telefone).replace(/\D/g, '');
    const emergencyClean = String(emergencyContactPhone).replace(/\D/g, '');

    try {
      const existente =
        tipoNormalized === 'paciente'
          ? await prisma.paciente.findUnique({ where: { email } })
          : await prisma.profissional.findUnique({ where: { email } });

      if (existente) {
        res.status(400).json({ error: 'Email já cadastrado' });
        return;
      }

      if (!/^\d{8,15}$/.test(emergencyClean)) {
        res.status(400).json({ error: 'Telefone de emergência inválido' });
        return;
      }

      const hashedPassword = await bcrypt.hash(senha, 10);

      if (tipoNormalized === 'paciente') {
        const novoPaciente = await prisma.paciente.create({
          data: {
            nome,
            email,
            senha: hashedPassword,
            cpf,
            sexo,
            telefone: telefoneClean,
            tipo: tipoNormalized,
            tipoSanguineo,
            alergias,
            doencas,
            cirurgias,
            planoDeSaude,
            hospitalPreferido,
            emergencyContactPhone: emergencyClean,
            biometricEnabled,
          },
        });
        res.status(201).json({ message: 'Paciente cadastrado', id: novoPaciente.id });
      } else {
        const novoProfissional = await prisma.profissional.create({
          data: {
            nome,
            email,
            senha: hashedPassword,
            cpf,
            sexo,
            telefone: telefoneClean,
            tipo: tipoNormalized,
            profissao,
            tipoSanguineo,
            alergias,
            doencas,
            cirurgias,
            emergencyContactPhone: emergencyClean,
            biometricEnabled,
          },
        });
        res.status(201).json({ message: 'Profissional cadastrado', id: novoProfissional.id });
      }
    } catch (error: any) {
      console.error('[register] erro:', error);
      res.status(500).json({ error: 'Erro ao cadastrar usuário' });
    }
  },

  // ---------------------------------------------------
  // Login de usuário
  // ---------------------------------------------------
  async login(req: Request, res: Response): Promise<void> {
    const { email, senha } = req.body;
    if (!email || !senha) {
      res.status(400).json({ error: 'Email e senha obrigatórios' });
      return;
    }

    try {
      let user: any;
      let tipo: 'paciente' | 'profissional';
      let profissao: string | undefined;

      const paciente = await prisma.paciente.findUnique({ where: { email } });
      if (paciente) {
        user = paciente;
        tipo = 'paciente';
      } else {
        const profissional = await prisma.profissional.findUnique({ where: { email } });
        if (!profissional) {
          res.status(401).json({ error: 'Credenciais inválidas' });
          return;
        }
        user = profissional;
        tipo = 'profissional';
        profissao = profissional.profissao || '';
      }

      const senhaValida = await bcrypt.compare(senha, user.senha);
      if (!senhaValida) {
        res.status(401).json({ error: 'Credenciais inválidas' });
        return;
      }

      const tokenPayload: any = { id: user.id, tipo };
      if (tipo === 'profissional') tokenPayload.profissao = profissao;

      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        usuario: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo,
          profissao,
        },
      });
    } catch (error) {
      console.error('[login] erro:', error);
      res.status(500).json({ error: 'Erro ao autenticar' });
    }
  },

  // ---------------------------------------------------
  // Perfil
  // ---------------------------------------------------
  async perfil(req: Request, res: Response): Promise<void> {
    const { id, tipo } = req.user!;
    try {
      if (tipo === 'paciente') {
        const paciente = await prisma.paciente.findUnique({ where: { id } });
        if (!paciente) {
          res.status(404).json({ error: 'Paciente não encontrado' });
          return;
        }
        res.json(paciente);
      } else {
        const profissional = await prisma.profissional.findUnique({ where: { id } });
        if (!profissional) {
          res.status(404).json({ error: 'Profissional não encontrado' });
          return;
        }
        res.json(profissional);
      }
    } catch (error) {
      console.error('[perfil] erro:', error);
      res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
  },
};

export default authController;

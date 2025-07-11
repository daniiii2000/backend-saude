// src/controllers/authController.ts

import { Request, Response, NextFunction } from 'express';
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
    console.log('🔔 POST /auth/register recebido:', req.body);
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
      res.status(400).json({ error: 'Tipo inválido. Deve ser "paciente" ou "profissional".' });
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
        res.status(400).json({ error: 'Telefone de contato de emergência inválido' });
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
        res.status(201).json({ message: 'Paciente cadastrado com sucesso', id: novoPaciente.id });
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
        res.status(201).json({ message: 'Profissional cadastrado com sucesso', id: novoProfissional.id });
      }
    } catch (error: any) {
      console.error('[authController.register] Erro interno:', error);
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        res.status(400).json({ error: 'Esse e-mail já está cadastrado' });
      } else {
        res.status(500).json({ error: 'Erro ao cadastrar usuário' });
      }
    }
  },

  // ---------------------------------------------------
  // Login de usuário
  // ---------------------------------------------------
  async login(req: Request, res: Response): Promise<void> {
    console.log('🔔 POST /auth/login recebido, body:', req.body);
    const { email, senha } = req.body;
    if (!email || !senha) {
      res.status(400).json({ error: 'Email e senha são obrigatórios.' });
      return;
    }

    try {
      console.log('🔍 Buscando paciente com email:', email);
      const pacienteRecord = await prisma.paciente.findUnique({ where: { email } });
      let user;
      let tipo: 'paciente' | 'profissional';

      if (pacienteRecord) {
        console.log('✅ Encontrado paciente:', pacienteRecord.id);
        user = pacienteRecord;
        tipo = 'paciente';
      } else {
        console.log('🔍 Buscando profissional com email:', email);
        const profissionalRecord = await prisma.profissional.findUnique({ where: { email } });
        if (!profissionalRecord) {
          console.warn('❌ Usuário não encontrado para email:', email);
          res.status(401).json({ error: 'Credenciais inválidas.' });
          return;
        }
        console.log('✅ Encontrado profissional:', profissionalRecord.id);
        user = profissionalRecord;
        tipo = 'profissional';
      }

      console.log('🔐 Comparando senha para usuário:', user.id);
      const senhaValida = await bcrypt.compare(senha, user.senha);
      console.log('🔐 Resultado bcrypt.compare:', senhaValida);
      if (!senhaValida) {
        console.warn('❌ Senha incorreta para usuário:', user.id);
        res.status(401).json({ error: 'Credenciais inválidas.' });
        return;
      }

      console.log('🎟️ Gerando token JWT para usuário:', user.id);
      const token = jwt.sign({ id: user.id, tipo }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        usuario: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo,
        },
      });
    } catch (error) {
      console.error('[authController.login] Erro interno:', error);
      res.status(500).json({ error: 'Erro ao autenticar usuário.' });
    }
  },

  // ---------------------------------------------------
  // Retorna perfil completo
  // ---------------------------------------------------
  async perfil(req: Request, res: Response): Promise<void> {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const { id, tipo } = user;
    try {
      if (tipo === 'paciente') {
        const paciente = await prisma.paciente.findUnique({
          where: { id },
          select: {
            id: true,
            nome: true,
            email: true,
            cpf: true,
            sexo: true,
            telefone: true,
            tipoSanguineo: true,
            alergias: true,
            doencas: true,
            cirurgias: true,
            planoDeSaude: true,
            hospitalPreferido: true,
            emergencyContactPhone: true,
            biometricEnabled: true,
            criadoEm: true,
          },
        });
        if (!paciente) {
          res.status(404).json({ error: 'Paciente não encontrado' });
          return;
        }
        res.json(paciente);
      } else {
        const profissional = await prisma.profissional.findUnique({
          where: { id },
          select: {
            id: true,
            nome: true,
            email: true,
            cpf: true,
            sexo: true,
            telefone: true,
            profissao: true,
            tipoSanguineo: true,
            alergias: true,
            doencas: true,
            cirurgias: true,
            emergencyContactPhone: true,
            biometricEnabled: true,
            criadoEm: true,
          },
        });
        if (!profissional) {
          res.status(404).json({ error: 'Profissional não encontrado' });
          return;
        }
        res.json(profissional);
      }
    } catch (error) {
      console.error('[authController.perfil] Erro interno:', error);
      res.status(500).json({ error: 'Erro ao buscar dados do perfil' });
    }
  },
};

export default authController;

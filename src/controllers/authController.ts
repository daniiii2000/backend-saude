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
      emergencyContactPhone,
      biometricEnabled = false,
    } = req.body;

    // Normaliza e valida tipo
    const tipoNormalized = (tipo || '').toLowerCase().trim();
    if (!['paciente', 'profissional'].includes(tipoNormalized)) {
      res.status(400).json({ error: 'Tipo inválido. Deve ser "paciente" ou "profissional".' });
      return;
    }

    // Normaliza telefones
    const telefoneClean = String(telefone).replace(/\D/g, '');
    const emergencyClean = String(emergencyContactPhone).replace(/\D/g, '');

    try {
      // Verifica duplicado por email
      const existente =
        tipoNormalized === 'paciente'
          ? await prisma.paciente.findUnique({ where: { email } })
          : await prisma.profissional.findUnique({ where: { email } });

      if (existente) {
        res.status(400).json({ error: 'Email já cadastrado' });
        return;
      }

      // Valida telefone de emergência
      if (!/^\d{8,15}$/.test(emergencyClean)) {
        res.status(400).json({ error: 'Telefone de contato de emergência inválido' });
        return;
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(senha, 10);

      // Criação no banco
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
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        res.status(400).json({ error: 'Esse e-mail já está cadastrado' });
      } else {
        console.error('[authController.register] Erro interno:', error);
        res.status(500).json({ error: 'Erro ao cadastrar usuário' });
      }
    }
  },

  // ---------------------------------------------------
  // Login de usuário
  // ---------------------------------------------------
  async login(req: Request, res: Response): Promise<void> {
    const { email, senha } = req.body;
    if (!email || !senha) {
      res.status(400).json({ error: 'Email e senha são obrigatórios.' });
      return;
    }

    try {
      // Busca primeiro em pacientes
      const pacienteRecord = await prisma.paciente.findUnique({ where: { email } });
      let user;
      let tipo: 'paciente' | 'profissional';

      if (pacienteRecord) {
        user = pacienteRecord;
        tipo = 'paciente';
      } else {
        // Se não for paciente, busca em profissionais
        const profissionalRecord = await prisma.profissional.findUnique({ where: { email } });
        if (!profissionalRecord) {
          res.status(401).json({ error: 'Credenciais inválidas.' });
          return;
        }
        user = profissionalRecord;
        tipo = 'profissional';
      }

      // Verifica senha
      const senhaValida = await bcrypt.compare(senha, user.senha);
      if (!senhaValida) {
        res.status(401).json({ error: 'Credenciais inválidas.' });
        return;
      }

      // Gera JWT
      const token = jwt.sign({ id: user.id, tipo }, JWT_SECRET, { expiresIn: '7d' });

      // Retorna token e dados do usuário
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
};

export default authController;

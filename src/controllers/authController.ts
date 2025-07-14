// src/controllers/authController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { enviarEmailRecuperacao } from '../services/mailService';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'chave_padrao';

const authController = {
  // ---------------------------------------------------
  // Registro de usuário
  // ---------------------------------------------------
  async register(req: Request, res: Response): Promise<void> {
    const {
      nome, email, senha, cpf, sexo, telefone, tipo,
      tipoSanguineo, profissao, alergias, doencas, cirurgias,
      planoDeSaude, hospitalPreferido, emergencyContactPhone,
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
      const existente = tipoNormalized === 'paciente'
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
            nome, email, senha: hashedPassword, cpf, sexo,
            telefone: telefoneClean, tipo: tipoNormalized,
            tipoSanguineo, alergias, doencas, cirurgias,
            planoDeSaude, hospitalPreferido,
            emergencyContactPhone: emergencyClean,
            biometricEnabled,
          },
        });
        res.status(201).json({ message: 'Paciente cadastrado', id: novoPaciente.id });
      } else {
        const novoProfissional = await prisma.profissional.create({
          data: {
            nome, email, senha: hashedPassword, cpf, sexo,
            telefone: telefoneClean, tipo: tipoNormalized,
            profissao, tipoSanguineo, alergias,
            doencas, cirurgias,
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
      let user: any, tipo: 'paciente' | 'profissional', profissao: string | undefined;
      const paciente = await prisma.paciente.findUnique({ where: { email } });
      if (paciente) {
        user = paciente; tipo = 'paciente';
      } else {
        const profissional = await prisma.profissional.findUnique({ where: { email } });
        if (!profissional) {
          res.status(401).json({ error: 'Credenciais inválidas' });
          return;
        }
        user = profissional; tipo = 'profissional';
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
        usuario: { id: user.id, nome: user.nome, email: user.email, tipo, profissao },
      });
    } catch (error) {
      console.error('[login] erro:', error);
      res.status(500).json({ error: 'Erro ao autenticar' });
    }
  },

  // ---------------------------------------------------
  // Esqueci a senha
  // ---------------------------------------------------
  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    console.log('[forgot-password] Entrada recebida para:', email);

    try {
      const paciente = await prisma.paciente.findUnique({ where: { email } });
      const profissional = await prisma.profissional.findUnique({ where: { email } });
      if (!paciente && !profissional) {
        console.log('[forgot-password] email não encontrado, retornando 200');
        res.status(200).json({ message: 'Se você solicitou recuperação, verifique seu e-mail.' });
        return;
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 3600000);
      console.log('[forgot-password] Token gerado:', resetToken);

      if (paciente) {
        await prisma.paciente.update({
          where: { email },
          data: { resetToken, resetExpires },
        });
      } else {
        await prisma.profissional.update({
          where: { email },
          data: { resetToken, resetExpires },
        });
      }

      console.log('[forgot-password] Chamando enviarEmailRecuperacao...');
      await enviarEmailRecuperacao(email, resetToken);
      console.log('[forgot-password] e-mail disparado');

      res.status(200).json({ message: 'Se você solicitou recuperação, verifique seu e-mail.' });
    } catch (err: any) {
      console.error('[forgot-password] ERRO:', err);
      res.status(500).json({ error: 'Erro interno ao processar recuperação de senha.' });
    }
  },

  // ---------------------------------------------------
  // Redefinir a senha
  // ---------------------------------------------------
  async resetPassword(req: Request, res: Response): Promise<void> {
    const { email, token, newPassword } = req.body;
    console.log('[reset-password] Entrada recebida para:', { email, token });

    if (!email || !token || !newPassword) {
      res.status(400).json({
        error: 'Faltam parâmetros: email, token e newPassword são obrigatórios.',
      });
      return;
    }

    try {
      const now = new Date();
      const paciente = await prisma.paciente.findFirst({
        where: { email, resetToken: token, resetExpires: { gt: now } },
      });
      const profissional = await prisma.profissional.findFirst({
        where: { email, resetToken: token, resetExpires: { gt: now } },
      });

      if (!paciente && !profissional) {
        console.log('[reset-password] token inválido ou expirado');
        res.status(400).json({ error: 'Token inválido ou expirado.' });
        return;
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      if (paciente) {
        await prisma.paciente.update({
          where: { email },
          data: { senha: hashed, resetToken: null, resetExpires: null },
        });
      } else {
        await prisma.profissional.update({
          where: { email },
          data: { senha: hashed, resetToken: null, resetExpires: null },
        });
      }
      console.log('[reset-password] Senha redefinida com sucesso para:', email);

      res.status(200).json({ message: 'Senha redefinida com sucesso.' });
    } catch (err: any) {
      console.error('[reset-password] ERRO:', err);
      res.status(500).json({ error: 'Erro interno ao redefinir senha.' });
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

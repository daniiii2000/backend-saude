// src/routes/authRoutes.ts
import express, { Router, Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import authController from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { PrismaClient } from '@prisma/client';

const router: Router = express.Router();
const prisma = new PrismaClient();

// Configura tu SMTP con variables de entorno
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT!),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Registro y login
router.post('/register', authController.register);
router.post('/login', authController.login);

// Solicitar recuperación de contraseña
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  console.log('[authRoutes] POST /forgot-password request for:', email);

  if (!email) {
    res.status(400).json({ error: 'Email é obrigatório' });
    return;
  }

  try {
    const paciente = await prisma.paciente.findUnique({ where: { email } });
    const profissional = await prisma.profissional.findUnique({ where: { email } });
    const user = paciente || profissional;

    if (!user) {
      console.log('[authRoutes] Email não encontrado, retornando 200');
      res.sendStatus(200);
      return;
    }

    // Generar token y expiración (1h)
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    console.log('[authRoutes] Token generated for:', email, 'token:', token);

    // Guarda token en la tabla correspondiente
    if (paciente) {
      await prisma.paciente.update({
        where: { email },
        data: { resetToken: token, resetExpires: expires },
      });
    } else {
      await prisma.profissional.update({
        where: { email },
        data: { resetToken: token, resetExpires: expires },
      });
    }

    // Envía correo con enlace de restablecimiento
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    try {
      console.log('[authRoutes] Attempting to send reset email to:', email);
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM!,
        to: email,
        subject: 'Recuperação de senha',
        html: `
          <p>Você solicitou redefinir sua senha.</p>
          <p>Clique <a href="${resetLink}">aqui</a> para criar uma nova senha (válido por 1h).</p>
        `,
      });
      console.log('[authRoutes] Email sent, messageId:', info.messageId);
    } catch (mailErr) {
      console.error('[authRoutes] ERRO ao enviar e-mail de recuperação:', mailErr);
      // Continua o fluxo para não expor erro ao cliente
    }

    res.status(200).json({ message: 'Se você solicitou recuperação, verifique seu e-mail.' });
    return;
  } catch (err) {
    console.error('[authRoutes] ERRO geral em forgot-password:', err);
    res.status(500).json({ error: 'Erro interno ao processar recuperação de senha' });
    return;
  }
});

// Restablecer contraseña
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  const { email, token, newPassword } = req.body;
  console.log('[authRoutes] POST /reset-password for:', email);

  if (!email || !token || !newPassword) {
    res.status(400).json({ error: 'Faltam parâmetros (email, token, newPassword)' });
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
      res.status(400).json({ error: 'Token inválido ou expirado' });
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
    console.log('[authRoutes] Password reset successful for:', email);

    res.json({ message: 'Senha redefinida com sucesso' });
    return;
  } catch (error) {
    console.error('[authRoutes] ERRO em reset-password:', error);
    res.status(500).json({ error: 'Erro interno ao redefinir senha' });
    return;
  }
});

// Perfil autenticado con retorno completo
router.get('/perfil', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const user = req.user!;
  console.log('[authRoutes] GET /perfil para user id:', user.id);

  try {
    if (user.tipo === 'paciente') {
      const paciente = await prisma.paciente.findUnique({ where: { id: user.id } });
      if (!paciente) {
        res.status(404).json({ error: 'Paciente não encontrado' });
        return;
      }
      res.json(paciente);
      return;
    }

    const profissional = await prisma.profissional.findUnique({ where: { id: user.id } });
    if (!profissional) {
      res.status(404).json({ error: 'Profissional não encontrado' });
      return;
    }
    res.json(profissional);
    return;
  } catch (error) {
    console.error('[authRoutes] ERRO em perfil:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do perfil' });
    return;
  }
});

export default router;

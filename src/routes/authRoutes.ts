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
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Registro y login
router.post('/register', authController.register);
router.post('/login', authController.login);

// Solicitar recuperación de contraseña
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email é obrigatório' });
    return;
  }

  const paciente = await prisma.paciente.findUnique({ where: { email } });
  const profissional = await prisma.profissional.findUnique({ where: { email } });
  const user = paciente || profissional;
  if (!user) {
    // Siempre 200 para no revelar existencia
    res.sendStatus(200);
    return;
  }

  // Generar token y expiración (1h)
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000);

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
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Recuperação de senha',
    html: `
      <p>Você solicitou redefinir sua senha.</p>
      <p>Clique <a href="${resetLink}">aqui</a> para criar uma nova senha (válido por 1h).</p>
    `,
  });

  res.sendStatus(200);
});

// Restablecer contraseña
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) {
    res.status(400).json({ error: 'Faltam parâmetros (email, token, newPassword)' });
    return;
  }

  // Verifica token y expiración
  const paciente = await prisma.paciente.findFirst({
    where: { email, resetToken: token, resetExpires: { gt: new Date() } },
  });
  const profissional = await prisma.profissional.findFirst({
    where: { email, resetToken: token, resetExpires: { gt: new Date() } },
  });
  if (!paciente && !profissional) {
    res.status(400).json({ error: 'Token inválido ou expirado' });
    return;
  }

  // Hashea la nueva contraseña
  const hashed = await bcrypt.hash(newPassword, 10);

  // Actualiza la contraseña y limpia el token
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

  res.json({ message: 'Senha redefinida com sucesso' });
});

// Perfil autenticado con retorno completo
router.get(
  '/perfil',
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user!;
    const { id, tipo } = user;
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
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar dados do perfil' });
    }
  }
);

export default router;

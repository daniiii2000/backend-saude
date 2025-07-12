// src/services/mailService.ts

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();  // carrega variáveis do .env

// 1) Cria o transporter com SMTP do Gmail (app password)
export const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,                // ex: 'smtp.gmail.com'
  port:   Number(process.env.SMTP_PORT),        // ex: 465
  secure: true,                                 // true para porta 465
  auth: {
    user: process.env.SMTP_USER,                // ex: 'seu.email@gmail.com'
    pass: process.env.SMTP_PASS,                // App Password gerada
  }
});

// 2) Verifica conexão SMTP na inicialização
transporter.verify()
  .then(() => console.log('✅ SMTP conectado e pronto para enviar!'))
  .catch(err => console.error('❌ Falha no verify do SMTP:', err));

// 3) Função que dispara o e-mail de recuperação
export async function enviarEmailRecuperacao(toEmail: string, token: string) {
  const resetUrl = `https://seusite.com/reset-password?token=${token}`;
  
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,             // ex: 'seu.email@gmail.com'
    to:      toEmail,
    subject: 'Recuperação de Senha',
    html: `
      <p>Você solicitou recuperação de senha.</p>
      <p>Clique no link para redefinir: <a href="${resetUrl}">${resetUrl}</a></p>
      <p>Se você não pediu, ignore este e-mail.</p>
    `
  });
}

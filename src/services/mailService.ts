// src/services/mailService.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Lê configuração de segurança (true para SSL/TLS na porta 465, false para STARTTLS na 587)
const secure = process.env.SMTP_SECURE === 'true';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,                     // ex: 'smtp.gmail.com'
  port: Number(process.env.SMTP_PORT),              // 587 (STARTTLS) ou 465 (SSL)
  secure,                                           // true para porta 465, false para 587
  auth: {
    user: process.env.SMTP_USER,                    // seu.email@gmail.com
    pass: process.env.SMTP_PASS,                    // App Password do Gmail
  },
  tls: {
    // Permite conexões mesmo se o certificado não for totalmente confiável
    rejectUnauthorized: false
  }
});

// Verificação na inicialização para diagnosticar problemas de conexão SMTP
transporter.verify()
  .then(() => console.log('✅ SMTP conectado e pronto para enviar!'))
  .catch(err => console.error('❌ Falha no verify do SMTP:', err));

/**
 * Envia e-mail de recuperação de senha.
 * O link usa FRONTEND_URL do .env para compor a URL de reset.
 */
export async function enviarEmailRecuperacao(toEmail: string, token: string) {
  const frontend = process.env.FRONTEND_URL?.replace(/\/$/, ''); 
  const resetUrl = `${frontend}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,                     // ex: 'seu.email@gmail.com'
    to: toEmail,
    subject: 'Recuperação de Senha',
    html: `
      <p>Você solicitou recuperação de senha.</p>
      <p>Clique no link para redefinir sua senha:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <hr/>
      <p>Se você não solicitou, desconsidere este e-mail.</p>
    `
  });
}

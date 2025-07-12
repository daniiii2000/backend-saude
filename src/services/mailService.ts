// src/services/mailService.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configura o transporter para usar o relay SMTP do SparkPost
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sparkpostmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // false para STARTTLS
  auth: {
    user: process.env.SMTP_USER || 'SMTP_Injection',
    pass: process.env.SMTP_PASS!, 
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 10_000,
});

// Verifica conexão SMTP na inicialização
transporter.verify()
  .then(() => console.log('✅ SparkPost SMTP relay pronto para enviar!'))
  .catch(err => console.error('❌ Falha no SparkPost SMTP relay:', err));

/**
 * Envia e-mail de recuperação de senha usando o relay SMTP do SparkPost.
 * Usa deep link definido em FRONTEND_URL, sem repetir caminho.
 */
export async function enviarEmailRecuperacao(toEmail: string, token: string) {
  const frontend = process.env.FRONTEND_URL?.replace(/\/$/, '') || '';
  // Se FRONTEND_URL for algo como "appsaudeexpopaciente://reset-password",
  // basta anexar querystring ?token=
  const resetUrl = `${frontend}?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM!,      
    to: toEmail,
    subject: 'Recuperação de Senha',
    html: `
      <p>Você solicitou recuperação de senha.</p>
      <p>Clique no link para redefinir sua senha:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <hr/>
      <p>Se você não solicitou, ignore este e-mail.</p>
    `,
  });
}

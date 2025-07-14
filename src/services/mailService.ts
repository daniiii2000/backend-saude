// src/services/mailService.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configura o transporter para usar o relay SMTP do SparkPost
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT!),
  secure: false, // false para STARTTLS
  auth: {
    user: process.env.SMTP_USER!, // obrigatório: 'SMTP_Injection'
    pass: process.env.SMTP_PASS!, // obrigatório: sua API Key do SparkPost
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
  const frontend = process.env.FRONTEND_URL?.replace(/\/$/, '')!;
  const resetUrl = `${frontend}?token=${token}`;

  try {
    console.log('[mailService] tentando enviar e-mail de recuperação para', toEmail);
    const info = await transporter.sendMail({
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
    console.log('[mailService] e-mail enviado com sucesso, messageId:', info.messageId);
  } catch (err) {
    console.error('[mailService] ERRO ao enviar e-mail de recuperação:', err);
    throw err; // relança para que o controlador possa tratar e retornar erro 500
  }
}

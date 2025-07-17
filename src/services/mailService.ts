// src/services/mailService.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Validações iniciais de variáveis de ambiente
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
  FRONTEND_URL,
} = process.env;

if (
  !SMTP_HOST ||
  !SMTP_PORT ||
  !SMTP_USER ||
  !SMTP_PASS ||
  !EMAIL_FROM ||
  !FRONTEND_URL
) {
  throw new Error(
    '⚠️ Faltam variáveis de ambiente obrigatórias em .env: ' +
      'SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, FRONTEND_URL'
  );
}

// Configura o transporter para usar o relay SMTP do SparkPost
export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: false, // use STARTTLS
  auth: {
    user: SMTP_USER,  // sempre 'SMTP_Injection'
    pass: SMTP_PASS,  // sua API Key do SparkPost
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 10_000,
});

// Verifica conexão SMTP na inicialização
transporter
  .verify()
  .then(() => console.log('✅ SparkPost SMTP relay pronto para enviar!'))
  .catch((err) => console.error('❌ Falha no SparkPost SMTP relay:', err));

/**
 * Envia e-mail de recuperação de senha usando o relay SMTP do SparkPost.
 * Usa deep link definido em FRONTEND_URL, sem repetir caminho.
 */
export async function enviarEmailRecuperacao(toEmail: string, token: string) {
  // Afirmação não-nula para FRONTEND_URL
  const frontend = FRONTEND_URL!.replace(/\/$/, '');
  const resetUrl = `${frontend}?token=${token}`;

  try {
    console.log(
      '[mailService] tentando enviar e-mail de recuperação para',
      toEmail
    );
    const info = await transporter.sendMail({
      from: EMAIL_FROM, // ex: 'no-reply@santiagoservin.com.br'
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
    console.log(
      '[mailService] e-mail enviado com sucesso, messageId:',
      info.messageId
    );
  } catch (err) {
    console.error('[mailService] ERRO ao enviar e-mail de recuperação:', err);
    throw err;
  }
}

// src/services/mailService.ts
import SparkPost from 'sparkpost';
import dotenv from 'dotenv';

dotenv.config();

// Inicializa o cliente HTTP do SparkPost
// SPARKPOST_API_KEY deve estar definido no .env ou no painel da Render
const sparkpost = new SparkPost(process.env.SPARKPOST_API_KEY || '');

if (!process.env.SPARKPOST_API_KEY) {
  console.error('❌ SPARKPOST_API_KEY não definida!');
}

/**
 * Envia e-mail de recuperação de senha usando a API HTTP do SparkPost.
 */
export async function enviarEmailRecuperacao(toEmail: string, token: string) {
  const frontend = process.env.FRONTEND_URL?.replace(/\/$/, '') || '';
  const resetUrl = `${frontend}/reset-password?token=${token}`;
  const fromEmail = process.env.EMAIL_FROM as string;  // ex: 'no-reply@seudominio.com'

  try {
    await sparkpost.transmissions.send({
      content: {
        from: fromEmail,
        subject: 'Recuperação de Senha',
        html: `
          <p>Você solicitou recuperação de senha.</p>
          <p>Clique no link para redefinir sua senha:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <hr/>
          <p>Se você não solicitou, desconsidere este e-mail.</p>
        `
      },
      recipients: [
        { address: toEmail }
      ]
    });
    console.log(`✅ E-mail de recuperação enviado para ${toEmail}`);
  } catch (err: any) {
    console.error('❌ Erro ao enviar e-mail via SparkPost:', err);
    throw err;
  }
}

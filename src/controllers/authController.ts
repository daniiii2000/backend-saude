import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'chave_padrao';

const authController = {
  async register(req: Request, res: Response): Promise<void> {
    // ... seu código de register permanece igual ...
  },

  async login(req: Request, res: Response): Promise<void> {
    // 🔔 Log para confirmar que a requisição de login chegou ao servidor
    console.log('🔔 POST /auth/login recebido:', req.body);

    const { email, senha } = req.body;

    try {
      const paciente = await prisma.paciente.findUnique({ where: { email } });
      const profissional = await prisma.profissional.findUnique({ where: { email } });
      const usuario = paciente || profissional;

      if (!usuario) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      if (!usuario.senha) {
        res.status(500).json({ error: 'Senha não definida no banco de dados' });
        return;
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        res.status(401).json({ error: 'Senha incorreta' });
        return;
      }

      const token = jwt.sign(
        {
          id: usuario.id,
          email: usuario.email,
          tipo: (usuario.tipo || '').toLowerCase().trim(),
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        message: 'Login realizado com sucesso',
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo: (usuario.tipo || '').toLowerCase().trim(),
        },
      });
    } catch (error) {
      console.error('[authController.login] Erro interno:', error);
      res.status(500).json({ error: 'Erro no login' });
    }
  },
};

export default authController;

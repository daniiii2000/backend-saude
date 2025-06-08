import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'chave_padrao';

const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const { nome, email, senha, cpf, sexo, telefone, tipo, profissao } = req.body;

    try {
      const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });

      if (usuarioExistente) {
        res.status(400).json({ error: 'Email já cadastrado' });
        return;
      }

      const hashedPassword = await bcrypt.hash(senha, 10);

      const novoUsuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          senha: hashedPassword,
          cpf,
          sexo,
          telefone,
          tipo,
          profissional: tipo === 'profissional'
            ? { create: { profissao: profissao || 'profissional' } }
            : undefined,
          paciente: tipo === 'paciente'
            ? {
                create: {
                  doencas: req.body.doencas || null,
                  alergias: req.body.alergias || null,
                  cirurgias: req.body.cirurgias || null,
                }
              }
            : undefined,
        },
      });

      res.status(201).json({ message: 'Usuário cadastrado com sucesso', usuarioId: novoUsuario.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao cadastrar usuário' });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    const { email, senha } = req.body;

    try {
      const usuario = await prisma.usuario.findUnique({
        where: { email },
        include: { paciente: true, profissional: true },
      });

      if (!usuario) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        res.status(401).json({ error: 'Senha incorreta' });
        return;
      }

      const token = jwt.sign(
        { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
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
          tipo: usuario.tipo,
          perfil: usuario.perfil,
          paciente: usuario.paciente,
          profissional: usuario.profissional,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro no login' });
    }
  },
};

export default authController;

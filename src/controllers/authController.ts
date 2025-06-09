import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'chave_padrao';

const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const {
      nome,
      email,
      senha,
      cpf,
      sexo,
      telefone,
      tipo,
      tipoSanguineo,
      profissao,
      alergias,
      doencas,
      cirurgias,
    } = req.body;

    try {
      const pacienteExistente = await prisma.paciente.findUnique({ where: { email } });
      const profissionalExistente = await prisma.profissional.findUnique({ where: { email } });

      if (pacienteExistente || profissionalExistente) {
        res.status(400).json({ error: 'Email já cadastrado' });
        return;
      }

      const hashedPassword = await bcrypt.hash(senha, 10);

      if (tipo === 'paciente') {
        const novoPaciente = await prisma.paciente.create({
          data: {
            nome,
            email,
            senha: hashedPassword,
            cpf,
            sexo,
            telefone,
            tipo,
            tipoSanguineo,
            alergias,
            doencas,
            cirurgias,
          },
        });

        res.status(201).json({ message: 'Paciente cadastrado com sucesso', id: novoPaciente.id });
      } else if (tipo === 'profissional') {
        const novoProfissional = await prisma.profissional.create({
          data: {
            nome,
            email,
            senha: hashedPassword,
            cpf,
            sexo,
            telefone,
            tipo,
            profissao,
            tipoSanguineo,
            alergias,
            doencas,
            cirurgias,
          },
        });

        res.status(201).json({ message: 'Profissional cadastrado com sucesso', id: novoProfissional.id });
      } else {
        res.status(400).json({ error: 'Tipo inválido. Deve ser "paciente" ou "profissional".' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao cadastrar usuário' });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
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
          tipo: usuario.tipo,
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
          tipo: usuario.tipo,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro no login' });
    }
  },
};

export default authController;

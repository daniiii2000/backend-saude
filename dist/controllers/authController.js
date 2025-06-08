"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'chave_padrao';
const authController = {
    async register(req, res) {
        const { nome, email, senha, cpf, sexo, telefone, tipo, tipoSanguineo, profissao, alergias, doencas, cirurgias, } = req.body;
        try {
            const pacienteExistente = await prisma.paciente.findUnique({ where: { email } });
            const profissionalExistente = await prisma.profissional.findUnique({ where: { email } });
            if (pacienteExistente || profissionalExistente) {
                res.status(400).json({ error: 'Email já cadastrado' });
                return;
            }
            const hashedPassword = await bcryptjs_1.default.hash(senha, 10);
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
            }
            else if (tipo === 'profissional') {
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
            }
            else {
                res.status(400).json({ error: 'Tipo inválido. Deve ser "paciente" ou "profissional".' });
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao cadastrar usuário' });
        }
    },
    async login(req, res) {
        const { email, senha } = req.body;
        try {
            const paciente = await prisma.paciente.findUnique({ where: { email } });
            const profissional = await prisma.profissional.findUnique({ where: { email } });
            const usuario = paciente || profissional;
            if (!usuario) {
                res.status(404).json({ error: 'Usuário não encontrado' });
                return;
            }
            const senhaValida = await bcryptjs_1.default.compare(senha, usuario.senha);
            if (!senhaValida) {
                res.status(401).json({ error: 'Senha incorreta' });
                return;
            }
            const token = jsonwebtoken_1.default.sign({
                id: usuario.id,
                email: usuario.email,
                tipo: usuario.tipo,
            }, JWT_SECRET, { expiresIn: '7d' });
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
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro no login' });
        }
    },
};
exports.default = authController;

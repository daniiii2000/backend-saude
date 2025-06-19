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
        // ... seu código de register permanece igual ...
    },
    async login(req, res) {
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
            const senhaValida = await bcryptjs_1.default.compare(senha, usuario.senha);
            if (!senhaValida) {
                res.status(401).json({ error: 'Senha incorreta' });
                return;
            }
            const token = jsonwebtoken_1.default.sign({
                id: usuario.id,
                email: usuario.email,
                tipo: (usuario.tipo || '').toLowerCase().trim(),
            }, JWT_SECRET, { expiresIn: '7d' });
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
        }
        catch (error) {
            console.error('[authController.login] Erro interno:', error);
            res.status(500).json({ error: 'Erro no login' });
        }
    },
};
exports.default = authController;

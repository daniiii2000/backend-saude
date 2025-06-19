"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'chave_padrao';
const authController = {
    async register(req, res) {
        console.log('🔔 POST /auth/register recebido:', req.body);
        const { nome, email, senha, cpf, sexo, telefone, tipo, tipoSanguineo, profissao, alergias, doencas, cirurgias, emergencyContactPhone, biometricEnabled = false, } = req.body;
        // Log para verificar o tipo exato
        console.log('››› Tipo recebido:', tipo);
        // Normaliza telefones para ficar só dígitos
        const telefoneClean = String(telefone).replace(/\D/g, '');
        const emergencyClean = String(emergencyContactPhone).replace(/\D/g, '');
        try {
            // 1. Normaliza e valida o tipo
            const tipoNormalized = (tipo || '').toLowerCase().trim();
            if (!['paciente', 'profissional'].includes(tipoNormalized)) {
                res.status(400).json({ error: 'Tipo inválido. Deve ser "paciente" ou "profissional".' });
                return;
            }
            // 2. Verifica se já existe usuário com este email
            const existente = tipoNormalized === 'paciente'
                ? await prisma.paciente.findUnique({ where: { email } })
                : await prisma.profissional.findUnique({ where: { email } });
            if (existente) {
                res.status(400).json({ error: 'Email já cadastrado' });
                return;
            }
            // 3. Valida telefone de emergência (apenas dígitos, 8–15 chars)
            const phoneRegex = /^\d{8,15}$/;
            if (!phoneRegex.test(emergencyClean)) {
                res.status(400).json({ error: 'Telefone de contato de emergência inválido' });
                return;
            }
            // 4. Hash da senha
            const hashedPassword = await bcryptjs_1.default.hash(senha, 10);
            // 5. Cria o registro no banco
            if (tipoNormalized === 'paciente') {
                const novoPaciente = await prisma.paciente.create({
                    data: {
                        nome,
                        email,
                        senha: hashedPassword,
                        cpf,
                        sexo,
                        telefone: telefoneClean,
                        tipo: tipoNormalized,
                        tipoSanguineo,
                        alergias,
                        doencas,
                        cirurgias,
                        emergencyContactPhone: emergencyClean,
                        biometricEnabled,
                    },
                });
                res.status(201).json({ message: 'Paciente cadastrado com sucesso', id: novoPaciente.id });
            }
            else {
                const novoProfissional = await prisma.profissional.create({
                    data: {
                        nome,
                        email,
                        senha: hashedPassword,
                        cpf,
                        sexo,
                        telefone: telefoneClean,
                        tipo: tipoNormalized,
                        profissao,
                        tipoSanguineo,
                        alergias,
                        doencas,
                        cirurgias,
                        emergencyContactPhone: emergencyClean,
                        biometricEnabled,
                    },
                });
                res.status(201).json({ message: 'Profissional cadastrado com sucesso', id: novoProfissional.id });
            }
        }
        catch (error) {
            if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
                res.status(400).json({ error: 'Esse e-mail já está cadastrado' });
            }
            else {
                console.error('[authController.register] Erro interno:', error);
                res.status(500).json({ error: 'Erro ao cadastrar usuário' });
            }
        }
    },
    async login(req, res) {
        // ... seu código de login permanece inalterado
    },
};
exports.default = authController;

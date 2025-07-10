"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const authorize_1 = require("../middlewares/authorize");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// ✅ Obter dados do paciente autenticado
router.get('/meus-dados', authMiddleware_1.authMiddleware, (0, authorize_1.authorize)('paciente'), async (req, res) => {
    const user = req.user;
    try {
        const paciente = await prisma.paciente.findUnique({ where: { id: user.id } });
        if (!paciente) {
            res.status(404).json({ error: 'Paciente não encontrado' });
            return;
        }
        res.json(paciente);
    }
    catch (error) {
        res.status(400).json({ error: 'Erro ao buscar dados' });
    }
});
// ✅ Atualizar dados do próprio paciente
router.patch('/atualizar', authMiddleware_1.authMiddleware, (0, authorize_1.authorize)('paciente'), async (req, res) => {
    const { id } = req.user;
    const { nome, telefone, sexo, doencas, alergias, cirurgias, tipoSanguineo, planoDeSaude, hospitalPreferido } = req.body;
    try {
        const paciente = await prisma.paciente.update({
            where: { id },
            data: {
                nome,
                telefone,
                sexo,
                doencas,
                alergias,
                cirurgias,
                tipoSanguineo,
                planoDeSaude,
                hospitalPreferido
            },
        });
        res.json({ message: 'Dados atualizados com sucesso', paciente });
    }
    catch (error) {
        res.status(400).json({ error: 'Erro ao atualizar dados' });
    }
});
// ✅ Cadastro de novo paciente com todos os campos obrigatórios
router.post('/', async (req, res) => {
    const { nome, email, senha, cpf, sexo, telefone, tipo, tipoSanguineo, alergias, doencas, cirurgias, planoDeSaude, hospitalPreferido, emergencyContactPhone, biometricEnabled } = req.body;
    if (!nome || !email || !senha || !cpf || !sexo || !telefone ||
        !tipo || !emergencyContactPhone) {
        res.status(400).json({ error: 'Campos obrigatórios faltando' });
        return;
    }
    try {
        const novoPaciente = await prisma.paciente.create({
            data: {
                nome,
                email,
                senha,
                cpf,
                sexo,
                telefone,
                tipo,
                tipoSanguineo,
                alergias,
                doencas,
                cirurgias,
                planoDeSaude,
                hospitalPreferido,
                emergencyContactPhone,
                biometricEnabled: biometricEnabled ?? false
            }
        });
        res.status(201).json(novoPaciente);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao cadastrar paciente' });
    }
});
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const authorize_1 = require("../middlewares/authorize");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// 🔁 Atualizar dados clínicos – somente profissionais
router.put('/:id', authMiddleware_1.authMiddleware, (0, authorize_1.authorize)('profissional'), async (req, res) => {
    const pacienteId = req.params.id;
    const { doencas, alergias, cirurgias } = req.body;
    console.log('🔄 Atualizando paciente ID:', pacienteId);
    try {
        const paciente = await prisma.paciente.update({
            where: { id: pacienteId },
            data: {
                doencas,
                alergias,
                cirurgias
            }
        });
        res.json({ message: 'Dados clínicos atualizados com sucesso', paciente });
    }
    catch (error) {
        console.error('❌ Erro ao atualizar paciente:', error);
        res.status(400).json({ error: 'Erro ao atualizar paciente' });
    }
});
// 🔍 Ver um paciente (profissional)
router.get('/:id', authMiddleware_1.authMiddleware, (0, authorize_1.authorize)('profissional'), async (req, res) => {
    const pacienteId = req.params.id;
    try {
        const paciente = await prisma.paciente.findUnique({
            where: { id: pacienteId }
        });
        if (!paciente) {
            res.status(404).json({ error: 'Paciente não encontrado' });
            return;
        }
        res.json(paciente);
    }
    catch (error) {
        console.error('❌ Erro ao buscar paciente:', error);
        res.status(400).json({ error: 'Erro ao buscar paciente' });
    }
});
// 👤 Paciente vê seus próprios dados
router.get('/meus-dados', authMiddleware_1.authMiddleware, async (req, res) => {
    const user = req.user;
    if (!user || user.tipo !== 'paciente') {
        res.status(403).json({ error: 'Acesso permitido apenas para pacientes' });
        return;
    }
    try {
        const paciente = await prisma.paciente.findUnique({
            where: { id: user.id }
        });
        if (!paciente) {
            res.status(404).json({ error: 'Paciente não encontrado' });
            return;
        }
        res.json(paciente);
    }
    catch (error) {
        console.error('❌ Erro ao buscar dados do paciente:', error);
        res.status(400).json({ error: 'Erro ao buscar dados' });
    }
});
// 📋 Listar todos os pacientes – somente profissionais
router.get('/', authMiddleware_1.authMiddleware, (0, authorize_1.authorize)('profissional'), async (req, res) => {
    try {
        const pacientes = await prisma.paciente.findMany();
        res.json(pacientes);
    }
    catch (error) {
        console.error('❌ Erro ao listar pacientes:', error);
        res.status(400).json({ error: 'Erro ao listar pacientes' });
    }
});
exports.default = router;

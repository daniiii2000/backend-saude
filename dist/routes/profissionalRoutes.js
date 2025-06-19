"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const authorize_1 = require("../middlewares/authorize");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// ✅ Ver dados do profissional autenticado
router.get('/meus-dados', authMiddleware_1.authMiddleware, (0, authorize_1.authorize)('profissional'), async (req, res) => {
    const user = req.user;
    try {
        const profissional = await prisma.profissional.findUnique({
            where: { id: user.id }
        });
        if (!profissional) {
            res.status(404).json({ error: 'Profissional não encontrado' });
            return;
        }
        res.json(profissional);
    }
    catch (error) {
        console.error('Erro ao buscar dados do profissional:', error);
        res.status(400).json({ error: 'Erro ao buscar dados' });
    }
});
// ✅ Atualizar dados do próprio profissional (não pode alterar profissão)
router.patch('/atualizar', authMiddleware_1.authMiddleware, (0, authorize_1.authorize)('profissional'), async (req, res) => {
    const { id } = req.user;
    const { nome, telefone, sexo } = req.body;
    try {
        const profissional = await prisma.profissional.update({
            where: { id },
            data: { nome, telefone, sexo },
        });
        res.json({ message: 'Dados atualizados com sucesso', profissional });
    }
    catch (error) {
        res.status(400).json({ error: 'Erro ao atualizar dados' });
    }
});
// ✅ Médico pode atualizar dados de qualquer paciente
router.patch('/atualizar-paciente/:id', authMiddleware_1.authMiddleware, (0, authorize_1.authorize)('profissional'), async (req, res) => {
    const { id: pacienteId } = req.params;
    const { id: profissionalId } = req.user;
    try {
        const profissional = await prisma.profissional.findUnique({ where: { id: profissionalId } });
        if (!profissional || profissional.profissao.toLowerCase() !== 'médico') {
            res.status(403).json({ error: 'Apenas médicos podem atualizar dados de pacientes' });
            return;
        }
        const { nome, telefone, sexo, doencas, alergias, cirurgias, tipoSanguineo } = req.body;
        const pacienteAtualizado = await prisma.paciente.update({
            where: { id: pacienteId },
            data: { nome, telefone, sexo, doencas, alergias, cirurgias, tipoSanguineo },
        });
        res.json({ message: 'Paciente atualizado com sucesso', paciente: pacienteAtualizado });
    }
    catch (error) {
        res.status(400).json({ error: 'Erro ao atualizar paciente' });
    }
});
exports.default = router;

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
    const { nome, telefone, sexo, doencas, alergias, cirurgias, tipoSanguineo } = req.body;
    try {
        const paciente = await prisma.paciente.update({
            where: { id },
            data: { nome, telefone, sexo, doencas, alergias, cirurgias, tipoSanguineo },
        });
        res.json({ message: 'Dados atualizados com sucesso', paciente });
    }
    catch (error) {
        res.status(400).json({ error: 'Erro ao atualizar dados' });
    }
});
exports.default = router;

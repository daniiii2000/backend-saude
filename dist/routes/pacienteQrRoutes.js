"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
/**
 * GET /paciente/qr/:id
 * Solo médicos autenticados pueden acceder
 */
router.get('/paciente/qr/:id', authMiddleware_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user || user.tipo !== 'profissional' || user.profissao?.toLowerCase() !== 'médico') {
            res.status(403).json({ error: 'Acesso negado. Apenas médicos podem acessar dados do paciente.' });
            return;
        }
        const paciente = await prisma.paciente.findUnique({
            where: { id },
            select: {
                nome: true,
                tipoSanguineo: true,
                doencas: true,
                alergias: true,
                cirurgias: true,
            },
        });
        if (!paciente) {
            res.status(404).json({ error: 'Paciente não encontrado.' });
            return;
        }
        res.json(paciente);
    }
    catch (error) {
        console.error('Erro ao buscar dados do paciente por QR:', error);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});
exports.default = router;

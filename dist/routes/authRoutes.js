"use strict";
// src/routes/authRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = __importDefault(require("../controllers/authController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Cadastro e login
router.post('/register', authController_1.default.register);
router.post('/login', authController_1.default.login);
// Perfil autenticado com retorno completo
router.get('/perfil', authMiddleware_1.authMiddleware, async (req, res) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
    }
    const { id, tipo } = user;
    try {
        if (tipo === 'paciente') {
            const paciente = await prisma.paciente.findUnique({ where: { id } });
            if (!paciente) {
                res.status(404).json({ error: 'Paciente não encontrado' });
                return;
            }
            res.json(paciente);
        }
        else if (tipo === 'profissional') {
            const profissional = await prisma.profissional.findUnique({ where: { id } });
            if (!profissional) {
                res.status(404).json({ error: 'Profissional não encontrado' });
                return;
            }
            res.json(profissional);
        }
        else {
            res.status(400).json({ error: 'Tipo de usuário inválido' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar dados do perfil' });
    }
});
exports.default = router;

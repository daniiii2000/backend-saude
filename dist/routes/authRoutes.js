"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = __importDefault(require("../controllers/authController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const authorize_1 = require("../middlewares/authorize");
const router = (0, express_1.Router)();
// Rotas públicas
router.post('/register', authController_1.default.register);
router.post('/login', authController_1.default.login);
// Rota protegida genérica (qualquer usuário autenticado)
router.get('/perfil', authMiddleware_1.authMiddleware, (req, res) => {
    const usuario = req.user; // já tipado pelo middleware
    res.json({ message: 'Acesso autorizado!', usuario });
});
// Rota só para profissionais
router.get('/area-profissional', authMiddleware_1.authMiddleware, (0, authorize_1.authorize)('profissional'), (req, res) => {
    res.json({ message: 'Bem-vindo à área dos profissionais!' });
});
// Rota só para pacientes
router.get('/area-paciente', authMiddleware_1.authMiddleware, (0, authorize_1.authorize)('paciente'), (req, res) => {
    res.json({ message: 'Área exclusiva para pacientes!' });
});
exports.default = router;

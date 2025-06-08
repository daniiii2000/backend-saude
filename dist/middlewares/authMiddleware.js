"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'chave_padrao';
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.warn('⚠️ [AUTH] Token não fornecido no cabeçalho Authorization');
        res.status(401).json({ error: 'Token não fornecido' });
        return;
    }
    const [prefixo, token] = authHeader.split(' ');
    if (prefixo !== 'Bearer' || !token) {
        console.warn('⚠️ [AUTH] Cabeçalho Authorization mal formatado');
        res.status(401).json({ error: 'Formato do token inválido' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        console.log(`✅ [AUTH] Usuário autenticado: ${decoded.email} (ID: ${decoded.id})`);
        next();
    }
    catch (err) {
        console.error('❌ [AUTH] Erro ao verificar token:', err);
        res.status(401).json({ error: 'Token inválido' });
    }
};
exports.authMiddleware = authMiddleware;

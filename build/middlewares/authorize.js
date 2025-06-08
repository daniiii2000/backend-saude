"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = authorize;
function authorize(permittedTipo) {
    return (req, res, next) => {
        const usuario = req.user;
        if (!usuario || usuario.tipo !== permittedTipo) {
            res.status(403).json({ error: 'Acesso negado: perfil não autorizado' });
            return; // apenas return, sem retornar o `res` diretamente
        }
        next();
    };
}

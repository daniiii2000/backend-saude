import { RequestHandler } from 'express';

export const authorize = (tipoPermitido: 'paciente' | 'profissional'): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(403).json({ error: 'Usuário não autenticado' });
      return;
    }

    if (req.user.tipo !== tipoPermitido) {
      res.status(403).json({ error: 'Acesso não autorizado para este tipo de usuário' });
      return;
    }

    return next();
  };
};

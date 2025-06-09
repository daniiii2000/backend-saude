import { RequestHandler } from 'express';

export const authorize = (tipoPermitido: 'paciente' | 'profissional'): RequestHandler => {
  return (req, res, next) => {
    console.log('authorize: tipoPermitido =', tipoPermitido);
    console.log('authorize: req.user.tipo =', req.user?.tipo);

    if (!req.user) {
      console.warn('authorize: usuário não autenticado');
      res.status(403).json({ error: 'Usuário não autenticado' });
      return;
    }

    const tipoUser = (req.user.tipo || '').toLowerCase().trim();
    const tipoReq = tipoPermitido.toLowerCase().trim();

    if (tipoUser !== tipoReq) {
      console.warn(`authorize: acesso negado. Tipo do usuário (${tipoUser}) diferente do esperado (${tipoReq})`);
      res.status(403).json({ error: 'Acesso não autorizado para este tipo de usuário' });
      return;
    }

    console.log('authorize: acesso autorizado');
    next();
  };
};

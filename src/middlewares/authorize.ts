import { RequestHandler } from 'express';

export function authorize(permittedTipo: 'paciente' | 'profissional'): RequestHandler {
  return (req, res, next) => {
    const usuario = (req as any).user;

    if (!usuario || usuario.tipo !== permittedTipo) {
      res.status(403).json({ error: 'Acesso negado: perfil não autorizado' });
      return;
    }

    next();
  };
}

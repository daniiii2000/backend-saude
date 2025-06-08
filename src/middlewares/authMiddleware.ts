import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'chave_padrao';

interface TokenPayload {
  id: string;
  email: string;
  tipo: string;
  iat: number;
  exp: number;
}

// Estende a tipagem do Express para incluir o campo `user`
declare module 'express-serve-static-core' {
  interface Request {
    user?: TokenPayload;
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(403).json({ error: 'Token não fornecido' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = decoded;
    console.log(`✅ [AUTH] Usuário autenticado: ${decoded.email} (ID: ${decoded.id})`);
    next();
  } catch (err) {
    console.error('❌ [AUTH] Erro ao verificar token:', err);
    res.status(403).json({ error: 'Token inválido' });
  }
}

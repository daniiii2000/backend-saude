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
    console.warn('[AUTH] Token não fornecido ou formato inválido');
    res.status(403).json({ error: 'Token não fornecido' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = decoded;

    console.log(`✅ [AUTH] Usuário autenticado:`);
    console.log(`   Email: ${decoded.email}`);
    console.log(`   ID: ${decoded.id}`);
    console.log(`   Tipo: ${decoded.tipo}`);
    console.log(`   Iat: ${new Date(decoded.iat * 1000).toISOString()}`);
    console.log(`   Exp: ${new Date(decoded.exp * 1000).toISOString()}`);

    next();
  } catch (err) {
    console.error('❌ [AUTH] Erro ao verificar token:', err);
    res.status(403).json({ error: 'Token inválido' });
  }
}

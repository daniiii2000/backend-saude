import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'chave_padrao';

interface TokenPayload {
  id: string;
  email: string;
  tipo: string;
  iat: number;
  exp: number;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: TokenPayload;
  }
}

export const authMiddleware: RequestHandler = (req, res, next) => {
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
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = decoded;

    console.log(`✅ [AUTH] Usuário autenticado: ${decoded.email} (ID: ${decoded.id})`);
    next();
  } catch (err) {
    console.error('❌ [AUTH] Erro ao verificar token:', err);
    res.status(401).json({ error: 'Token inválido' });
  }
};

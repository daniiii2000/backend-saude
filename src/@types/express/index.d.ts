// src/@types/express/index.d.ts
import { Usuario } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: Usuario;
    }
  }
}

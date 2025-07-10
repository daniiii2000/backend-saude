import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import pacienteRoutes from './routes/pacienteRoutes';
import profissionalRoutes from './routes/profissionalRoutes';
import pacienteQrRoutes from './routes/pacienteQrRoutes'; // ✅ Importado corretamente

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// ✅ Registro das rotas
app.use('/auth', authRoutes);
app.use('/pacientes', pacienteRoutes);
app.use('/profissional', profissionalRoutes);
app.use(pacienteQrRoutes); // ✅ Rota de QR ativa fora de prefixo "/paciente"

app.get('/', (req: Request, res: Response) => {
  res.send('API rodando...');
});

// Middleware de erro
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[ERRO INTERNO]', err);
  res.status(500).json({ erro: 'Erro interno no servidor' });
});

// Convierte la variable de entorno a número
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Escucha en todas las interfaces para conexiones externas
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

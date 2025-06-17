import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import pacienteRoutes from './routes/pacienteRoutes';
import profissionalRoutes from './routes/profissionalRoutes';
import pacienteQrRoutes from './routes/pacienteQrRoutes'; // ✅ Importado correctamente

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// ✅ Registro das rotas
app.use('/auth', authRoutes);
app.use('/paciente', pacienteRoutes);
app.use('/profissional', profissionalRoutes);
app.use(pacienteQrRoutes); // ✅ Rota de QR ativa fora de prefixo "/paciente"

app.get('/', (req, res) => {
  res.send('API rodando...');
});

// Middleware de erro
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[ERRO INTERNO]', err);
  res.status(500).json({ erro: 'Erro interno no servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

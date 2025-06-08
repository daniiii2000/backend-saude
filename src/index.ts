import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import pacienteRoutes from './routes/pacienteRoutes';
// ❌ Removido: import usuarioRoutes from './routes/usuarioRoutes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔽 Log de cada request para rastrear erros e fluxo
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Rotas
app.use('/pacientes', pacienteRoutes);
// ❌ Removido: app.use('/usuarios', usuarioRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('API rodando...');
});

// 🔽 Captura de erros não tratados (middleware global de erro)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[ERRO INTERNO]', err);
  res.status(500).json({ erro: 'Erro interno no servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

// index.js (atualizado)

'use strict';
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const pacienteRoutes = require('./routes/pacienteRoutes');
// const usuarioRoutes = require('./routes/usuarioRoutes');

dotenv.config();

const app = express();

// 1️⃣ CORS e JSON parser
app.use(cors());
app.use(express.json());

// 2️⃣ Log de todas as requisições
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// 3️⃣ Health-check
app.get('/health', (req, res) => {
  console.log('✔️ GET /health recebido');
  res.json({ status: 'OK' });
});

// 4️⃣ Rotas de negócio
app.use('/pacientes', pacienteRoutes);

// Adicione log na rota de login dentro de authRoutes.js:
//   router.post('/login', (req, res) => {
//     console.log('🔔 POST /auth/login recebido:', req.body);
//     // ...
//   });

app.use('/auth', authRoutes);

// página raiz
app.get('/', (req, res) => {
  res.send('API rodando...');
});

// 5️⃣ Middleware global de erro
app.use((err, req, res, next) => {
  console.error('[ERRO INTERNO]', err);
  res.status(500).json({ erro: 'Erro interno no servidor' });
});

// 6️⃣ Inicia servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

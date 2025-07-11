// src/services/api.ts
import axios, { AxiosError } from 'axios';
import https from 'https';

export const API_URL = 'https://backend-saude-1.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  timeout: 7000,  // 7 segundos
  headers: {
    'Content-Type': 'application/json',
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // apenas para debug local / emulador
  }),
});

// Interceptor para logar erros de rede
api.interceptors.response.use(
  res => res,
  (error: AxiosError) => {
    if (error.code === 'ECONNABORTED') {
      console.error('[API] Timeout de requisição', error);
    } else if (error.message === 'Network Error') {
      console.error('[API] Falha de rede', error);
    } else {
      console.error('[API] Erro na resposta', error.response?.status, error.response?.data);
    }
    return Promise.reject(error);
  }
);

export type DadosPaciente = {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  sexo: string;
  telefone: string;
  tipo: string;
  alergias?: string;
  doencas?: string;
  cirurgias?: string;
  tipoSanguineo?: string;
  profissao?: string;
};

export async function login(email: string, senha: string) {
  try {
    const response = await api.post('/auth/login', { email, senha });
    return response.data;
  } catch (err) {
    // Verifica se é erro de rede
    if (axios.isAxiosError(err) && err.message === 'Network Error') {
      throw new Error('Não foi possível conectar ao servidor. Verifique sua rede ou se o backend está no ar.');
    }
    // Repassa outros erros (400, 401, etc)
    throw err;
  }
}

export async function cadastrarPaciente(dados: DadosPaciente) {
  try {
    const response = await api.post('/auth/register', dados);
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.message === 'Network Error') {
      throw new Error('Não foi possível conectar ao servidor. Verifique sua rede ou se o backend está no ar.');
    }
    throw err;
  }
}

export default api;

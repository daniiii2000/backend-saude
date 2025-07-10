// src/services/api.ts
import axios from 'axios';

export const API_URL = 'http://192.168.0.185:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  const response = await api.post('/auth/login', { email, senha });
  return response.data;
}

export async function cadastrarPaciente(dados: DadosPaciente) {
  const response = await api.post('/auth/register', dados);
  return response.data;
}

export default api;

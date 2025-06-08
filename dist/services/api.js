"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_URL = void 0;
exports.login = login;
exports.cadastrarPaciente = cadastrarPaciente;
// src/services/api.ts
const axios_1 = __importDefault(require("axios"));
exports.API_URL = 'https://backend-saude-1.onrender.com';
const api = axios_1.default.create({
    baseURL: exports.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
async function login(email, senha) {
    const response = await api.post('/auth/login', { email, senha });
    return response.data;
}
async function cadastrarPaciente(dados) {
    const response = await api.post('/auth/register', dados);
    return response.data;
}
exports.default = api;

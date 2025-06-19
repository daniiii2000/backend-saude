"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obterPacientePorIdQr = void 0;
const client_1 = require("@prisma/client"); // ✅ Correção aqui
const prisma = new client_1.PrismaClient(); // ✅ Instanciando o PrismaClient corretamente
const obterPacientePorIdQr = async (req, res) => {
    try {
        const paciente = await prisma.paciente.findUnique({
            where: { id: req.params.id },
            select: {
                nome: true,
                tipoSanguineo: true,
                doencas: true,
                alergias: true,
                cirurgias: true
            }
        });
        if (!paciente) {
            return res.status(404).json({ erro: 'Paciente não encontrado' });
        }
        res.json(paciente);
    }
    catch (error) {
        console.error('Erro ao buscar paciente pelo QR:', error);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};
exports.obterPacientePorIdQr = obterPacientePorIdQr;

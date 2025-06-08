"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const pacientes = await prisma.paciente.findMany();
    console.log('📋 Pacientes encontrados:', pacientes);
    const profissionais = await prisma.profissional.findMany();
    console.log('📋 Profissionais encontrados:', profissionais);
}
main()
    .catch((e) => {
    console.error('❌ Erro ao conectar ou consultar:', e);
})
    .finally(() => prisma.$disconnect());

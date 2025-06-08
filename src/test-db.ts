import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

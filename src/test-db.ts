import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const profissionais = await prisma.profissional.findMany();
  console.log('Profissionais encontrados:', profissionais);
}

main()
  .catch((e) => {
    console.error('Erro ao conectar:', e);
  })
  .finally(() => prisma.$disconnect());

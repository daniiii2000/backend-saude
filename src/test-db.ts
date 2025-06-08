import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const usuarios = await prisma.usuario.findMany();
  console.log('Usuários encontrados:', usuarios);
}

main()
  .catch((e) => {
    console.error('Erro ao conectar:', e);
  })
  .finally(() => prisma.$disconnect());

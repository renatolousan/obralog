import { PrismaClient } from '@prisma/client';

// Mock do Prisma Client para testes
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/obralog_test',
    },
  },
});

// Limpar dados de teste antes de cada suite
export async function setupTestDatabase() {
  // Aqui você pode adicionar lógica para preparar o banco de teste
}

// Limpar banco após os testes
export async function teardownTestDatabase() {
  await prisma.$disconnect();
}

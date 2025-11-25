import { Prisma } from '@prisma/client';
import { InstallerDto } from '../../types/types';
import prisma from '../prisma/client';

export async function getAllInstallers() {
  const installers = await prisma.installer.findMany({
    omit: {
      visitId: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return installers;
}

export async function createNewInstaller(installer: InstallerDto) {
  if (await installerAlreadyExists(installer)) {
    throw new Error('Instalador com mesmo CPF ou telefone já registrado.');
  } else {
    return await prisma.installer.create({ data: installer });
  }
}

export async function installerAlreadyExists(
  installer: InstallerDto,
): Promise<boolean> {
  return !!(await prisma.installer.findFirst({
    where: { OR: [{ cpf: installer.cpf }, { phone: installer.phone }] },
  }));
}

export async function upsertInstallers(
  tx: Prisma.TransactionClient,
  installers: InstallerDto[],
) {
  Promise.all(
    installers.map(async (inst) => {
      await tx.installer.upsert({
        where: { cpf: inst.cpf },
        update: {},
        create: inst,
      });
    }),
  );
}

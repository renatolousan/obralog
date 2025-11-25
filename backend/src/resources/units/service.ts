import prisma from '../prisma/client';
import { Prisma, Unit } from '@prisma/client';
import {
  FeedbackWithAttachments,
  orderKeyType,
  UnitDto,
} from '../../types/types';
import { createItems, createNewItem } from '../items/service';

export async function unitExists(id: string): Promise<boolean> {
  return !!(await prisma.unit.findFirst({
    where: {
      id: id,
    },
  }));
}

export async function getUnitById(id: string): Promise<Unit | null> {
  return await prisma.unit.findFirst({
    where: { id },
  });
}

export async function getUnitsByBuilding(buildingId: string) {
  const units = await prisma.unit.findMany({
    where: { id_building: buildingId },
    select: {
      id: true,
      name: true,
      number: true,
      floor: true,
    },
    orderBy: {
      number: 'asc',
    },
  });

  return units.map((unit) => ({
    id: unit.id,
    nome: unit.name,
    numero: unit.number,
    andar: unit.floor,
  }));
}

export async function getUnitContext(unitId: string) {
  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: {
      items: {
        select: {
          id: true,
          name: true,
          description: true,
        },
        orderBy: {
          name: 'asc',
        },
      },
      users: {
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: {
          name: 'asc',
        },
      },
    },
  });

  if (!unit) {
    return null;
  }

  return {
    unidade: {
      id: unit.id,
      nome: unit.name,
      numero: unit.number,
      andar: unit.floor,
    },
    itens: unit.items.map((item) => ({
      id: item.id,
      nome: item.name,
      descricao: item.description,
    })),
    usuarios: unit.users.map((user) => ({
      id: user.id,
      nome: user.name,
      email: user.email,
    })),
  };
}

export async function getComplaintsPerUnit(
  unitId: string,
  order: orderKeyType,
): Promise<FeedbackWithAttachments[]> {
  const complaints = await prisma.feedback.findMany({
    where: {
      user: {
        unit: {
          id: unitId,
        },
      },
    },
    include: {
      attachments: true,
    },
    orderBy: {
      created_at: order,
    },
  });
  return complaints;
}

export async function unitAlreadyExists(unit: UnitDto): Promise<boolean> {
  return !!(await prisma.unit.findFirst({
    where: {
      AND: [{ floor: unit.floor }, { number: unit.number }],
    },
  }));
}

export async function createNewUnit(buildingId: string, unit: UnitDto) {
  const exists = await unitAlreadyExists(unit);
  if (exists) {
    throw new Error('Unidade de mesmo número e andar já existe na torre.');
  }
  const createdUnit = await prisma.unit.create({
    data: {
      ...unit,
      torre: {
        connect: { id: buildingId },
      },
    },
  });
  return createdUnit;
}

export async function createUnits(
  tx: Prisma.TransactionClient,
  idBuilding: string,
  units: UnitDto[],
) {
  await Promise.all(
    units.map(async (u) => {
      const createdUnit = await tx.unit.create({
        data: {
          name: u.name,
          number: u.number,
          floor: u.floor,
          id_building: idBuilding,
        },
      });
    }),
  );
}

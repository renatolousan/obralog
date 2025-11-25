import { Building, Prisma } from '@prisma/client';
import { BuildingDto } from '../../types/types';
import prisma from '../prisma/client';
import { createNewUnit, createUnits } from '../units/service';

export async function getBuildingsByDevelopment(developmentId: string) {
  const buildings = await prisma.building.findMany({
    where: { id_development: developmentId },
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
      name: true,
    },
  });

  return buildings.map((b) => ({ id: b.id, nome: b.name })); // name -> nome
}

export async function buildingAlreadyExists(
  developmentId: string,
  building: BuildingDto,
): Promise<boolean> {
  return !!(await prisma.building.findFirst({
    where: {
      AND: [{ name: building.name }, { id_development: developmentId }],
    },
  }));
}

export async function createBuildings(
  tx: Prisma.TransactionClient,
  idDev: string,
  buildings: BuildingDto[],
) {
  await Promise.all(
    buildings.map(async (b) => {
      const createdBuilding = await tx.building.create({
        data: { name: b.name, id_development: idDev },
      });
      await createUnits(tx, createdBuilding.id, b.units);
    }),
  );
}

export async function createNewBuilding(
  id_development: string,
  building: BuildingDto,
) {
  const exists = await buildingAlreadyExists(id_development, building);
  if (exists) {
    throw new Error('Torre já existe nesta obra.');
  }

  const createdBuilding = await prisma.building.create({
    data: {
      name: building.name,
      id_development,
    },
  });

  await Promise.all(
    building.units.map((unit) => createNewUnit(createdBuilding.id, unit)),
  );

  return createdBuilding;
}

export async function getBuildingById(id: string): Promise<Building | null> {
  return await prisma.building.findFirst({
    where: { id },
    include: { units: true },
  });
}

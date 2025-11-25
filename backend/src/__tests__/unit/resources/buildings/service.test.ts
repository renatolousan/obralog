import {
  buildingAlreadyExists,
  getBuildingsByDevelopment,
  createNewBuilding,
  getBuildingById,
  createBuildings,
} from '../../../../resources/buildings/service';
import prisma from '../../../../resources/prisma/client';
import { BuildingDto } from '../../../../types/types';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import {
  createNewUnit,
  createUnits,
} from '../../../../resources/units/service';
import { Prisma } from '@prisma/client';

jest.mock('../../../../resources/prisma/client', () => ({
  __esModule: true,
  default: {
    building: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('../../../../resources/units/service', () => ({
  createNewUnit: jest.fn(),
  createUnits: jest.fn(),
}));

describe('Buildings Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBuildingsByDevelopment', () => {
    it('deve retornar lista de prédios formatada corretamente', async () => {
      const mockBuildings = [
        { id: '1', name: 'Torre A' },
        { id: '2', name: 'Torre B' },
      ];

      jest
        .spyOn(prisma.building, 'findMany')
        .mockResolvedValue(mockBuildings as any);

      const result = await getBuildingsByDevelopment('dev-id');

      expect(result).toEqual([
        { id: '1', nome: 'Torre A' },
        { id: '2', nome: 'Torre B' },
      ]);
      expect(prisma.building.findMany).toHaveBeenCalledWith({
        where: { id_development: 'dev-id' },
        orderBy: { id: 'asc' },
        select: { id: true, name: true },
      });
    });

    it('deve retornar array vazio quando não há prédios', async () => {
      jest.spyOn(prisma.building, 'findMany').mockResolvedValue([] as any);

      const result = await getBuildingsByDevelopment('dev-id');

      expect(result).toEqual([]);
    });
  });

  describe('buildingAlreadyExists', () => {
    it('deve retornar true quando prédio já existe', async () => {
      const buildingDto: BuildingDto = {
        name: 'Torre A',
        units: [],
      };

      jest.spyOn(prisma.building, 'findFirst').mockResolvedValue({
        id: '1',
        name: 'Torre A',
      } as any);

      const result = await buildingAlreadyExists('dev-id', buildingDto);

      expect(result).toBe(true);
      expect(prisma.building.findFirst).toHaveBeenCalledWith({
        where: {
          AND: [{ name: 'Torre A' }, { id_development: 'dev-id' }],
        },
      });
    });

    it('deve retornar false quando prédio não existe', async () => {
      const buildingDto: BuildingDto = {
        name: 'Torre C',
        units: [],
      };

      jest.spyOn(prisma.building, 'findFirst').mockResolvedValue(null as any);

      const result = await buildingAlreadyExists('dev-id', buildingDto);

      expect(result).toBe(false);
    });
  });

  describe('createNewBuilding', () => {
    const mockBuildingDto: BuildingDto = {
      name: 'Torre Nova',
      units: [
        {
          name: 'Unidade 101',
          floor: 1,
          number: 101,
        },
        {
          name: 'Unidade 102',
          floor: 1,
          number: 102,
        },
      ],
    };

    it('deve lançar erro quando prédio já existe', async () => {
      jest.spyOn(prisma.building, 'findFirst').mockResolvedValue({
        id: '1',
        name: 'Torre Nova',
      } as any);

      await expect(
        createNewBuilding('dev-id', mockBuildingDto),
      ).rejects.toThrow('Torre já existe nesta obra.');
    });

    it('deve criar prédio com sucesso', async () => {
      const mockCreatedBuilding = {
        id: 'building-1',
        name: 'Torre Nova',
        id_development: 'dev-id',
      };

      jest.spyOn(prisma.building, 'findFirst').mockResolvedValue(null as any);
      jest
        .spyOn(prisma.building, 'create')
        .mockResolvedValue(mockCreatedBuilding as any);
      jest.mocked(createNewUnit).mockResolvedValue(undefined);

      const result = await createNewBuilding('dev-id', mockBuildingDto);

      expect(result).toEqual(mockCreatedBuilding);
      expect(prisma.building.create).toHaveBeenCalledWith({
        data: {
          name: 'Torre Nova',
          id_development: 'dev-id',
        },
      });
      expect(createNewUnit).toHaveBeenCalledTimes(2);
      expect(createNewUnit).toHaveBeenCalledWith('building-1', {
        name: 'Unidade 101',
        floor: 1,
        number: 101,
      });
      expect(createNewUnit).toHaveBeenCalledWith('building-1', {
        name: 'Unidade 102',
        floor: 1,
        number: 102,
      });
    });

    it('deve criar prédio sem unidades', async () => {
      const mockCreatedBuilding = {
        id: 'building-1',
        name: 'Torre Nova',
        id_development: 'dev-id',
      };

      const buildingWithoutUnits: BuildingDto = {
        name: 'Torre Nova',
        units: [],
      };

      jest.spyOn(prisma.building, 'findFirst').mockResolvedValue(null as any);
      jest
        .spyOn(prisma.building, 'create')
        .mockResolvedValue(mockCreatedBuilding as any);

      const result = await createNewBuilding('dev-id', buildingWithoutUnits);

      expect(result).toEqual(mockCreatedBuilding);
      expect(createNewUnit).not.toHaveBeenCalled();
    });
  });

  describe('getBuildingById', () => {
    it('deve retornar prédio com unidades quando encontrado', async () => {
      const mockBuilding = {
        id: 'building-1',
        name: 'Torre A',
        id_development: 'dev-id',
        units: [
          {
            id: 'unit-1',
            name: 'Unidade 101',
            floor: 1,
            number: 101,
          },
          {
            id: 'unit-2',
            name: 'Unidade 102',
            floor: 1,
            number: 102,
          },
        ],
      };

      jest
        .spyOn(prisma.building, 'findFirst')
        .mockResolvedValue(mockBuilding as any);

      const result = await getBuildingById('building-1');

      expect(result).toEqual(mockBuilding);
      expect(prisma.building.findFirst).toHaveBeenCalledWith({
        where: { id: 'building-1' },
        include: { units: true },
      });
    });

    it('deve retornar prédio sem unidades', async () => {
      const mockBuilding = {
        id: 'building-1',
        name: 'Torre A',
        id_development: 'dev-id',
        units: [],
      };

      jest
        .spyOn(prisma.building, 'findFirst')
        .mockResolvedValue(mockBuilding as any);

      const result = await getBuildingById('building-1');

      expect(result).toEqual(mockBuilding);
      expect(result?.units).toEqual([]);
    });

    it('deve retornar null quando prédio não encontrado', async () => {
      jest.spyOn(prisma.building, 'findFirst').mockResolvedValue(null);

      const result = await getBuildingById('building-inexistente');

      expect(result).toBeNull();
    });
  });

  describe('createBuildings', () => {
    it('deve criar múltiplos prédios em transação', async () => {
      const mockTx = {
        building: {
          create: jest
            .fn()
            .mockResolvedValue({ id: 'building-1', name: 'Torre A' }),
        },
      } as unknown as Prisma.TransactionClient;

      const buildings: BuildingDto[] = [
        {
          name: 'Torre A',
          units: [
            {
              name: 'Unidade 101',
              floor: 1,
              number: 101,
            },
          ],
        },
        {
          name: 'Torre B',
          units: [
            {
              name: 'Unidade 201',
              floor: 2,
              number: 201,
            },
          ],
        },
      ];

      jest.mocked(createUnits).mockResolvedValue(undefined);

      await createBuildings(mockTx, 'dev-id', buildings);

      expect(mockTx.building.create).toHaveBeenCalledTimes(2);
      expect(mockTx.building.create).toHaveBeenCalledWith({
        data: {
          name: 'Torre A',
          id_development: 'dev-id',
        },
      });
      expect(mockTx.building.create).toHaveBeenCalledWith({
        data: {
          name: 'Torre B',
          id_development: 'dev-id',
        },
      });
      expect(createUnits).toHaveBeenCalledTimes(2);
    });

    it('deve criar prédios sem unidades', async () => {
      const mockTx = {
        building: {
          create: jest
            .fn()
            .mockResolvedValue({ id: 'building-1', name: 'Torre A' }),
        },
      } as unknown as Prisma.TransactionClient;

      const buildings: BuildingDto[] = [
        {
          name: 'Torre A',
          units: [],
        },
      ];

      await createBuildings(mockTx, 'dev-id', buildings);

      expect(mockTx.building.create).toHaveBeenCalledTimes(1);
      expect(createUnits).toHaveBeenCalledWith(mockTx, 'building-1', []);
    });

    it('deve processar prédios em paralelo', async () => {
      const mockTx = {
        building: {
          create: jest
            .fn()
            .mockResolvedValueOnce({ id: 'building-1', name: 'Torre A' })
            .mockResolvedValueOnce({ id: 'building-2', name: 'Torre B' })
            .mockResolvedValueOnce({ id: 'building-3', name: 'Torre C' }),
        },
      } as unknown as Prisma.TransactionClient;

      const buildings: BuildingDto[] = [
        { name: 'Torre A', units: [] },
        { name: 'Torre B', units: [] },
        { name: 'Torre C', units: [] },
      ];

      jest.mocked(createUnits).mockResolvedValue(undefined);

      await createBuildings(mockTx, 'dev-id', buildings);

      expect(mockTx.building.create).toHaveBeenCalledTimes(3);
      expect(createUnits).toHaveBeenCalledTimes(3);
    });

    it('deve lidar com array vazio de prédios', async () => {
      const mockTx = {
        building: {
          create: jest.fn(),
        },
      } as unknown as Prisma.TransactionClient;

      await createBuildings(mockTx, 'dev-id', []);

      expect(mockTx.building.create).not.toHaveBeenCalled();
      expect(createUnits).not.toHaveBeenCalled();
    });
  });
});

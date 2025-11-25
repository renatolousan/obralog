import {
  getAllInstallers,
  installerAlreadyExists,
  createNewInstaller,
  upsertInstallers,
} from '../../../../resources/installers/service';
import prisma from '../../../../resources/prisma/client';
import { InstallerDto } from '../../../../types/types';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { Prisma } from '@prisma/client';

jest.mock('../../../../resources/prisma/client', () => ({
  __esModule: true,
  default: {
    installer: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

describe('Installers Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllInstallers', () => {
    it('deve retornar lista de instaladores ordenada por nome', async () => {
      const mockInstallers = [
        {
          id: '1',
          cpf: '12345678901',
          name: 'Instalador A',
          phone: '1234567890',
          visitId: null,
        },
        {
          id: '2',
          cpf: '98765432109',
          name: 'Instalador B',
          phone: '0987654321',
          visitId: null,
        },
      ];

      jest
        .spyOn(prisma.installer, 'findMany')
        .mockResolvedValue(mockInstallers as any);

      const result = await getAllInstallers();

      expect(result).toEqual(mockInstallers);
      expect(prisma.installer.findMany).toHaveBeenCalledWith({
        omit: {
          visitId: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    });

    it('deve retornar array vazio quando não há instaladores', async () => {
      jest.spyOn(prisma.installer, 'findMany').mockResolvedValue([] as any);

      const result = await getAllInstallers();

      expect(result).toEqual([]);
    });
  });

  describe('installerAlreadyExists', () => {
    it('deve retornar true quando instalador já existe por CPF', async () => {
      const installer: InstallerDto = {
        cpf: '12345678901',
        name: 'Instalador A',
        phone: '1234567890',
      };

      jest.spyOn(prisma.installer, 'findFirst').mockResolvedValue({
        id: '1',
        cpf: '12345678901',
        name: 'fulano',
        phone: '1234567890',
        visitId: null,
      } as any);

      const result = await installerAlreadyExists(installer);

      expect(result).toBe(true);
      expect(prisma.installer.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ cpf: '12345678901' }, { phone: '1234567890' }],
        },
      });
    });

    it('deve retornar true quando instalador já existe por telefone', async () => {
      const installer: InstallerDto = {
        cpf: '99999999999',
        name: 'Instalador B',
        phone: '1234567890',
      };

      jest.spyOn(prisma.installer, 'findFirst').mockResolvedValue({
        id: '1',
        cpf: '12345678901',
        name: 'fulano',
        phone: '1234567890',
        visitId: null,
      } as any);

      const result = await installerAlreadyExists(installer);

      expect(result).toBe(true);
    });

    it('deve retornar false quando instalador não existe', async () => {
      const installer: InstallerDto = {
        cpf: '12345678901',
        name: 'Instalador C',
        phone: '1234567890',
      };

      jest.spyOn(prisma.installer, 'findFirst').mockResolvedValue(null as any);

      const result = await installerAlreadyExists(installer);

      expect(result).toBe(false);
    });
  });

  describe('createNewInstaller', () => {
    const mockInstallerDto: InstallerDto = {
      cpf: '12345678901',
      name: 'Instalador Novo',
      phone: '9876543210',
    };

    it('deve criar instalador com sucesso', async () => {
      const mockCreatedInstaller = {
        id: 'installer-1',
        cpf: '12345678901',
        name: 'Instalador Novo',
        phone: '9876543210',
      };

      jest.spyOn(prisma.installer, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(prisma.installer, 'create')
        .mockResolvedValue(mockCreatedInstaller as any);

      const result = await createNewInstaller(mockInstallerDto);

      expect(result).toEqual(mockCreatedInstaller);
      expect(prisma.installer.create).toHaveBeenCalledWith({
        data: mockInstallerDto,
      });
    });

    it('deve lançar erro quando instalador já existe por CPF', async () => {
      jest.spyOn(prisma.installer, 'findFirst').mockResolvedValue({
        id: '1',
        cpf: '12345678901',
        name: 'Instalador Existente',
        phone: '1111111111',
        visitId: null,
      } as any);

      await expect(createNewInstaller(mockInstallerDto)).rejects.toThrow(
        'Instalador com mesmo CPF ou telefone já registrado.',
      );

      expect(prisma.installer.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando instalador já existe por telefone', async () => {
      jest.spyOn(prisma.installer, 'findFirst').mockResolvedValue({
        id: '1',
        cpf: '99999999999',
        name: 'Instalador Existente',
        phone: '9876543210',
        visitId: null,
      } as any);

      await expect(createNewInstaller(mockInstallerDto)).rejects.toThrow(
        'Instalador com mesmo CPF ou telefone já registrado.',
      );

      expect(prisma.installer.create).not.toHaveBeenCalled();
    });
  });

  describe('upsertInstallers', () => {
    it('deve criar instaladores quando não existem', async () => {
      const mockTx = {
        installer: {
          upsert: jest.fn().mockResolvedValue({
            id: 'installer-1',
            cpf: '12345678901',
            name: 'Instalador Novo',
            phone: '9876543210',
          }),
        },
      } as unknown as Prisma.TransactionClient;

      const installers: InstallerDto[] = [
        {
          cpf: '12345678901',
          name: 'Instalador A',
          phone: '1234567890',
        },
        {
          cpf: '98765432109',
          name: 'Instalador B',
          phone: '0987654321',
        },
      ];

      await upsertInstallers(mockTx, installers);

      expect(mockTx.installer.upsert).toHaveBeenCalledTimes(2);
      expect(mockTx.installer.upsert).toHaveBeenCalledWith({
        where: { cpf: '12345678901' },
        update: {},
        create: {
          cpf: '12345678901',
          name: 'Instalador A',
          phone: '1234567890',
        },
      });
      expect(mockTx.installer.upsert).toHaveBeenCalledWith({
        where: { cpf: '98765432109' },
        update: {},
        create: {
          cpf: '98765432109',
          name: 'Instalador B',
          phone: '0987654321',
        },
      });
    });

    it('deve atualizar instaladores quando já existem', async () => {
      const mockTx = {
        installer: {
          upsert: jest.fn().mockResolvedValue({
            id: 'installer-1',
            cpf: '12345678901',
            name: 'Instalador Atualizado',
            phone: '1234567890',
          }),
        },
      } as unknown as Prisma.TransactionClient;

      const installers: InstallerDto[] = [
        {
          cpf: '12345678901',
          name: 'Instalador Atualizado',
          phone: '1234567890',
        },
      ];

      await upsertInstallers(mockTx, installers);

      expect(mockTx.installer.upsert).toHaveBeenCalledTimes(1);
    });

    it('deve processar múltiplos instaladores em paralelo', async () => {
      const mockTx = {
        installer: {
          upsert: jest
            .fn()
            .mockResolvedValueOnce({ id: 'installer-1' })
            .mockResolvedValueOnce({ id: 'installer-2' })
            .mockResolvedValueOnce({ id: 'installer-3' }),
        },
      } as unknown as Prisma.TransactionClient;

      const installers: InstallerDto[] = [
        { cpf: '11111111111', name: 'Instalador 1', phone: '1111111111' },
        { cpf: '22222222222', name: 'Instalador 2', phone: '2222222222' },
        { cpf: '33333333333', name: 'Instalador 3', phone: '3333333333' },
      ];

      await upsertInstallers(mockTx, installers);

      expect(mockTx.installer.upsert).toHaveBeenCalledTimes(3);
    });

    it('deve lidar com array vazio', async () => {
      const mockTx = {
        installer: {
          upsert: jest.fn(),
        },
      } as unknown as Prisma.TransactionClient;

      await upsertInstallers(mockTx, []);

      expect(mockTx.installer.upsert).not.toHaveBeenCalled();
    });
  });
});

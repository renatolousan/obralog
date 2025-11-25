import {
  getAllSuppliers,
  supplierAlreadyExists,
  findSupplierByCNPJ,
  getSuppliedItems,
  upsertSupplier,
  createNewSupplier,
  bulkSupplierRegistration,
} from '../../../../resources/suppliers/service';
import prisma from '../../../../resources/prisma/client';
import { Supplier } from '@prisma/client';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { Prisma } from '@prisma/client';

jest.mock('../../../../resources/prisma/client', () => ({
  __esModule: true,
  default: {
    supplier: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

describe('Suppliers Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllSuppliers', () => {
    it('deve retornar lista de fornecedores ordenada por nome', async () => {
      const mockSuppliers = [
        { cnpj: '12345678901234', name: 'Fornecedor A' },
        { cnpj: '98765432109876', name: 'Fornecedor B' },
      ];

      jest.spyOn(prisma.supplier, 'findMany').mockResolvedValue(mockSuppliers);

      const result = await getAllSuppliers();

      expect(result).toEqual(mockSuppliers);
      expect(prisma.supplier.findMany).toHaveBeenCalledWith({
        select: {
          cnpj: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    });

    it('deve retornar array vazio quando não há fornecedores', async () => {
      jest.spyOn(prisma.supplier, 'findMany').mockResolvedValue([] as any);

      const result = await getAllSuppliers();

      expect(result).toEqual([]);
    });
  });

  describe('supplierAlreadyExists', () => {
    it('deve retornar true quando fornecedor já existe', async () => {
      const supplier: Supplier = {
        cnpj: '12345678901234',
        name: 'Fornecedor A',
      };

      jest
        .spyOn(prisma.supplier, 'findFirst')
        .mockResolvedValue(supplier as any);

      const result = await supplierAlreadyExists(supplier);

      expect(result).toBe(true);
      expect(prisma.supplier.findFirst).toHaveBeenCalledWith({
        where: {
          AND: [{ cnpj: '12345678901234' }, { name: 'Fornecedor A' }],
        },
      });
    });

    it('deve retornar false quando fornecedor não existe', async () => {
      const supplier: Supplier = {
        cnpj: '12345678901234',
        name: 'Fornecedor C',
      };

      jest.spyOn(prisma.supplier, 'findFirst').mockResolvedValue(null as any);

      const result = await supplierAlreadyExists(supplier);

      expect(result).toBe(false);
    });
  });

  describe('findSupplierByCNPJ', () => {
    it('deve retornar fornecedor quando encontrado sem itens', async () => {
      const supplier: Supplier = {
        cnpj: '12345678901234',
        name: 'Fornecedor A',
      };

      jest
        .spyOn(prisma.supplier, 'findFirst')
        .mockResolvedValue(supplier as any);

      const result = await findSupplierByCNPJ('12345678901234');

      expect(result).toEqual(supplier);
      expect(prisma.supplier.findFirst).toHaveBeenCalledWith({
        where: { cnpj: '12345678901234' },
        include: { supplied_items: false },
      });
    });

    it('deve retornar fornecedor com itens quando include é true', async () => {
      const supplier: Supplier = {
        cnpj: '12345678901234',
        name: 'Fornecedor A',
      };

      jest
        .spyOn(prisma.supplier, 'findFirst')
        .mockResolvedValue(supplier as any);

      const result = await findSupplierByCNPJ('12345678901234', true);

      expect(result).toEqual(supplier);
      expect(prisma.supplier.findFirst).toHaveBeenCalledWith({
        where: { cnpj: '12345678901234' },
        include: { supplied_items: true },
      });
    });

    it('deve retornar null quando fornecedor não é encontrado', async () => {
      jest.spyOn(prisma.supplier, 'findFirst').mockResolvedValue(null as any);

      const result = await findSupplierByCNPJ('99999999999999');

      expect(result).toBeNull();
    });
  });

  describe('getSuppliedItems', () => {
    it('deve retornar fornecedor com itens fornecidos', async () => {
      const mockSupplier = [
        {
          cnpj: '12345678901234',
          name: 'Fornecedor A',
          supplied_items: [
            {
              id: 'item-1',
              name: 'Item 1',
            },
            {
              id: 'item-2',
              name: 'Item 2',
            },
          ],
        },
      ];

      jest
        .spyOn(prisma.supplier, 'findMany')
        .mockResolvedValue(mockSupplier as any);

      const result = await getSuppliedItems('12345678901234');

      expect(result).toEqual(mockSupplier);
      expect(prisma.supplier.findMany).toHaveBeenCalledWith({
        where: {
          cnpj: '12345678901234',
        },
        include: {
          supplied_items: true,
        },
      });
    });

    it('deve retornar fornecedor sem itens', async () => {
      const mockSupplier = [
        {
          cnpj: '12345678901234',
          name: 'Fornecedor A',
          supplied_items: [],
        },
      ];

      jest
        .spyOn(prisma.supplier, 'findMany')
        .mockResolvedValue(mockSupplier as any);

      const result = await getSuppliedItems('12345678901234');

      expect(result[0].supplied_items).toEqual([]);
    });
  });

  describe('createNewSupplier', () => {
    it('deve criar fornecedor com sucesso', async () => {
      const supplier: Supplier = {
        cnpj: '12345678901234',
        name: 'Fornecedor Novo',
      };

      const mockCreatedSupplier = {
        cnpj: '12345678901234',
        name: 'Fornecedor Novo',
      };

      jest.spyOn(prisma.supplier, 'findFirst').mockResolvedValue(null as any);
      jest
        .spyOn(prisma.supplier, 'create')
        .mockResolvedValue(mockCreatedSupplier as any);

      const result = await createNewSupplier(supplier);

      expect(result).toEqual(mockCreatedSupplier);
      expect(prisma.supplier.create).toHaveBeenCalledWith({
        data: supplier,
      });
    });

    it('deve lançar erro quando fornecedor já existe', async () => {
      const supplier: Supplier = {
        cnpj: '12345678901234',
        name: 'Fornecedor Existente',
      };

      jest
        .spyOn(prisma.supplier, 'findFirst')
        .mockResolvedValue(supplier as any);

      await expect(createNewSupplier(supplier)).rejects.toThrow(
        'Fornecedor já cadastrado',
      );

      expect(prisma.supplier.create).not.toHaveBeenCalled();
    });
  });

  describe('upsertSupplier', () => {
    it('deve criar fornecedor quando não existe', async () => {
      const mockTx = {
        supplier: {
          upsert: jest.fn().mockResolvedValue({
            cnpj: '12345678901234',
            name: 'Fornecedor Novo',
          }),
        },
      } as unknown as Prisma.TransactionClient;

      const supplier: Supplier = {
        cnpj: '12345678901234',
        name: 'Fornecedor Novo',
      };

      await upsertSupplier(mockTx, supplier);

      expect(mockTx.supplier.upsert).toHaveBeenCalledWith({
        where: { cnpj: '12345678901234' },
        update: {},
        create: {
          cnpj: '12345678901234',
          name: 'Fornecedor Novo',
        },
      });
    });

    it('deve atualizar fornecedor quando já existe', async () => {
      const mockTx = {
        supplier: {
          upsert: jest.fn().mockResolvedValue({
            cnpj: '12345678901234',
            name: 'Fornecedor Atualizado',
          }),
        },
      } as unknown as Prisma.TransactionClient;

      const supplier: Supplier = {
        cnpj: '12345678901234',
        name: 'Fornecedor Atualizado',
      };

      await upsertSupplier(mockTx, supplier);

      expect(mockTx.supplier.upsert).toHaveBeenCalled();
    });
  });

  describe('bulkSupplierRegistration', () => {
    it('deve registrar múltiplos fornecedores com sucesso', async () => {
      const suppliers: Supplier[] = [
        { cnpj: '12345678901234', name: 'Fornecedor A' },
        { cnpj: '98765432109876', name: 'Fornecedor B' },
      ];

      jest.spyOn(prisma.supplier, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.supplier, 'create').mockResolvedValue({} as any);

      const result = await bulkSupplierRegistration(suppliers);

      expect(result.successCount).toBe(2);
      expect(result.errors).toEqual([]);
      expect(prisma.supplier.create).toHaveBeenCalledTimes(2);
    });

    it('deve registrar fornecedores e reportar erros', async () => {
      const suppliers: Supplier[] = [
        { cnpj: '12345678901234', name: 'Fornecedor A' },
        { cnpj: '98765432109876', name: 'Fornecedor Existente' },
        { cnpj: '11111111111111', name: 'Fornecedor C' },
      ];

      jest
        .spyOn(prisma.supplier, 'findFirst')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ cnpj: '98765432109876' } as any)
        .mockResolvedValueOnce(null);
      jest.spyOn(prisma.supplier, 'create').mockResolvedValue({} as any);

      const result = await bulkSupplierRegistration(suppliers);

      expect(result.successCount).toBe(2);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].row).toBe(2);
      expect(result.errors[0].error).toBe('Fornecedor já cadastrado');
    });

    it('deve retornar erro quando criação falha', async () => {
      const suppliers: Supplier[] = [
        { cnpj: '12345678901234', name: 'Fornecedor A' },
      ];

      jest.spyOn(prisma.supplier, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(prisma.supplier, 'create')
        .mockRejectedValue(new Error('Erro no banco de dados'));

      const result = await bulkSupplierRegistration(suppliers);

      expect(result.successCount).toBe(0);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].error).toBe('Erro no banco de dados');
    });

    it('deve lidar com array vazio', async () => {
      const result = await bulkSupplierRegistration([]);

      expect(result.successCount).toBe(0);
      expect(result.errors).toEqual([]);
      expect(prisma.supplier.create).not.toHaveBeenCalled();
    });

    it('deve reportar erro quando create retorna null', async () => {
      const suppliers: Supplier[] = [
        { cnpj: '12345678901234', name: 'Fornecedor A' },
      ];

      jest.spyOn(prisma.supplier, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.supplier, 'create').mockResolvedValue(null as any);

      const result = await bulkSupplierRegistration(suppliers);

      expect(result.successCount).toBe(0);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].error).toBe('Erro ao cadastrar fornecedor.');
    });
  });
});

import {
  getAllDevelopments,
  developmentAlreadyExists,
  getDevelopmentByUser,
  createNewDevelopment,
  getDevelopmentsComplaintsReport,
  getDevelopmentSummaryData,
  updateRiskThreshold,
  calculateDevelopmentHealth,
} from '../../../../resources/developments/service';
import prisma from '../../../../resources/prisma/client';
import { DevelopmentDto } from '../../../../types/types';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { createBuildings } from '../../../../resources/buildings/service';
import { Decimal } from '@prisma/client/runtime/library';

jest.mock('../../../../resources/prisma/client', () => ({
  __esModule: true,
  default: {
    development: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('../../../../resources/buildings/service', () => ({
  createBuildings: jest.fn(),
}));

describe('Developments Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllDevelopments', () => {
    it('deve retornar lista de empreendimentos formatada corretamente', async () => {
      const mockDevelopments = [
        {
          id: '1',
          name: 'Empreendimento A',
          description: 'Descrição A',
          address: 'Endereço A',
        },
        {
          id: '2',
          name: 'Empreendimento B',
          description: 'Descrição B',
          address: 'Endereço B',
        },
      ];

      jest
        .spyOn(prisma.development, 'findMany')
        .mockResolvedValue(mockDevelopments as any);

      const result = await getAllDevelopments();

      expect(result).toEqual([
        {
          id: '1',
          nome: 'Empreendimento A',
          descricao: 'Descrição A',
          endereco: 'Endereço A',
        },
        {
          id: '2',
          nome: 'Empreendimento B',
          descricao: 'Descrição B',
          endereco: 'Endereço B',
        },
      ]);

      expect(prisma.development.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
          address: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    });

    it('deve retornar array vazio quando não há empreendimentos', async () => {
      jest.spyOn(prisma.development, 'findMany').mockResolvedValue([] as any);

      const result = await getAllDevelopments();

      expect(result).toEqual([]);
    });
  });

  describe('developmentAlreadyExists', () => {
    it('deve retornar true quando empreendimento já existe por nome', async () => {
      const development: DevelopmentDto = {
        name: 'Empreendimento A',
        description: 'Descrição',
        address: 'Endereço A',
        buildings: [],
      };

      jest.spyOn(prisma.development, 'findFirst').mockResolvedValue({
        id: '1',
        name: 'Empreendimento A',
      } as any);

      const result = await developmentAlreadyExists(development);

      expect(result).toBe(true);
      expect(prisma.development.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ name: 'Empreendimento A' }, { address: 'Endereço A' }],
        },
      });
    });

    it('deve retornar true quando empreendimento já existe por endereço', async () => {
      const development: DevelopmentDto = {
        name: 'Empreendimento B',
        description: 'Descrição',
        address: 'Endereço A',
        buildings: [],
      };

      jest.spyOn(prisma.development, 'findFirst').mockResolvedValue({
        id: '1',
        address: 'Endereço A',
      } as any);

      const result = await developmentAlreadyExists(development);

      expect(result).toBe(true);
    });

    it('deve retornar false quando empreendimento não existe', async () => {
      const development: DevelopmentDto = {
        name: 'Empreendimento C',
        description: 'Descrição',
        address: 'Endereço C',
        buildings: [],
      };

      jest
        .spyOn(prisma.development, 'findFirst')
        .mockResolvedValue(null as any);

      const result = await developmentAlreadyExists(development);

      expect(result).toBe(false);
    });
  });

  describe('getDevelopmentByUser', () => {
    it('deve retornar empreendimentos de um usuário formatados corretamente', async () => {
      const mockDevelopments = [
        {
          id: '1',
          name: 'Empreendimento A',
          description: 'Descrição A',
          address: 'Endereço A',
        },
      ];

      jest
        .spyOn(prisma.development, 'findMany')
        .mockResolvedValue(mockDevelopments as any);

      const result = await getDevelopmentByUser('user-id');

      expect(result).toEqual([
        {
          id: '1',
          nome: 'Empreendimento A',
          descricao: 'Descrição A',
          endereco: 'Endereço A',
        },
      ]);

      expect(prisma.development.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-id',
        },
        select: {
          id: true,
          name: true,
          description: true,
          address: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    });

    it('deve retornar array vazio quando usuário não tem empreendimentos', async () => {
      jest.spyOn(prisma.development, 'findMany').mockResolvedValue([] as any);

      const result = await getDevelopmentByUser('user-id');

      expect(result).toEqual([]);
    });
  });

  describe('createNewDevelopment', () => {
    const mockDevelopmentDto: DevelopmentDto = {
      name: 'Empreendimento Novo',
      description: 'Descrição do empreendimento',
      address: 'Endereço Novo',
      buildings: [
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
      ],
    };

    it('deve lançar erro quando empreendimento já existe', async () => {
      jest
        .spyOn(prisma.development, 'findFirst')
        .mockResolvedValue({ id: '1', name: 'Empreendimento Novo' } as any);

      await expect(
        createNewDevelopment('user-id', mockDevelopmentDto),
      ).rejects.toThrow(
        'Já existe um empreendimento com este nome ou endereço cadastrado.',
      );
    });

    it('deve criar empreendimento com sucesso', async () => {
      const mockTransaction = {
        development: {
          create: jest.fn().mockResolvedValue({
            id: 'dev-1',
            name: 'Empreendimento Novo',
          }),
        },
      };

      jest
        .spyOn(prisma.development, 'findFirst')
        .mockResolvedValue(null as any);
      jest
        .spyOn(prisma, '$transaction')
        .mockImplementation((callback: any) => callback(mockTransaction));
      jest.mocked(createBuildings).mockResolvedValue(undefined);

      await createNewDevelopment('user-id', mockDevelopmentDto);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(mockTransaction.development.create).toHaveBeenCalledWith({
        data: {
          name: 'Empreendimento Novo',
          address: 'Endereço Novo',
          description: 'Descrição do empreendimento',
          userId: 'user-id',
        },
      });
      expect(createBuildings).toHaveBeenCalledWith(
        mockTransaction,
        'dev-1',
        mockDevelopmentDto.buildings,
      );
    });
  });

  describe('getDevelopmentsComplaintsReport', () => {
    it('deve retornar relatório de reclamações formatado corretamente', async () => {
      const mockDevelopments = [
        {
          name: 'Empreendimento A',
          buildings: [
            {
              units: [
                {
                  items: [
                    {
                      feedbacks: [
                        {
                          status: 'ABERTO',
                          repairCost: Decimal(100),
                        },
                        {
                          status: 'FECHADO',
                          repairCost: Decimal(200),
                        },
                      ],
                    },
                    {
                      feedbacks: [
                        {
                          status: 'ABERTO',
                          repairCost: Decimal(50),
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      jest
        .spyOn(prisma.development, 'findMany')
        .mockResolvedValue(mockDevelopments as any);

      const result = await getDevelopmentsComplaintsReport('user-id');

      expect(result).toEqual([
        {
          obra: 'Empreendimento A',
          total: 3,
          abertos: 2,
          fechados: 1,
          totalCost: '350.00',
          avgCost: '116.67',
        },
      ]);

      expect(prisma.development.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
        include: expect.objectContaining({
          buildings: expect.objectContaining({
            include: expect.objectContaining({
              units: expect.objectContaining({
                include: expect.objectContaining({
                  items: expect.objectContaining({
                    include: expect.objectContaining({
                      feedbacks: true,
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      });
    });

    it('deve calcular custo médio como zero quando não há reclamações', async () => {
      const mockDevelopments = [
        {
          name: 'Empreendimento B',
          buildings: [
            {
              units: [
                {
                  items: [
                    {
                      feedbacks: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      jest
        .spyOn(prisma.development, 'findMany')
        .mockResolvedValue(mockDevelopments as any);

      const result = await getDevelopmentsComplaintsReport('user-id');

      expect(result[0].total).toBe(0);
      expect(result[0].avgCost).toBe('0.00');
    });

    it('deve retornar array vazio quando usuário não tem empreendimentos', async () => {
      jest.spyOn(prisma.development, 'findMany').mockResolvedValue([] as any);

      const result = await getDevelopmentsComplaintsReport('user-id');

      expect(result).toEqual([]);
    });
  });

  describe('getDevelopmentSummaryData', () => {
    it('deve retornar dados resumidos do desenvolvimento', async () => {
      const mockDevelopment = {
        id: 'dev-1',
        name: 'Empreendimento A',
        description: 'Descrição',
        address: 'Endereço A',
        buildings: [
          {
            id: 'building-1',
            name: 'Torre A',
            units: [
              {
                id: 'unit-1',
                name: 'Unidade 101',
                items: [
                  {
                    id: 'item-1',
                    name: 'Item Teste',
                    value: Decimal(1000),
                    batch: 'LOTE-001',
                    supplier: {
                      name: 'Fornecedor A',
                    },
                    feedbacks: [
                      {
                        id: 'feedback-1',
                        repairCost: Decimal(100),
                        scheduled_visit: { id: 'visit-1' },
                      },
                      {
                        id: 'feedback-2',
                        repairCost: Decimal(200),
                        scheduled_visit: null,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      jest
        .spyOn(prisma.development, 'findUnique')
        .mockResolvedValue(mockDevelopment as any);

      const result = await getDevelopmentSummaryData('dev-1');

      expect(result).toEqual({
        obra: {
          id: 'dev-1',
          nome: 'Empreendimento A',
          descricao: 'Descrição',
          endereco: 'Endereço A',
        },
        estatisticas: {
          total_reclamacoes: 2,
          total_custo_reparo: 300,
          total_visitas: 1,
          torres: 1,
        },
        torres: [
          {
            nome: 'Torre A',
            unidades: [
              {
                nome: 'Unidade 101',
                itens: [
                  {
                    nome: 'Item Teste',
                    fornecedor: 'Fornecedor A',
                    valor: Decimal(1000),
                    lote: 'LOTE-001',
                    reclamacoes: 2,
                  },
                ],
              },
            ],
          },
        ],
      });
    });

    it('deve lançar erro quando desenvolvimento não encontrado', async () => {
      jest.spyOn(prisma.development, 'findUnique').mockResolvedValue(null);

      await expect(
        getDevelopmentSummaryData('dev-inexistente'),
      ).rejects.toThrow('Development not found');
    });

    it('deve calcular estatísticas corretamente com múltiplos prédios', async () => {
      const mockDevelopment = {
        id: 'dev-1',
        name: 'Empreendimento A',
        description: 'Descrição',
        address: 'Endereço A',
        buildings: [
          {
            id: 'building-1',
            name: 'Torre A',
            units: [
              {
                id: 'unit-1',
                name: 'Unidade 101',
                items: [
                  {
                    id: 'item-1',
                    name: 'Item 1',
                    value: Decimal(1000),
                    batch: 'LOTE-001',
                    supplier: { name: 'Fornecedor A' },
                    feedbacks: [
                      {
                        repairCost: Decimal(100),
                        scheduled_visit: { id: 'visit-1' },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'building-2',
            name: 'Torre B',
            units: [
              {
                id: 'unit-2',
                name: 'Unidade 201',
                items: [
                  {
                    id: 'item-2',
                    name: 'Item 2',
                    value: Decimal(2000),
                    batch: 'LOTE-002',
                    supplier: { name: 'Fornecedor B' },
                    feedbacks: [
                      {
                        repairCost: Decimal(200),
                        scheduled_visit: null,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      jest
        .spyOn(prisma.development, 'findUnique')
        .mockResolvedValue(mockDevelopment as any);

      const result = await getDevelopmentSummaryData('dev-1');

      expect(result.estatisticas.total_reclamacoes).toBe(2);
      expect(result.estatisticas.total_custo_reparo).toBe(300);
      expect(result.estatisticas.total_visitas).toBe(1);
      expect(result.estatisticas.torres).toBe(2);
    });
  });

  describe('updateRiskThreshold', () => {
    it('deve atualizar threshold de risco com sucesso', async () => {
      const mockDevelopment = {
        id: 'dev-1',
        name: 'Empreendimento A',
      };

      jest
        .spyOn(prisma.development, 'findUnique')
        .mockResolvedValue(mockDevelopment as any);
      jest.spyOn(prisma.development, 'update').mockResolvedValue({
        id: 'dev-1',
        name: 'Empreendimento A',
        riskThreshold: Decimal(75),
      } as any);

      const result = await updateRiskThreshold('dev-1', 75);

      expect(result).toEqual({
        id: 'dev-1',
        name: 'Empreendimento A',
        riskThreshold: Decimal(75),
      });

      expect(prisma.development.update).toHaveBeenCalledWith({
        where: { id: 'dev-1' },
        data: { riskThreshold: 75 },
        select: {
          id: true,
          name: true,
          riskThreshold: true,
        },
      });
    });

    it('deve lançar erro quando desenvolvimento não encontrado', async () => {
      jest.spyOn(prisma.development, 'findUnique').mockResolvedValue(null);

      await expect(updateRiskThreshold('dev-inexistente', 75)).rejects.toThrow(
        'Empreendimento não encontrado',
      );
    });
  });

  describe('calculateDevelopmentHealth', () => {
    it('deve retornar status ÓTIMO quando percentual <= 30%', async () => {
      const mockDevelopment = {
        id: 'dev-1',
        name: 'Empreendimento A',
        riskThreshold: Decimal(50),
        buildings: [
          {
            units: [
              {
                items: [
                  { feedbacks: [{ id: '1' }] }, // 1 item com reclamação
                  { feedbacks: [] }, // 9 itens sem reclamação
                  { feedbacks: [] },
                  { feedbacks: [] },
                  { feedbacks: [] },
                  { feedbacks: [] },
                  { feedbacks: [] },
                  { feedbacks: [] },
                  { feedbacks: [] },
                  { feedbacks: [] },
                ],
              },
            ],
          },
        ],
      };

      jest
        .spyOn(prisma.development, 'findUnique')
        .mockResolvedValue(mockDevelopment as any);

      const result = await calculateDevelopmentHealth('dev-1');

      expect(result.healthStatus.status).toBe('ÓTIMO');
      expect(result.healthStatus.color).toBe('green');
      expect(result.metrics.percentageWithComplaints).toBe(10);
      expect(result.metrics.totalItems).toBe(10);
      expect(result.metrics.itemsWithComplaints).toBe(1);
    });

    it('deve retornar status OK quando percentual > 30% e <= threshold', async () => {
      const mockDevelopment = {
        id: 'dev-1',
        name: 'Empreendimento A',
        riskThreshold: Decimal(50),
        buildings: [
          {
            units: [
              {
                items: [
                  { feedbacks: [{ id: '1' }] }, // 4 itens com reclamação
                  { feedbacks: [{ id: '2' }] },
                  { feedbacks: [{ id: '3' }] },
                  { feedbacks: [{ id: '4' }] },
                  { feedbacks: [] }, // 6 itens sem reclamação
                  { feedbacks: [] },
                  { feedbacks: [] },
                  { feedbacks: [] },
                  { feedbacks: [] },
                  { feedbacks: [] },
                ],
              },
            ],
          },
        ],
      };

      jest
        .spyOn(prisma.development, 'findUnique')
        .mockResolvedValue(mockDevelopment as any);

      const result = await calculateDevelopmentHealth('dev-1');

      expect(result.healthStatus.status).toBe('OK');
      expect(result.healthStatus.color).toBe('yellow');
      expect(result.metrics.percentageWithComplaints).toBe(40);
      expect(result.metrics.totalItems).toBe(10);
      expect(result.metrics.itemsWithComplaints).toBe(4);
    });

    it('deve retornar status RUIM quando percentual > threshold', async () => {
      const mockDevelopment = {
        id: 'dev-1',
        name: 'Empreendimento A',
        riskThreshold: Decimal(50),
        buildings: [
          {
            units: [
              {
                items: [
                  { feedbacks: [{ id: '1' }] }, // 6 itens com reclamação
                  { feedbacks: [{ id: '2' }] },
                  { feedbacks: [{ id: '3' }] },
                  { feedbacks: [{ id: '4' }] },
                  { feedbacks: [{ id: '5' }] },
                  { feedbacks: [{ id: '6' }] },
                  { feedbacks: [] }, // 4 itens sem reclamação
                  { feedbacks: [] },
                  { feedbacks: [] },
                  { feedbacks: [] },
                ],
              },
            ],
          },
        ],
      };

      jest
        .spyOn(prisma.development, 'findUnique')
        .mockResolvedValue(mockDevelopment as any);

      const result = await calculateDevelopmentHealth('dev-1');

      expect(result.healthStatus.status).toBe('RUIM');
      expect(result.healthStatus.color).toBe('red');
      expect(result.metrics.percentageWithComplaints).toBe(60);
      expect(result.metrics.totalItems).toBe(10);
      expect(result.metrics.itemsWithComplaints).toBe(6);
    });

    it('deve usar threshold padrão de 50 quando não definido', async () => {
      const mockDevelopment = {
        id: 'dev-1',
        name: 'Empreendimento A',
        riskThreshold: null,
        buildings: [
          {
            units: [
              {
                items: [{ feedbacks: [{ id: '1' }] }, { feedbacks: [] }],
              },
            ],
          },
        ],
      };

      jest
        .spyOn(prisma.development, 'findUnique')
        .mockResolvedValue(mockDevelopment as any);

      const result = await calculateDevelopmentHealth('dev-1');

      expect(result.riskThreshold).toBe(50);
    });

    it('deve retornar percentual zero quando não há itens', async () => {
      const mockDevelopment = {
        id: 'dev-1',
        name: 'Empreendimento A',
        riskThreshold: Decimal(50),
        buildings: [
          {
            units: [
              {
                items: [],
              },
            ],
          },
        ],
      };

      jest
        .spyOn(prisma.development, 'findUnique')
        .mockResolvedValue(mockDevelopment as any);

      const result = await calculateDevelopmentHealth('dev-1');

      expect(result.metrics.percentageWithComplaints).toBe(0);
      expect(result.metrics.totalItems).toBe(0);
      expect(result.metrics.itemsWithComplaints).toBe(0);
    });

    it('deve lançar erro quando desenvolvimento não encontrado', async () => {
      jest.spyOn(prisma.development, 'findUnique').mockResolvedValue(null);

      await expect(
        calculateDevelopmentHealth('dev-inexistente'),
      ).rejects.toThrow('Empreendimento não encontrado');
    });

    it('deve calcular corretamente com múltiplos prédios e unidades', async () => {
      const mockDevelopment = {
        id: 'dev-1',
        name: 'Empreendimento A',
        riskThreshold: Decimal(50),
        buildings: [
          {
            units: [
              {
                items: [{ feedbacks: [{ id: '1' }] }, { feedbacks: [] }],
              },
            ],
          },
          {
            units: [
              {
                items: [
                  { feedbacks: [{ id: '2' }] },
                  { feedbacks: [] },
                  { feedbacks: [] },
                ],
              },
            ],
          },
        ],
      };

      jest
        .spyOn(prisma.development, 'findUnique')
        .mockResolvedValue(mockDevelopment as any);

      const result = await calculateDevelopmentHealth('dev-1');

      expect(result.metrics.totalItems).toBe(5);
      expect(result.metrics.itemsWithComplaints).toBe(2);
      expect(result.metrics.percentageWithComplaints).toBe(40);
    });
  });
});

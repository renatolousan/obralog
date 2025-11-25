import prisma from '../../../../resources/prisma/client';
import {
  getIssues,
  getMonthlyComplaintsByDevelopment,
  getAllComplaints,
  getUserComplaints,
  getComplaintById,
  createComplaint,
  getDevelopmentComplaintsForSummary,
  getComplaintsByDevelopment,
  scheduleVisit,
  updateComplaintStatus,
} from '../../../../resources/complaints/service';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { FeedbackStatus } from '@prisma/client';
import { sendComplaintUpdateEmail } from '../../../../utils/mailer';

jest.mock('../../../../resources/prisma/client', () => ({
  __esModule: true,
  default: {
    feedback: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    item: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    visit: {
      create: jest.fn(),
      update: jest.fn(),
    },
    installer: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('../../../../utils/mailer', () => ({
  sendComplaintUpdateEmail: jest.fn(),
}));

describe('Complaints Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getIssues', () => {
    it('deve retornar lista de issues únicas e ordenadas', async () => {
      const mockFeedback = [
        { issue: 'QUEBRADO' },
        { issue: 'DANIFICADO' },
        { issue: 'FALTANDO' },
      ];

      jest
        .spyOn(prisma.feedback, 'findMany')
        .mockResolvedValue(mockFeedback as any);

      const result = await getIssues();

      expect(result).toEqual(['QUEBRADO', 'DANIFICADO', 'FALTANDO']);
      expect(prisma.feedback.findMany).toHaveBeenCalledWith({
        select: { issue: true },
        distinct: ['issue'],
        orderBy: { issue: 'asc' },
        where: {
          issue: {
            not: '',
          },
        },
      });
    });

    it('deve retornar array vazio quando não há issues', async () => {
      jest.spyOn(prisma.feedback, 'findMany').mockResolvedValue([]);

      const result = await getIssues();

      expect(result).toEqual([]);
    });

    it('deve filtrar issues vazias', async () => {
      const mockFeedback = [
        { issue: 'QUEBRADO' },
        { issue: '' },
        { issue: 'DANIFICADO' },
      ];

      jest
        .spyOn(prisma.feedback, 'findMany')
        .mockResolvedValue(mockFeedback.filter((f) => f.issue !== '') as any);

      const result = await getIssues();

      expect(result).toEqual(['QUEBRADO', 'DANIFICADO']);
    });
  });

  describe('getMonthlyComplaintsByDevelopment', () => {
    it('deve agrupar reclamações por mês corretamente', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-03-31');

      const mockComplaints = [
        { created_at: new Date('2024-01-15') },
        { created_at: new Date('2024-01-20') },
        { created_at: new Date('2024-02-10') },
        { created_at: new Date('2024-03-05') },
        { created_at: new Date('2024-03-15') },
      ];

      jest
        .spyOn(prisma.feedback, 'findMany')
        .mockResolvedValue(mockComplaints as any);

      const result = await getMonthlyComplaintsByDevelopment(
        'dev-id',
        startDate,
        endDate,
      );

      expect(result).toEqual([
        { month: '2024-01', complaints: 2 },
        { month: '2024-02', complaints: 1 },
        { month: '2024-03', complaints: 2 },
      ]);

      expect(prisma.feedback.findMany).toHaveBeenCalledWith({
        where: {
          user: {
            unit: {
              torre: {
                development: {
                  id: 'dev-id',
                },
              },
            },
          },
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          created_at: true,
        },
      });
    });

    it('deve retornar array ordenado por mês', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const mockComplaints = [
        { created_at: new Date('2024-12-15') },
        { created_at: new Date('2024-01-10') },
        { created_at: new Date('2024-06-05') },
      ];

      jest
        .spyOn(prisma.feedback, 'findMany')
        .mockResolvedValue(mockComplaints as any);

      const result = await getMonthlyComplaintsByDevelopment(
        'dev-id',
        startDate,
        endDate,
      );

      expect(result[0]?.month).toBe('2024-01');
      expect(result[1]?.month).toBe('2024-06');
      expect(result[2]?.month).toBe('2024-12');
    });

    it('deve retornar array vazio quando não há reclamações', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      jest.spyOn(prisma.feedback, 'findMany').mockResolvedValue([]);

      const result = await getMonthlyComplaintsByDevelopment(
        'dev-id',
        startDate,
        endDate,
      );

      expect(result).toEqual([]);
    });
  });

  describe('getAllComplaints', () => {
    it('deve retornar reclamações sem filtros', async () => {
      const mockFeedback = [
        {
          id: '1',
          issue: 'QUEBRADO',
          description: 'Item quebrado',
          status: FeedbackStatus.ABERTO,
          created_at: new Date('2024-01-15'),
          id_item: 'item-1',
          id_user: 'user-1',
          attachments: [],
          scheduled_visit: null,
          item: {
            id: 'item-1',
            name: 'Item Teste',
            description: 'Descrição do item',
            unit: {
              id: 'unit-1',
              name: 'Unidade 101',
              number: 101,
              floor: 1,
              id_building: 'building-1',
              torre: {
                id: 'building-1',
                id_development: 'dev-1',
              },
            },
            supplier: {
              cnpj: '12345678901234',
              name: 'Fornecedor Teste',
            },
            installers: [],
          },
        },
      ];

      jest
        .spyOn(prisma.feedback, 'findMany')
        .mockResolvedValue(mockFeedback as any);

      const result = await getAllComplaints({});

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(prisma.feedback.findMany).toHaveBeenCalled();
    });

    it('deve filtrar por issue', async () => {
      const mockFeedback = [
        {
          id: '1',
          issue: 'QUEBRADO',
          description: 'Item quebrado',
          status: FeedbackStatus.ABERTO,
          created_at: new Date('2024-01-15'),
          id_item: 'item-1',
          id_user: 'user-1',
          attachments: [],
          scheduled_visit: null,
          item: null,
        },
      ];

      jest
        .spyOn(prisma.feedback, 'findMany')
        .mockResolvedValue(mockFeedback as any);

      const result = await getAllComplaints({ issue: 'quebrado' });

      expect(result).toBeDefined();
      expect(prisma.feedback.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({ issue: 'QUEBRADO' }),
            ]),
          }),
        }),
      );
    });

    it('deve filtrar por status', async () => {
      jest.spyOn(prisma.feedback, 'findMany').mockResolvedValue([] as any);

      await getAllComplaints({ status: 'ABERTO' });

      expect(prisma.feedback.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                status: expect.objectContaining({
                  in: ['ABERTO'],
                }),
              }),
            ]),
          }),
        }),
      );
    });

    it('deve filtrar por múltiplos status', async () => {
      jest.spyOn(prisma.feedback, 'findMany').mockResolvedValue([] as any);

      await getAllComplaints({ status: 'ABERTO,EM_ANALISE' });

      expect(prisma.feedback.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                status: expect.objectContaining({
                  in: ['ABERTO', 'EM_ANALISE'],
                }),
              }),
            ]),
          }),
        }),
      );
    });

    it('deve filtrar por id_usuario', async () => {
      jest.spyOn(prisma.feedback, 'findMany').mockResolvedValue([] as any);

      await getAllComplaints({ id_usuario: 'user-1' });

      expect(prisma.feedback.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({ id_user: 'user-1' }),
            ]),
          }),
        }),
      );
    });

    it('deve filtrar por data de início', async () => {
      jest.spyOn(prisma.feedback, 'findMany').mockResolvedValue([] as any);

      await getAllComplaints({ start_date: '2024-01-01' });

      expect(prisma.feedback.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                created_at: expect.objectContaining({
                  gte: expect.any(Date),
                }),
              }),
            ]),
          }),
        }),
      );
    });

    it('deve filtrar por data de fim', async () => {
      jest.spyOn(prisma.feedback, 'findMany').mockResolvedValue([] as any);

      await getAllComplaints({ end_date: '2024-12-31' });

      expect(prisma.feedback.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                created_at: expect.objectContaining({
                  lte: expect.any(Date),
                }),
              }),
            ]),
          }),
        }),
      );
    });

    it('deve filtrar por search term', async () => {
      jest.spyOn(prisma.feedback, 'findMany').mockResolvedValue([] as any);

      await getAllComplaints({ search: 'teste' });

      expect(prisma.feedback.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                OR: expect.arrayContaining([
                  expect.objectContaining({
                    description: expect.objectContaining({
                      contains: 'teste',
                    }),
                  }),
                  expect.objectContaining({
                    issue: expect.objectContaining({
                      contains: expect.any(String),
                    }),
                  }),
                ]),
              }),
            ]),
          }),
        }),
      );
    });
  });

  describe('getUserComplaints', () => {
    it('deve retornar reclamações do usuário', async () => {
      const mockFeedback = [
        {
          id: '1',
          issue: 'QUEBRADO',
          description: 'Item quebrado',
          status: FeedbackStatus.ABERTO,
          created_at: new Date('2024-01-15'),
          id_item: 'item-1',
          id_user: 'user-1',
          attachments: [],
          scheduled_visit: null,
          item: null,
        },
      ];

      jest
        .spyOn(prisma.feedback, 'findMany')
        .mockResolvedValue(mockFeedback as any);

      const result = await getUserComplaints('user-1', {});

      expect(result).toBeDefined();
      expect(prisma.feedback.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id_user: 'user-1',
          }),
        }),
      );
    });

    it('deve aplicar filtros adicionais nas reclamações do usuário', async () => {
      jest.spyOn(prisma.feedback, 'findMany').mockResolvedValue([] as any);

      await getUserComplaints('user-1', { status: 'ABERTO' });

      expect(prisma.feedback.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                status: expect.objectContaining({
                  in: ['ABERTO'],
                }),
              }),
            ]),
            id_user: 'user-1',
          }),
        }),
      );
    });
  });

  describe('getComplaintById', () => {
    it('deve retornar reclamação quando encontrada', async () => {
      const mockFeedback = {
        id: '1',
        issue: 'QUEBRADO',
        description: 'Item quebrado',
        status: FeedbackStatus.ABERTO,
        created_at: new Date('2024-01-15'),
        id_item: 'item-1',
        id_user: 'user-1',
        attachments: [],
        item: {
          id: 'item-1',
          name: 'Item Teste',
          description: 'Descrição',
          unit: {
            id: 'unit-1',
            name: 'Unidade 101',
            number: 101,
            floor: 1,
            id_building: 'building-1',
            torre: {
              id: 'building-1',
              id_development: 'dev-1',
            },
          },
          supplier: {
            cnpj: '12345678901234',
            name: 'Fornecedor',
          },
          installers: [],
        },
      };

      jest
        .spyOn(prisma.feedback, 'findUnique')
        .mockResolvedValue(mockFeedback as any);

      const result = await getComplaintById('1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('1');
      expect(prisma.feedback.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object),
      });
    });

    it('deve retornar null quando reclamação não encontrada', async () => {
      jest.spyOn(prisma.feedback, 'findUnique').mockResolvedValue(null);

      const result = await getComplaintById('999');

      expect(result).toBeNull();
    });
  });

  describe('createComplaint', () => {
    const mockFile = {
      originalname: 'test.jpg',
      filename: 'test-123.jpg',
      path: '/uploads/test-123.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
    } as any;

    it('deve criar reclamação com sucesso', async () => {
      const mockItem = {
        id: 'item-1',
        name: 'Item Teste',
      };

      const mockUser = {
        id: 'user-1',
        name: 'Usuário Teste',
      };

      const mockCreatedFeedback = {
        id: 'feedback-1',
        issue: 'QUEBRADO',
        description: 'Item quebrado',
        status: FeedbackStatus.ABERTO,
        created_at: new Date('2024-01-15'),
        id_item: 'item-1',
        id_user: 'user-1',
        attachments: [
          {
            id: 'attach-1',
            original_name: 'test.jpg',
            file_name: 'test-123.jpg',
            path: '/uploads/reclamacoes/test-123.jpg',
            mime_type: 'image/jpeg',
            size: BigInt(1024),
          },
        ],
        item: {
          id: 'item-1',
          name: 'Item Teste',
          description: 'Descrição',
          unit: {
            id: 'unit-1',
            name: 'Unidade 101',
            number: 101,
            floor: 1,
            id_building: 'building-1',
            torre: {
              id: 'building-1',
              id_development: 'dev-1',
            },
          },
          supplier: {
            cnpj: '12345678901234',
            name: 'Fornecedor',
          },
          installers: [],
        },
      };

      jest.spyOn(prisma.item, 'findUnique').mockResolvedValue(mockItem as any);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      jest
        .spyOn(prisma.feedback, 'create')
        .mockResolvedValue(mockCreatedFeedback as any);

      const result = await createComplaint({
        descricao: 'Item quebrado',
        issue: 'quebrado',
        id_item: 'item-1',
        id_usuario: 'user-1',
        files: [mockFile],
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('feedback-1');
      expect(prisma.feedback.create).toHaveBeenCalled();
    });

    it('deve lançar erro quando issue excede 20 caracteres', async () => {
      await expect(
        createComplaint({
          descricao: 'Descrição',
          issue: 'ISSUE_MUITO_LONGO_MAIS_DE_20_CARACTERES',
          id_item: 'item-1',
          id_usuario: 'user-1',
          files: [],
        }),
      ).rejects.toThrow('O campo "issue" deve ter no maximo 20 caracteres.');
    });

    it('deve lançar erro quando item não encontrado', async () => {
      jest.spyOn(prisma.item, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue({ id: 'user-1' } as any);

      await expect(
        createComplaint({
          descricao: 'Descrição',
          issue: 'quebrado',
          id_item: 'item-inexistente',
          id_usuario: 'user-1',
          files: [],
        }),
      ).rejects.toThrow('Item informado nao foi encontrado.');
    });

    it('deve lançar erro quando usuário não encontrado', async () => {
      jest
        .spyOn(prisma.item, 'findUnique')
        .mockResolvedValue({ id: 'item-1' } as any);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(
        createComplaint({
          descricao: 'Descrição',
          issue: 'quebrado',
          id_item: 'item-1',
          id_usuario: 'user-inexistente',
          files: [],
        }),
      ).rejects.toThrow('Usuario informado nao foi encontrado.');
    });

    it('deve criar reclamação sem anexos', async () => {
      const mockItem = { id: 'item-1' };
      const mockUser = { id: 'user-1' };
      const mockCreatedFeedback = {
        id: 'feedback-1',
        issue: 'QUEBRADO',
        description: 'Descrição',
        status: FeedbackStatus.ABERTO,
        created_at: new Date(),
        id_item: 'item-1',
        id_user: 'user-1',
        attachments: [],
        item: null,
      };

      jest.spyOn(prisma.item, 'findUnique').mockResolvedValue(mockItem as any);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      jest
        .spyOn(prisma.feedback, 'create')
        .mockResolvedValue(mockCreatedFeedback as any);

      const result = await createComplaint({
        descricao: 'Descrição',
        issue: 'quebrado',
        id_item: 'item-1',
        id_usuario: 'user-1',
        files: [],
      });

      expect(result).toBeDefined();
      expect(prisma.feedback.create).toHaveBeenCalledWith(
        expect.not.objectContaining({
          data: expect.objectContaining({
            attachments: expect.anything(),
          }),
        }),
      );
    });
  });

  describe('getDevelopmentComplaintsForSummary', () => {
    it('deve retornar reclamações do desenvolvimento', async () => {
      const mockComplaints = [
        {
          id: '1',
          item: {
            id: 'item-1',
            supplier: {
              cnpj: '12345678901234',
              name: 'Fornecedor',
            },
          },
          scheduled_visit: null,
        },
      ];

      jest
        .spyOn(prisma.feedback, 'findMany')
        .mockResolvedValue(mockComplaints as any);

      const result = await getDevelopmentComplaintsForSummary('dev-1');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(prisma.feedback.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          user: expect.objectContaining({
            unit: expect.objectContaining({
              torre: expect.objectContaining({
                development: expect.objectContaining({
                  id: 'dev-1',
                }),
              }),
            }),
          }),
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('getComplaintsByDevelopment', () => {
    it('deve retornar reclamações formatadas com anexos', async () => {
      const mockComplaints = [
        {
          id: '1',
          attachments: [
            {
              id: 'attach-1',
              size: BigInt(1024),
            },
          ],
          user: {
            name: 'Usuário',
            email: 'user@test.com',
          },
          item: {
            name: 'Item Teste',
            unit: {
              name: 'Unidade 101',
              number: 101,
              floor: 1,
              torre: {
                name: 'Torre A',
              },
            },
          },
        },
      ];

      jest
        .spyOn(prisma.feedback, 'findMany')
        .mockResolvedValue(mockComplaints as any);

      const result = await getComplaintsByDevelopment('dev-1');

      expect(result).toBeDefined();
      expect(result[0]?.attachments[0]?.size).toBe('1024');
      expect(prisma.feedback.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          item: expect.objectContaining({
            unit: expect.objectContaining({
              torre: expect.objectContaining({
                id_development: 'dev-1',
              }),
            }),
          }),
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('scheduleVisit', () => {
    it('deve agendar visita com sucesso', async () => {
      const visitData = {
        date: new Date('2024-12-31T10:00:00'),
        duration: 60,
        foremen_id: ['installer-1', 'installer-2'],
      };

      const mockVisit = {
        id: 'visit-1',
        feedback_id: 'feedback-1',
        date: visitData.date,
        duration: visitData.duration,
      };

      jest.spyOn(prisma.visit, 'create').mockResolvedValue(mockVisit as any);

      const result = await scheduleVisit('feedback-1', visitData);

      expect(result).toBeDefined();
      expect(prisma.visit.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          feedback_id: 'feedback-1',
          date: visitData.date,
          duration: visitData.duration,
          foremen: expect.objectContaining({
            connect: [{ id: 'installer-1' }, { id: 'installer-2' }],
          }),
        }),
      });
    });
  });

  describe('updateComplaintStatus', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.mocked(sendComplaintUpdateEmail).mockResolvedValue(true);
    });

    it('deve atualizar status para EM_ANALISE', async () => {
      const mockFeedback = {
        id: 'feedback-1',
        user: {
          name: 'Usuário Teste',
          email: 'user@test.com',
        },
      };

      jest
        .spyOn(prisma.feedback, 'findUnique')
        .mockResolvedValue(mockFeedback as any);
      jest.spyOn(prisma.feedback, 'update').mockResolvedValue({} as any);

      const result = await updateComplaintStatus('feedback-1', {
        statusFlag: 'EM_ANALISE',
      });

      expect(result).toBe('Reclamação posta em análise');
      expect(prisma.feedback.update).toHaveBeenCalledWith({
        where: { id: 'feedback-1' },
        data: { status: 'EM_ANALISE' },
      });
      expect(sendComplaintUpdateEmail).toHaveBeenCalled();
    });

    it('deve agendar visita e atualizar status para VISITA_AGENDADA', async () => {
      const mockFeedback = {
        id: 'feedback-1',
        user: {
          name: 'Usuário Teste',
          email: 'user@test.com',
        },
      };

      const visitData = {
        date: new Date('2024-12-31T10:00:00'),
        duration: 60,
        foremen_id: ['installer-1'],
      };

      jest
        .spyOn(prisma.feedback, 'findUnique')
        .mockResolvedValue(mockFeedback as any);
      jest.spyOn(prisma.visit, 'create').mockResolvedValue({} as any);
      jest.spyOn(prisma.feedback, 'update').mockResolvedValue({} as any);
      jest.spyOn(prisma, '$transaction').mockResolvedValue([{}, {}] as any);

      const result = await updateComplaintStatus('feedback-1', {
        statusFlag: 'VISITA_AGENDADA',
        data: visitData,
      });

      expect(result).toBe('Visita agendada com sucesso.');
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(sendComplaintUpdateEmail).toHaveBeenCalled();
    });

    it('deve validar instalador antes de agendar visita', async () => {
      const mockFeedback = {
        id: 'feedback-1',
        user: {
          name: 'Usuário Teste',
          email: 'user@test.com',
        },
      };

      const visitData = {
        date: new Date('2024-12-31T10:00:00'),
        duration: 60,
        foremen_id: ['installer-1'],
        id_installer: 'installer-inexistente',
      };

      jest
        .spyOn(prisma.feedback, 'findUnique')
        .mockResolvedValue(mockFeedback as any);
      jest.spyOn(prisma.installer, 'findUnique').mockResolvedValue(null);

      await expect(
        updateComplaintStatus('feedback-1', {
          statusFlag: 'VISITA_AGENDADA',
          data: visitData,
        }),
      ).rejects.toThrow('Prestador de serviço não encontrado');
    });

    it('deve atualizar status para AGUARDANDO_FEEDBACK', async () => {
      const mockFeedback = {
        id: 'feedback-1',
        user: {
          name: 'Usuário Teste',
          email: 'user@test.com',
        },
      };

      jest
        .spyOn(prisma.feedback, 'findUnique')
        .mockResolvedValue(mockFeedback as any);
      jest.spyOn(prisma.visit, 'update').mockResolvedValue({} as any);
      jest.spyOn(prisma.feedback, 'update').mockResolvedValue({} as any);
      jest.spyOn(prisma, '$transaction').mockResolvedValue([{}, {}] as any);

      const result = await updateComplaintStatus('feedback-1', {
        statusFlag: 'AGUARDANDO_FEEDBACK',
        data: { confirm_visit: true },
      });

      expect(result).toBe('Visita confirmada. Aguardando feedback do usuário');
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(sendComplaintUpdateEmail).toHaveBeenCalled();
    });

    it('deve fechar reclamação com status FECHADO', async () => {
      const mockFeedback = {
        id: 'feedback-1',
        user: {
          name: 'Usuário Teste',
          email: 'user@test.com',
        },
      };

      jest
        .spyOn(prisma.feedback, 'findUnique')
        .mockResolvedValue(mockFeedback as any);
      jest.spyOn(prisma.feedback, 'update').mockResolvedValue({} as any);

      const result = await updateComplaintStatus('feedback-1', {
        statusFlag: 'FECHADO',
        data: { liked: true, comment: 'Excelente serviço' },
      });

      expect(result).toBe('Reclamação fechada.');
      expect(prisma.feedback.update).toHaveBeenCalledWith({
        where: { id: 'feedback-1' },
        data: expect.objectContaining({
          status: FeedbackStatus.FECHADO,
          user_like: true,
          user_comment: 'Excelente serviço',
          completedAt: expect.any(Date),
        }),
      });
      expect(sendComplaintUpdateEmail).toHaveBeenCalled();
    });

    it('deve lançar erro quando feedback não encontrado', async () => {
      jest.spyOn(prisma.feedback, 'findUnique').mockResolvedValue(null);

      await expect(
        updateComplaintStatus('feedback-inexistente', {
          statusFlag: 'EM_ANALISE',
        }),
      ).rejects.toThrow(
        'Não foi possível encontrar o proprietário da reclamação.',
      );
    });

    it('deve lançar erro quando flag de status é inválida', async () => {
      const mockFeedback = {
        id: 'feedback-1',
        user: {
          name: 'Usuário Teste',
          email: 'user@test.com',
        },
      };

      jest
        .spyOn(prisma.feedback, 'findUnique')
        .mockResolvedValue(mockFeedback as any);

      await expect(
        updateComplaintStatus('feedback-1', {
          statusFlag: 'STATUS_INVALIDO' as any,
        }),
      ).rejects.toThrow('Flag de status inválida.');
    });
  });
});

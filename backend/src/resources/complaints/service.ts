import { FeedbackStatus, Prisma, Visit } from '@prisma/client';
import prisma from '../prisma/client';
import {
  ComplaintStatusUpdate,
  VisitDto,
  type FeedbackWithRelations,
  type UploadedFile,
} from '../../types/types';
import { normalizeIssue, formatDateTime } from '../../utils/feedback';
import path from 'node:path';
import { format } from 'date-fns';
import { sendComplaintUpdateEmail } from '../../utils/mailer';

export async function getAllComplaints(filters: {
  issue?: string;
  status?: string;
  id_usuario?: string;
  id_item?: string;
  item_id?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
  development_id?: string;
  building_id?: string;
  unit_id?: string;
  supplier_id?: string;
  installer_id?: string;
}) {
  const {
    issue,
    status,
    id_usuario: idUsuario,
    id_item: legacyItemId,
    item_id: itemId,
    search,
    start_date: startDate,
    end_date: endDate,
    development_id: developmentId,
    building_id: buildingId,
    unit_id: unitId,
    supplier_id: supplierId,
    installer_id: installerId,
  } = filters;

  const andFilters: Prisma.FeedbackWhereInput[] = [];

  if (issue && issue.trim()) {
    andFilters.push({ issue: normalizeIssue(issue) });
  }

  if (status && status.trim()) {
    const statusValues = status
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (statusValues.length > 0) {
      andFilters.push({
        status: {
          in: statusValues as FeedbackStatus[],
        },
      });
    }
  }

  if (idUsuario && idUsuario.trim()) {
    andFilters.push({ id_user: idUsuario.trim() });
  }

  const effectiveItemId = (itemId ?? legacyItemId)?.trim();
  if (effectiveItemId) {
    andFilters.push({ id_item: effectiveItemId });
  }

  if (search && search.trim()) {
    const term = search.trim();
    andFilters.push({
      OR: [
        { description: { contains: term } },
        { issue: { contains: normalizeIssue(term) } },
      ],
    });
  }

  if (startDate && startDate.trim()) {
    const parsed = new Date(startDate);
    if (!Number.isNaN(parsed.valueOf())) {
      andFilters.push({ created_at: { gte: parsed } });
    }
  }

  if (endDate && endDate.trim()) {
    const parsed = new Date(endDate);
    if (!Number.isNaN(parsed.valueOf())) {
      const end = new Date(parsed);
      end.setHours(23, 59, 59, 999);
      andFilters.push({ created_at: { lte: end } });
    }
  }

  if (developmentId && developmentId.trim()) {
    andFilters.push({
      item: {
        unit: {
          torre: {
            id_development: developmentId.trim(),
          },
        },
      },
    });
  }

  if (buildingId && buildingId.trim()) {
    andFilters.push({
      item: {
        unit: {
          id_building: buildingId.trim(),
        },
      },
    });
  }

  if (unitId && unitId.trim()) {
    andFilters.push({
      item: {
        id_unit: unitId.trim(),
      },
    });
  }

  if (supplierId && supplierId.trim()) {
    andFilters.push({
      item: {
        cnpj_supplier: supplierId.trim(),
      },
    });
  }

  if (installerId && installerId.trim()) {
    andFilters.push({
      item: {
        installers: {
          some: {
            id: installerId.trim(),
          },
        },
      },
    });
  }

  const where: Prisma.FeedbackWhereInput = andFilters.length
    ? { AND: andFilters }
    : {};

  const feedbacks: FeedbackWithRelations[] = await prisma.feedback.findMany({
    where,
    include: {
      attachments: true,
      scheduled_visit: {
        include: {
          foremen: true,
        },
      },
      item: {
        include: {
          unit: {
            include: {
              torre: true,
            },
          },
          supplier: true,
          installers: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  return feedbacks.map(toReclamacao);
}

export async function getUserComplaints(
  userId: string,
  filters: {
    issue?: string;
    status?: string;
    id_item?: string;
    item_id?: string;
    search?: string;
    start_date?: string;
    end_date?: string;
    supplier_id?: string;
    installer_id?: string;
  },
) {
  const {
    issue,
    status,
    id_item: legacyItemId,
    item_id: itemId,
    search,
    start_date: startDate,
    end_date: endDate,
    supplier_id: supplierId,
    installer_id: installerId,
  } = filters;

  const andFilters: Prisma.FeedbackWhereInput[] = [];

  if (issue && issue.trim()) {
    andFilters.push({ issue: normalizeIssue(issue) });
  }

  if (status && status.trim()) {
    const statusValues = status
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (statusValues.length > 0) {
      andFilters.push({
        status: {
          in: statusValues as FeedbackStatus[],
        },
      });
    }
  }

  const effectiveItemId = (itemId ?? legacyItemId)?.trim();
  if (effectiveItemId) {
    andFilters.push({ id_item: effectiveItemId });
  }

  if (search && search.trim()) {
    const term = search.trim();
    andFilters.push({
      OR: [
        { description: { contains: term } },
        { issue: { contains: normalizeIssue(term) } },
      ],
    });
  }

  if (startDate && startDate.trim()) {
    const parsed = new Date(startDate);
    if (!Number.isNaN(parsed.valueOf())) {
      andFilters.push({ created_at: { gte: parsed } });
    }
  }

  if (endDate && endDate.trim()) {
    const parsed = new Date(endDate);
    if (!Number.isNaN(parsed.valueOf())) {
      const end = new Date(parsed);
      end.setHours(23, 59, 59, 999);
      andFilters.push({ created_at: { lte: end } });
    }
  }

  if (supplierId && supplierId.trim()) {
    andFilters.push({
      item: {
        cnpj_supplier: supplierId.trim(),
      },
    });
  }

  if (installerId && installerId.trim()) {
    andFilters.push({
      item: {
        installers: {
          some: {
            id: installerId.trim(),
          },
        },
      },
    });
  }

  const where: Prisma.FeedbackWhereInput = andFilters.length
    ? { AND: andFilters, id_user: userId }
    : { id_user: userId };

  const feedbacks: FeedbackWithRelations[] = await prisma.feedback.findMany({
    where,
    include: {
      attachments: true,
      scheduled_visit: {
        include: {
          foremen: true,
        },
      },
      item: {
        include: {
          unit: {
            include: {
              torre: true,
            },
          },
          supplier: true,
          installers: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });
  return feedbacks.map(toReclamacao);
}

export async function getComplaintById(id: string) {
  const feedback = (await prisma.feedback.findUnique({
    where: { id },
    include: {
      attachments: true,
      item: {
        include: {
          unit: {
            include: {
              torre: true,
            },
          },
          supplier: true,
          installers: true,
        },
      },
    },
  })) as FeedbackWithRelations | null;

  if (!feedback) {
    return null;
  }

  return toReclamacao(feedback);
}

export async function createComplaint(data: {
  descricao: string;
  issue: string;
  id_item: string;
  id_usuario: string;
  files: UploadedFile[];
}) {
  const { descricao, issue, id_item, id_usuario, files } = data;

  const normalizedIssue = normalizeIssue(issue);
  if (normalizedIssue.length > 20) {
    throw new Error('O campo "issue" deve ter no maximo 20 caracteres.');
  }

  const [item, user] = await Promise.all([
    prisma.item.findUnique({ where: { id: id_item } }),
    prisma.user.findUnique({ where: { id: id_usuario } }),
  ]);

  if (!item) {
    throw new Error('Item informado nao foi encontrado.');
  }

  if (!user) {
    throw new Error('Usuario informado nao foi encontrado.');
  }

  const attachmentsData = files.map((file) => ({
    original_name: file.originalname,
    file_name: file.filename,
    path: path.posix.join('/uploads/reclamacoes', file.filename),
    mime_type: file.mimetype,
    size: BigInt(file.size),
  }));

  const feedback = (await prisma.feedback.create({
    data: {
      issue: normalizedIssue,
      description: descricao,
      id_item: item.id,
      id_user: user.id,
      status: FeedbackStatus.ABERTO,
      ...(attachmentsData.length
        ? {
            attachments: {
              create: attachmentsData,
            },
          }
        : {}),
    },
    include: {
      attachments: true,
      item: {
        include: {
          unit: {
            include: {
              torre: true,
            },
          },
          supplier: true,
          installers: true,
        },
      },
    },
  })) as FeedbackWithRelations;
  return toReclamacao(feedback);
}

export async function getIssues(): Promise<string[]> {
  const issues = await prisma.feedback.findMany({
    select: { issue: true },
    distinct: ['issue'],
    orderBy: { issue: 'asc' },
    where: {
      issue: {
        not: '',
      },
    },
  });

  return issues.map((entry) => entry.issue);
}

function toReclamacao(feedback: FeedbackWithRelations) {
  const item = feedback.item;
  const unit = item?.unit ?? null;
  const building = unit?.torre ?? null;
  const statusCode = feedback.status;

  return {
    id: feedback.id,
    data_hora: formatDateTime(feedback.created_at),
    descricao: feedback.description,
    issue: feedback.issue,
    id_item: feedback.id_item,
    id_usuario: feedback.id_user,
    status: statusCode,
    status_codigo: statusCode,
    anexos: feedback.attachments.map((attachment) => ({
      id: attachment.id,
      nome_original: attachment.original_name,
      nome_arquivo: attachment.file_name,
      caminho: path.posix.join('/uploads/reclamacoes', attachment.file_name),
      tipo: attachment.mime_type,
      tamanho: attachment.size.toString(),
    })),
    visita: feedback.scheduled_visit,
    item: item
      ? {
          id: item.id,
          nome: item.name,
          descricao: item.description,
          fornecedor: item.supplier
            ? {
                id: item.supplier.cnpj,
                nome: item.supplier.name,
              }
            : undefined,
          instaladores: item.installers.map((installer) => ({
            id: installer.id,
            nome: installer.name,
          })),
        }
      : undefined,
    unidade: unit
      ? {
          id: unit.id,
          nome: unit.name,
          numero: unit.number,
          andar: unit.floor,
          id_building: unit.id_building,
        }
      : undefined,
    torre: building
      ? {
          id: building.id,
          id_development: building.id_development,
        }
      : undefined,
    development: building
      ? {
          id: building.id_development,
        }
      : undefined,
  };
}

export async function getDevelopmentComplaintsForSummary(
  id_development: string,
) {
  return await prisma.feedback.findMany({
    where: {
      user: {
        unit: {
          torre: {
            development: { id: id_development },
          },
        },
      },
    },
    include: {
      item: {
        include: { supplier: true },
      },
      scheduled_visit: true,
    },
  });
}

export async function getComplaintsByDevelopment(id_development: string) {
  const complaints = await prisma.feedback.findMany({
    where: {
      item: {
        unit: {
          torre: {
            id_development,
          },
        },
      },
    },
    include: {
      attachments: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      item: {
        select: {
          name: true,
          unit: {
            select: {
              name: true,
              number: true,
              floor: true,
              torre: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Converter BigInt para string nos attachments
  return complaints.map((complaint) => ({
    ...complaint,
    attachments: complaint.attachments.map((attachment) => ({
      ...attachment,
      size: attachment.size.toString(),
    })),
  }));
}

export async function scheduleVisit(complaintId: string, visitData: VisitDto) {
  const visit = await prisma.visit.create({
    data: {
      feedback_id: complaintId,
      date: visitData.date,
      duration: visitData.duration,
      foremen: {
        connect: visitData.foremen_id.map((id) => ({ id })),
      },
    },
  });
  return visit;
}

export async function updateComplaintStatus(
  complaintId: string,
  data: ComplaintStatusUpdate,
) {
  const { statusFlag } = data;

  const feedback = await prisma.feedback.findUnique({
    where: { id: complaintId },
    include: { user: true },
  });

  if (!feedback || !feedback.user) {
    throw new Error('Não foi possível encontrar o proprietário da reclamação.');
  }

  const ownerName = feedback.user.name;
  const ownerEmail = feedback.user.email;

  if (data.statusFlag === 'EM_ANALISE') {
    await prisma.feedback.update({
      where: { id: complaintId },
      data: {
        status: data.statusFlag,
      },
    });

    await sendComplaintUpdateEmail(
      ownerName,
      ownerEmail,
      statusFlag,
      complaintId,
    );

    return 'Reclamação posta em análise';
  } else if (data.statusFlag === 'VISITA_AGENDADA') {
    const visitData = data.data;

    // Validar instalador se fornecido
    if (visitData.id_installer) {
      const installer = await prisma.installer.findUnique({
        where: { id: visitData.id_installer },
      });

      if (!installer) {
        throw new Error('Prestador de serviço não encontrado');
      }
    }

    await prisma.$transaction([
      prisma.visit.create({
        data: {
          feedback_id: complaintId,
          date: visitData.date,
          duration: visitData.duration,
          foremen: {
            connect: visitData.foremen_id.map((id: string) => ({ id })),
          },
        },
      }),
      prisma.feedback.update({
        where: { id: complaintId },
        data: {
          status: FeedbackStatus.VISITA_AGENDADA,
          ...(visitData.repairCost && { repairCost: visitData.repairCost }),
          ...(visitData.id_installer && {
            id_installer: visitData.id_installer,
          }),
        },
      }),
    ]);

    const visitDate = new Date(visitData.date);
    const formattedDate = visitDate.toLocaleString('pt-BR', {
      timeZone: 'America/Manaus',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    await sendComplaintUpdateEmail(
      ownerName,
      ownerEmail,
      statusFlag,
      complaintId,
      `Data: ${formattedDate}<br>Duração: ${visitData.duration} minutos.`,
    );

    return 'Visita agendada com sucesso.';
  } else if (data.statusFlag === 'AGUARDANDO_FEEDBACK') {
    await prisma.$transaction([
      prisma.visit.update({
        where: { feedback_id: complaintId },
        data: {
          confirmed: data.data.confirm_visit,
        },
      }),
      prisma.feedback.update({
        where: { id: complaintId },
        data: { status: FeedbackStatus.AGUARDANDO_FEEDBACK },
      }),
    ]);

    await sendComplaintUpdateEmail(
      ownerName,
      ownerEmail,
      statusFlag,
      complaintId,
      'A visita foi confirmada. Por favor, envie seu feedback.',
    );
    return 'Visita confirmada. Aguardando feedback do usuário';
  } else if (data.statusFlag === 'FECHADO') {
    const closedData = data.data;
    await prisma.feedback.update({
      where: {
        id: complaintId,
      },
      data: {
        status: FeedbackStatus.FECHADO,
        user_like: closedData.liked,
        user_comment: closedData.comment ?? null,
        completedAt: new Date(),
      },
    });

    await sendComplaintUpdateEmail(
      ownerName,
      ownerEmail,
      statusFlag,
      complaintId,
      closedData.comment || 'Agradecemos seu feedback.',
    );

    return 'Reclamação fechada.';
  } else {
    throw new Error('Flag de status inválida.');
  }
}

export async function getMonthlyComplaintsByDevelopment(
  developmentId: string,
  start_date: Date,
  end_date: Date,
) {
  const complaints = await prisma.feedback.findMany({
    where: {
      user: {
        unit: {
          torre: {
            development: {
              id: developmentId,
            },
          },
        },
      },
      created_at: {
        gte: start_date,
        lte: end_date,
      },
    },
    select: {
      created_at: true,
    },
  });

  const counts = complaints.reduce<Record<string, number>>((acc, complaint) => {
    const key = format(complaint.created_at, 'yyyy-MM');
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const result = Object.entries(counts)
    .map(([month, complaints]) => ({
      month,
      complaints,
    }))
    .sort((a, b) => (a.month > b.month ? 1 : -1));

  return result;
}

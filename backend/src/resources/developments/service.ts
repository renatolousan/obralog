import { DevelopmentDto } from '../../types/types';
import { createBuildings } from '../buildings/service';
import prisma from '../prisma/client';

export async function getAllDevelopments() {
  const developments = await prisma.development.findMany({
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

  return developments.map((development) => ({
    id: development.id,
    nome: development.name,
    descricao: development.description,
    endereco: development.address,
  }));
}

export async function developmentAlreadyExists(
  development: DevelopmentDto,
): Promise<boolean> {
  return !!(await prisma.development.findFirst({
    where: {
      OR: [{ name: development.name }, { address: development.address }],
    },
  }));
}

export async function createNewDevelopment(
  userId: string,
  data: DevelopmentDto,
) {
  if (await developmentAlreadyExists(data)) {
    throw new Error(
      'Já existe um empreendimento com este nome ou endereço cadastrado.',
    );
  } else {
    const { name, address, description, ...rest } = data;

    await prisma.$transaction(async (tx) => {
      const createdDev = await tx.development.create({
        data: { name, address, description, userId },
      });
      await createBuildings(tx, createdDev.id, data.buildings);

      return createdDev;
    });
  }
}

export async function getDevelopmentByUser(userId: string) {
  const developments = await prisma.development.findMany({
    where: {
      userId,
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

  return developments.map((development) => ({
    id: development.id,
    nome: development.name,
    descricao: development.description,
    endereco: development.address,
  }));
}

export async function getDevelopmentsComplaintsReport(userId: string) {
  const userDevelopments = await prisma.development.findMany({
    where: { userId },
    include: {
      buildings: {
        include: {
          units: {
            include: {
              items: {
                include: { feedbacks: true },
              },
            },
          },
        },
      },
    },
  });

  const report = userDevelopments.map((development) => {
    // Junta todos os feedbacks da obra (de todos os níveis)
    const allFeedbacks = development.buildings.flatMap((building) =>
      building.units.flatMap((unit) =>
        unit.items.flatMap((item) => item.feedbacks),
      ),
    );

    const total = allFeedbacks.length;
    const abertos = allFeedbacks.filter((f) => f.status === 'ABERTO').length;
    const fechados = allFeedbacks.filter((f) => f.status === 'FECHADO').length;

    const totalCost = allFeedbacks.reduce(
      (sum, f) => sum + (Number(f.repairCost) || 0),
      0,
    );
    const avgCost = total > 0 ? totalCost / total : 0;

    return {
      obra: development.name,
      total,
      abertos,
      fechados,
      totalCost: totalCost.toFixed(2),
      avgCost: avgCost.toFixed(2),
    };
  });

  return report;
}

export async function getDevelopmentSummaryData(developmentId: string) {
  const development = await prisma.development.findUnique({
    where: { id: developmentId },
    include: {
      buildings: {
        include: {
          units: {
            include: {
              items: {
                include: {
                  feedbacks: {
                    include: {
                      installer: true,
                      scheduled_visit: true,
                    },
                  },
                  supplier: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!development) {
    throw new Error('Development not found');
  }

  // Contagem de reclamações e custos
  let totalComplaints = 0;
  let totalRepairCost = 0;
  let totalVisits = 0;

  development.buildings.forEach((building) => {
    building.units.forEach((unit) => {
      unit.items.forEach((item) => {
        item.feedbacks.forEach((fb) => {
          totalComplaints += 1;
          totalRepairCost += Number(fb.repairCost ?? 0);
          if (fb.scheduled_visit) totalVisits += 1;
        });
      });
    });
  });

  const structuredData = {
    obra: {
      id: development.id,
      nome: development.name,
      descricao: development.description,
      endereco: development.address,
    },
    estatisticas: {
      total_reclamacoes: totalComplaints,
      total_custo_reparo: totalRepairCost,
      total_visitas: totalVisits,
      torres: development.buildings.length,
    },
    torres: development.buildings.map((building) => ({
      nome: building.name,
      unidades: building.units.map((unit) => ({
        nome: unit.name,
        itens: unit.items.map((item) => ({
          nome: item.name,
          fornecedor: item.supplier.name,
          valor: item.value,
          lote: item.batch,
          reclamacoes: item.feedbacks.length,
        })),
      })),
    })),
  };

  return structuredData;
}

export async function updateRiskThreshold(
  developmentId: string,
  riskThreshold: number,
) {
  const development = await prisma.development.findUnique({
    where: { id: developmentId },
  });

  if (!development) {
    throw new Error('Empreendimento não encontrado');
  }

  return await prisma.development.update({
    where: { id: developmentId },
    data: { riskThreshold },
    select: {
      id: true,
      name: true,
      riskThreshold: true,
    },
  });
}

export async function calculateDevelopmentHealth(developmentId: string) {
  const development = await prisma.development.findUnique({
    where: { id: developmentId },
    include: {
      buildings: {
        include: {
          units: {
            include: {
              items: {
                include: {
                  feedbacks: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!development) {
    throw new Error('Empreendimento não encontrado');
  }

  let totalItems = 0;
  let itemsWithComplaints = 0;

  for (const building of development.buildings) {
    for (const unit of building.units) {
      totalItems += unit.items.length;

      for (const item of unit.items) {
        if (item.feedbacks.length > 0) {
          itemsWithComplaints++;
        }
      }
    }
  }

  const percentageWithComplaints =
    totalItems > 0 ? (itemsWithComplaints / totalItems) * 100 : 0;

  const threshold = Number(development.riskThreshold || 50);

  let healthStatus: 'ÓTIMO' | 'OK' | 'RUIM';
  let healthColor: 'green' | 'yellow' | 'red';

  if (percentageWithComplaints <= 30) {
    healthStatus = 'ÓTIMO';
    healthColor = 'green';
  } else if (percentageWithComplaints <= threshold) {
    healthStatus = 'OK';
    healthColor = 'yellow';
  } else {
    healthStatus = 'RUIM';
    healthColor = 'red';
  }

  return {
    developmentId,
    developmentName: development.name,
    riskThreshold: threshold,
    metrics: {
      totalItems,
      itemsWithComplaints,
      percentageWithComplaints: Number(percentageWithComplaints.toFixed(2)),
    },
    healthStatus: {
      status: healthStatus,
      color: healthColor,
    },
  };
}

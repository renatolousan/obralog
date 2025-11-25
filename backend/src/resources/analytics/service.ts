import prisma from '../prisma/client';
import {
  RecurrentBuildingsSummary,
  RecurrentInstallersSummary,
  RecurrentItemsSummary,
  RecurrentSuppliersSummary,
} from './types';

export async function getRecurrentSuppliers(
  developmentId: string,
): Promise<RecurrentSuppliersSummary> {
  const suppliers = await prisma.supplier.findMany({
    where: {
      supplied_items: {
        some: {
          unit: {
            torre: {
              id_development: developmentId,
            },
          },
          feedbacks: {
            some: {}, // tem pelo menos um feedback
          },
        },
      },
    },
    include: {
      supplied_items: {
        include: {
          feedbacks: true,
          unit: {
            include: { torre: true },
          },
        },
      },
    },
  });

  // resumo de feedbacks por fornecedor
  const summary = suppliers.map((supplier) => {
    const totalFeedbacks = supplier.supplied_items.reduce(
      (acc, item) => acc + item.feedbacks.length,
      0,
    );
    return {
      supplier: supplier.name,
      cnpj: supplier.cnpj,
      totalFeedbacks,
    };
  });

  const sorted = summary.sort((a, b) => b.totalFeedbacks - a.totalFeedbacks);

  return sorted;
}

export async function getRecurrentInstallers(
  developmentId: string,
): Promise<RecurrentInstallersSummary> {
  const installers = await prisma.installer.findMany({
    where: {
      installed_items: {
        some: {
          unit: {
            torre: {
              id_development: developmentId,
            },
          },
          feedbacks: {
            some: {},
          },
        },
      },
    },
    include: {
      installed_items: {
        include: {
          feedbacks: true,
          unit: {
            include: { torre: true },
          },
        },
      },
    },
  });

  const summary = installers.map((installer) => {
    const totalFeedbacks = installer.installed_items.reduce(
      (acc, item) => acc + item.feedbacks.length,
      0,
    );

    return {
      installer: installer.name,
      cpf: installer.cpf,
      totalFeedbacks,
    };
  });

  return summary.sort((a, b) => b.totalFeedbacks - a.totalFeedbacks);
}

export async function getRecurrentBuildings(
  developmentId: string,
): Promise<RecurrentBuildingsSummary> {
  const buildings = await prisma.building.findMany({
    where: {
      id_development: developmentId,
      units: {
        some: {
          items: {
            some: {
              feedbacks: {
                some: {},
              },
            },
          },
        },
      },
    },
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
  });

  const summary = buildings.map((building) => {
    const totalFeedbacks = building.units.reduce((accUnit, unit) => {
      const feedbacksInUnit = unit.items.reduce(
        (accItem, item) => accItem + item.feedbacks.length,
        0,
      );
      return accUnit + feedbacksInUnit;
    }, 0);

    return {
      building: building.name,
      id: building.id,
      totalFeedbacks,
    };
  });

  return summary.sort((a, b) => b.totalFeedbacks - a.totalFeedbacks);
}

export async function getRecurringItems(
  developmentId: string,
): Promise<RecurrentItemsSummary> {
  const items = await prisma.item.findMany({
    where: {
      unit: {
        torre: {
          id_development: developmentId,
        },
      },
      feedbacks: {
        some: {},
      },
    },
    include: {
      feedbacks: true,
      unit: {
        include: {
          torre: true,
        },
      },
      supplier: true,
    },
  });

  const summary = items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    supplier: item.supplier?.name ?? null,
    building: item.unit?.torre?.name ?? null,
    totalFeedbacks: item.feedbacks.length,
  }));

  // ordena por número de reclamações
  return summary.sort((a, b) => b.totalFeedbacks - a.totalFeedbacks);
}

// Dashboard Gerencial - dados de todas as reclamações (sem filtro por desenvolvimento)

export async function getTop5MostComplainedItems(): Promise<RecurrentItemsSummary> {
  const items = await prisma.item.findMany({
    where: {
      feedbacks: {
        some: {},
      },
    },
    include: {
      feedbacks: true,
      unit: {
        include: {
          torre: true,
        },
      },
      supplier: true,
    },
  });

  const summary = items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    supplier: item.supplier?.name ?? null,
    building: item.unit?.torre?.name ?? null,
    totalFeedbacks: item.feedbacks.length,
  }));

  // ordena por número de reclamações e retorna top 5
  return summary
    .sort((a, b) => b.totalFeedbacks - a.totalFeedbacks)
    .slice(0, 5);
}

export async function getTopSuppliersByOccurrences(): Promise<RecurrentSuppliersSummary> {
  const suppliers = await prisma.supplier.findMany({
    where: {
      supplied_items: {
        some: {
          feedbacks: {
            some: {},
          },
        },
      },
    },
    include: {
      supplied_items: {
        include: {
          feedbacks: true,
        },
      },
    },
  });

  const summary = suppliers.map((supplier) => {
    const totalFeedbacks = supplier.supplied_items.reduce(
      (acc, item) => acc + item.feedbacks.length,
      0,
    );
    return {
      supplier: supplier.name,
      cnpj: supplier.cnpj,
      totalFeedbacks,
    };
  });

  return summary.sort((a, b) => b.totalFeedbacks - a.totalFeedbacks);
}

export async function getTopInstallersByFailures(): Promise<RecurrentInstallersSummary> {
  // Conta apenas feedbacks dos itens que o instalador instalou
  // Isso indica a frequência de falhas nos itens instalados por cada instalador
  const installers = await prisma.installer.findMany({
    where: {
      installed_items: {
        some: {
          feedbacks: {
            some: {},
          },
        },
      },
    },
    include: {
      installed_items: {
        include: {
          feedbacks: true,
        },
      },
    },
  });

  const summary = installers.map((installer) => {
    const totalFeedbacks = installer.installed_items.reduce(
      (acc, item) => acc + item.feedbacks.length,
      0,
    );

    return {
      installer: installer.name,
      cpf: installer.cpf,
      totalFeedbacks,
    };
  });

  return summary.sort((a, b) => b.totalFeedbacks - a.totalFeedbacks);
}

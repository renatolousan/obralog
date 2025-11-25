// seed.ts
import path from 'node:path';
import dotenv from 'dotenv';
import {
  PrismaClient,
  type Installer,
  type Supplier,
  type Unit,
  type User,
  type Item,
  UserStatus,
  FeedbackStatus,
} from '@prisma/client';
import { faker } from '@faker-js/faker';
import { UserTypes } from '../src/types/types';
import bcrypt from 'bcryptjs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// --- 1. PARAMETRIZAÇÃO DE VOLUME E TEMPO ---

export const DEFAULT_USER_COUNT = 100; // Aumentei o default para gráficos melhores
const DEVELOPMENT_COUNT = 3;
const BUILDINGS_PER_DEVELOPMENT = 2;
const UNITS_PER_BUILDING = 4;
const SUPPLIER_COUNT = 5;
const INSTALLER_COUNT = 6;

// Parâmetros de simulação de tempo
const SIMULATION_MONTHS = 6; // <-- QUANTO TEMPO "PASSADO" QUEREMOS SIMULAR
const NOW = new Date();
const SIMULATION_START_DATE = new Date();
SIMULATION_START_DATE.setMonth(NOW.getMonth() - SIMULATION_MONTHS);

// Pesos para variação de categoria
const FEEDBACK_ISSUES = [
  { value: 'Instalação', weight: 40 },
  { value: 'Garantia', weight: 30 },
  { value: 'Qualidade', weight: 15 },
  { value: 'Suporte', weight: 10 },
  { value: 'Entrega', weight: 5 },
];

const FEEDBACK_STATUSES = [
  { value: 'FECHADO', weight: 80 },
  { value: 'EM_ANALISE', weight: 15 },
  { value: 'ABERTO', weight: 5 },
  { value: 'AGUARDANDO_FEEDBACK', weight: 5 },
  { value: 'VISITA_AGENDADA', weight: 5 },
];

function resolveCount(rawValue?: string) {
  if (!rawValue) return DEFAULT_USER_COUNT;
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    console.warn(
      `Invalid user count provided ("${rawValue}"). Falling back to ${DEFAULT_USER_COUNT}.`,
    );
    return DEFAULT_USER_COUNT;
  }
  return Math.floor(parsed);
}

async function resetDatabase(prisma: PrismaClient) {
  await prisma.$transaction([
    prisma.attachment.deleteMany(),
    prisma.feedback.deleteMany(),
    prisma.item.deleteMany(),
    prisma.unit.deleteMany(),
    prisma.building.deleteMany(),
    prisma.development.deleteMany(),
    prisma.user.deleteMany(),
    prisma.installer.deleteMany(),
    prisma.supplier.deleteMany(),
  ]);
}

async function seedSuppliers(
  prisma: PrismaClient,
  count = SUPPLIER_COUNT,
): Promise<Supplier[]> {
  const suppliers: Supplier[] = [];
  const cnpjs = new Set<string>();
  while (cnpjs.size < count) {
    cnpjs.add(faker.string.numeric({ length: 14 }));
  }
  for (const cnpj of cnpjs) {
    const supplier = await prisma.supplier.create({
      data: {
        cnpj,
        name: faker.company.name(),
      },
    });
    suppliers.push(supplier);
  }
  return suppliers;
}

async function seedInstallers(
  prisma: PrismaClient,
  count = INSTALLER_COUNT,
): Promise<Installer[]> {
  const installers: Installer[] = [];
  for (let index = 0; index < count; index += 1) {
    const installer = await prisma.installer.create({
      data: {
        name: faker.person.fullName(),
        phone: faker.helpers.replaceSymbols('+55 ## #####-####'),
        cpf: faker.helpers.replaceSymbols('###########'),
      },
    });
    installers.push(installer);
  }
  return installers;
}

async function seedDevelopments(
  prisma: PrismaClient,
  creatorId: string,
): Promise<Unit[]> {
  const units: Unit[] = [];
  let nextUnitNumber = 100;
  for (let devIndex = 0; devIndex < DEVELOPMENT_COUNT; devIndex += 1) {
    const development = await prisma.development.create({
      data: {
        name: `${faker.company.name()} ${faker.string.alpha({ length: 3, casing: 'upper' })}`,
        description: faker.lorem.sentences({ min: 2, max: 4 }),
        address: `${faker.location.streetAddress()}, ${faker.location.city()} - ${faker.location.state({ abbreviated: true })} #${devIndex + 1}`,
        userId: creatorId,
        buildings: {
          create: Array.from({ length: BUILDINGS_PER_DEVELOPMENT }).map(
            (_, buildingIndex) => ({
              name: `Edifício ${devIndex + 1}-${buildingIndex + 1}`,
              units: {
                create: Array.from({ length: UNITS_PER_BUILDING }).map(() => {
                  const unitNumber = (nextUnitNumber += 1);
                  return {
                    name: `Unidade ${unitNumber}`,
                    floor: faker.number.int({ min: 1, max: 20 }),
                    number: unitNumber,
                    // created_at usará @default(now()) do schema
                  };
                }),
              },
            }),
          ),
        },
      },
      include: {
        buildings: {
          include: {
            units: true,
          },
        },
      },
    });
    development.buildings.forEach((building) => {
      building.units.forEach((unit) => units.push(unit));
    });
  }
  return units;
}

function trimDescription(text: string, maxLength: number) {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 3)}...`;
}

export async function seedUserTypes(prisma: PrismaClient) {
  await prisma.userType.createMany({
    data: [
      { label: 'admin', id: UserTypes.admin },
      { label: 'client', id: UserTypes.client },
      { label: 'buildingManager', id: UserTypes.buildingManager },
    ],
    skipDuplicates: true,
  });
}

export async function seedUsers(
  prisma: PrismaClient,
  totalUsers = DEFAULT_USER_COUNT,
): Promise<User[]> {
  // *** MODIFICADA PARA SUPORTAR DATAS HISTÓRICAS ***
  console.log(
    `Gerando ${totalUsers} usuários com datas desde ${SIMULATION_START_DATE.toISOString()}...`,
  );

  const availableUnits = await prisma.unit.findMany({
    select: { id: true },
  });

  if (!availableUnits.length) {
    console.warn(
      'Nenhuma unidade encontrada. Crie unidades antes de popular usuários.',
    );
    return [];
  }

  const users: User[] = [];

  for (let index = 0; index < totalUsers; index += 1) {
    const unit = faker.helpers.arrayElement(availableUnits);
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });

    // --- Lógica de Tempo  ---
    // Cria o usuário em uma data aleatória dentro do período de simulação
    const createdAt = faker.date.between({
      from: SIMULATION_START_DATE,
      to: NOW,
    });

    // Faz a maioria dos usuários "antigos" estar Ativa
    const status =
      Math.random() > 0.1 ? UserStatus.ATIVO : UserStatus.AGUARDANDO_1_ACESSO;

    try {
      const user = await prisma.user.create({
        data: {
          name: `${firstName} ${lastName}`,
          email,
          phone: faker.helpers.replaceSymbols('+55 ## #####-####'),
          password: faker.internet.password({ length: 12 }),
          unitId: unit.id,
          userType: UserTypes.client,
          cpf: faker.string.numeric({ length: 11 }),
          status: status,
          created_at: createdAt,
        },
      });

      users.push(user);
    } catch (error) {
      console.error(`Falha ao criar usuário ${email}:`, error);
    }
  }

  return users;
}

async function seedItems(
  prisma: PrismaClient,
  units: Unit[],
  suppliers: Supplier[],
  installers: Installer[],
): Promise<Item[]> {
  const items: Item[] = [];
  if (!units.length) return items;

  for (const unit of units) {
    const itemCount = faker.number.int({ min: 1, max: 3 });
    for (let index = 0; index < itemCount; index += 1) {
      const supplier = faker.helpers.arrayElement(suppliers);
      const assignedInstallers = faker.helpers.arrayElements(installers, {
        min: 1,
        max: Math.min(3, installers.length),
      });

      const item = await prisma.item.create({
        data: {
          name: faker.commerce.productName(),
          description: trimDescription(
            faker.commerce.productDescription(),
            200,
          ),
          value: faker.number.float({ min: 50, max: 5000, fractionDigits: 2 }),
          batch: faker.string.alphanumeric({ length: 8, casing: 'upper' }),
          warranty: faker.number.int({ min: 6, max: 24 }), // 6 a 24 meses
          id_unit: unit.id,
          cnpj_supplier: supplier.cnpj,
          batch: faker.string.alphanumeric({ length: 25 }),
          value: faker.number.float({ min: 20, max: 350 }),
          installers: {
            connect: assignedInstallers.map((installer) => ({
              id: installer.id,
            })),
          },
        },
      });
      items.push(item);
    }
  }
  return items;
}

async function seedFeedbacks(prisma: PrismaClient) {
  console.log('Gerando feedbacks com lógica de picos e variação...');

  const itemsWithRelations = await prisma.item.findMany({
    include: {
      unit: {
        include: {
          users: true, // Puxa os usuários (com seu created_at)
        },
      },
    },
  });

  for (const item of itemsWithRelations) {
    if (!item.unit.users.length) continue;

    // 50% de chance de um item ter pelo menos um feedback
    if (Math.random() < 0.5) {
      continue;
    }

    const feedbackCount = faker.number.int({ min: 1, max: 2 });

    for (let index = 0; index < feedbackCount; index += 1) {
      const user = faker.helpers.arrayElement(item.unit.users);
      const userCreationDate = user.created_at;

      // --- Lógica de Picos ---
      let daysSinceCreation: number;
      const isEarlyComplaint = Math.random() < 0.3; // 30% de chance de reclamar cedo

      if (isEarlyComplaint) {
        // Reclamação "normal" nos primeiros 60 dias
        daysSinceCreation = faker.number.int({ min: 7, max: 60 });
      } else {
        // 70% de chance de reclamar "após o 2º mês" (o pico)
        daysSinceCreation = faker.number.int({ min: 61, max: 180 });
      }

      const feedbackDate = new Date(userCreationDate.getTime());
      feedbackDate.setDate(feedbackDate.getDate() + daysSinceCreation);

      // Não permite criar feedbacks no futuro (caso a simulação seja recente)
      if (feedbackDate > NOW) {
        continue; // Simplesmente pula este feedback
      }

      // --- Lógica de Variação por Categoria ---
      const issue = faker.helpers.weightedArrayElement(FEEDBACK_ISSUES);
      const status = faker.helpers.weightedArrayElement(FEEDBACK_STATUSES);

      await prisma.feedback.create({
        data: {
          issue: issue,
          description: trimDescription(faker.lorem.paragraph(), 1000),
          id_user: user.id,
          id_item: item.id,
          created_at: feedbackDate,
          status: status as FeedbackStatus,
          repairCost: faker.number.float({ min: 20, max: 350 }),
        },
      });
    }
  }
}

async function seedManager(prisma: PrismaClient): Promise<string> {
  return (
    await prisma.user.create({
      data: {
        cpf: '05122255511',
        email: 'building.manager@example.com',
        password: bcrypt.hashSync('123456', 10),
        name: 'Coordenador de Obras',
        phone: '+55 92 99999-9999',
        userTypeId: { connect: { id: UserTypes.buildingManager } },
        status: UserStatus.ATIVO,
        unit: undefined,
      },
    })
  ).id;
}

async function addDevUsers(prisma: PrismaClient) {
  await prisma.user.create({
    data: {
      cpf: '12345678910',
      email: 'client@example.com',
      password: bcrypt.hashSync('123456', 10),
      name: 'Morador da Unidade',
      phone: '+55 92 99999-9999',
      userTypeId: {
        connect: { id: UserTypes.client },
      },
      status: UserStatus.ATIVO,
      unit: {
        connect: {
          id: (await prisma.unit.findFirst())!.id,
        },
      },
    },
  });
  await prisma.user.create({
    data: {
      cpf: '03216549878',
      email: 'admin@example.com',
      password: bcrypt.hashSync('123456', 10),
      name: 'Admin',
      phone: '+55 92 99999-9999',
      userTypeId: {
        connect: { id: UserTypes.admin },
      },
      status: UserStatus.ATIVO,
      unit: undefined,
    },
  });
}

export async function runSeed(cliArg?: string) {
  const prisma = new PrismaClient();
  const totalUsers = resolveCount(cliArg ?? process.env.SEED_USER_COUNT);

  console.log('Iniciando o script de seed...');

  try {
    console.log('Resetando o banco de dados...');
    await resetDatabase(prisma);

    console.log('Populando tipos de usuário...');
    await seedUserTypes(prisma);

    console.log('Populando fornecedores e instaladores...');
    const [suppliers, installers] = await Promise.all([
      seedSuppliers(prisma),
      seedInstallers(prisma),
    ]);

    console.log('Adicionando conta utilizável de coordenador de obras');
    const managerId = await seedManager(prisma);

    console.log(
      'Populando empreendimentos, prédios e unidades como propriedade do coordenador...',
    );
    const units = await seedDevelopments(prisma, managerId);

    console.log('Adicionando contas utilizáveis de admin e cliente...');
    await addDevUsers(prisma);

    console.log('Populando usuários (com histórico)...');
    await seedUsers(prisma, totalUsers); // Passa o totalUsers

    console.log('Populando itens...');
    await seedItems(prisma, units, suppliers, installers);

    console.log('Populando feedbacks (com histórico e picos)...');
    await seedFeedbacks(prisma);

    console.log('---------------------------------');
    console.log('Database populado com sucesso!');
    console.log(`Período de simulação: ${SIMULATION_MONTHS} meses.`);
    console.log(`Total de usuários: ${totalUsers}.`);
    console.log('---------------------------------');
  } finally {
    await prisma.$disconnect();
  }
}

export async function main(cliArg?: string) {
  try {
    await runSeed(cliArg);
  } catch (error) {
    console.error('Erro ao executar o Prisma seed:', error);
    process.exitCode = 1;
  }
}

if (process.argv[1]?.includes('seed.ts')) {
  void main(process.argv[2]);
}

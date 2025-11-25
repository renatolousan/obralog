import {
  UserCSVRegisterDto,
  UserTypes,
  type UserRegisterDto,
} from '../../types/types';
import bcrypt from 'bcryptjs';
import prisma from '../prisma/client';
import { randomBytes } from 'node:crypto';
import { sendFirstAccessEmail } from '../../utils/mailer';
import { Unit, User, UserStatus } from '@prisma/client';
import { getUnitById } from '../units/service';

const PASSWORD_MIN_LENGTH = 8;
const LETTER_REGEX = /[A-Za-z]/;
const NUMBER_REGEX = /\d/;

function ensurePasswordRequirements(password: string) {
  if (
    password.length < PASSWORD_MIN_LENGTH ||
    !LETTER_REGEX.test(password) ||
    !NUMBER_REGEX.test(password)
  ) {
    throw new Error(
      'A nova senha deve ter pelo menos 8 caracteres e conter letras e números.',
    );
  }
}

export function generateRandomPassword() {
  return randomBytes(3).toString('hex');
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return null;
  }

  console.log('=== Login Debug ===');
  console.log('User from DB:', {
    id: user.id,
    email: user.email,
    userType: user.userType,
  });
  console.log('===================');

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    userTypeId: user.userType,
    status: user.status,
  };
}

export async function changePassword(
  userEmail: string,
  oldPassword: string,
  newPassword: string,
): Promise<string> {
  const user = await prisma.user.findFirst({ where: { email: userEmail } });

  if (!user) throw new Error('Usuário não encontrado');

  if (!(await bcrypt.compare(oldPassword, user.password))) {
    throw new Error('Senha antiga incorreta.');
  }

  ensurePasswordRequirements(newPassword);

  if (await bcrypt.compare(newPassword, user.password)) {
    throw new Error('A nova senha deve ser diferente da senha atual.');
  }

  const updated = await prisma.user.update({
    where: { email: userEmail },
    data: {
      password: await bcrypt.hash(newPassword, 10),
      status: UserStatus.ATIVO,
    },
  });
  return updated.userType ?? '';
}

export async function completeFirstAccessChangePassword(
  userEmail: string,
  newPassword: string,
): Promise<void> {
  const user = await prisma.user.findFirst({ where: { email: userEmail } });

  if (!user) throw new Error('Usuário não encontrado');

  if (user.status !== 'AGUARDANDO_1_ACESSO') {
    throw new Error(
      'A redefinição de senha de primeiro acesso não está disponível para este usuário.',
    );
  }

  ensurePasswordRequirements(newPassword);

  if (await bcrypt.compare(newPassword, user.password)) {
    throw new Error('A nova senha deve ser diferente da senha temporária.');
  }

  await prisma.user.update({
    where: { email: userEmail },
    data: {
      password: await bcrypt.hash(newPassword, 10),
      status: UserStatus.ATIVO,
    },
  });
}

export async function createNewUser(data: UserRegisterDto) {
  const password = generateRandomPassword();
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
      status: UserStatus.AGUARDANDO_1_ACESSO,
    },
  });
  if (newUser) {
    sendFirstAccessEmail(newUser.name, newUser.email, password);
    return true;
  } else {
    throw new Error('Erro ao criar usuário');
  }
}

async function getUnit(
  number: number,
  floor: number,
  building_name: string,
): Promise<Unit | null> {
  return await prisma.unit.findFirst({
    where: {
      number,
      floor,
      torre: {
        name: building_name,
      },
    },
  });
}

async function createUserFromCSVData(
  data: UserCSVRegisterDto & { unitId: string },
) {
  const password = generateRandomPassword();
  const hashedPassword = await bcrypt.hash(password, 10);

  // Remove campos que não são do modelo User
  const { unit_number, floor, building_name, ...userData } = data;

  const newUser = await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
      userType: UserTypes.client,
      status: 'AGUARDANDO_1_ACESSO',
    },
  });
  if (newUser) {
    sendFirstAccessEmail(newUser.name, newUser.email, password);
    return true;
  } else {
    throw new Error('Erro ao criar usuário');
  }
}

export async function massRegisterUsers(rows: UserCSVRegisterDto[]) {
  const errors: { row: number; error: string }[] = [];
  let successCount = 0;

  let rowCount = 0;

  for (const row of rows) {
    rowCount++;
    // O csv-parser retorna todos os valores como strings, precisamos converter
    const unit_number = Number(row.unit_number);
    const floor = Number(row.floor);
    const building_name = String(row.building_name || '').trim();

    // Validação básica
    if (!row.name || !row.cpf || !row.email || !row.phone) {
      errors.push({
        row: rowCount,
        error: 'Campos obrigatórios faltando (name, cpf, email, phone)',
      });
      continue;
    }

    if (isNaN(unit_number) || isNaN(floor) || !building_name) {
      errors.push({
        row: rowCount,
        error: `Dados de unidade inválidos: unit_number=${row.unit_number}, floor=${row.floor}, building_name=${building_name}`,
      });
      continue;
    }

    const user: UserCSVRegisterDto = {
      name: String(row.name || '').trim(),
      cpf: String(row.cpf || '').trim(),
      email: String(row.email || '').trim(),
      phone: String(row.phone || '').trim(),
      unit_number,
      floor,
      building_name,
    };

    try {
      const unit = await getUnit(unit_number, floor, building_name);
      if (!unit) {
        errors.push({
          row: rowCount,
          error: `Unidade de número ${unit_number}, andar ${floor} ou ${building_name} não existe`,
        });
        continue;
      }

      // Validação de duplicados dentro do próprio CSV
      if (await userAlreadyExists(user.email, user.cpf)) {
        errors.push({
          row: rowCount,
          error: `Usuário com email/CPF já cadastrado`,
        });
        continue;
      }

      // Adiciona o unitId ao objeto user antes de criar
      const userWithUnitId = {
        ...user,
        unitId: unit.id,
      };

      const registered = await createUserFromCSVData(userWithUnitId);

      if (!registered) {
        errors.push({ row: rowCount, error: 'Erro ao criar usuário' });
      } else {
        successCount++;
      }
    } catch (err) {
      errors.push({
        row: rowCount,
        error: err instanceof Error ? err.message : 'Erro inesperado',
      });
    }
  }

  return {
    message: 'Arquivo processado com sucesso',
    totalRows: rowCount,
    successCount,
    errors,
  };
}

export async function userAlreadyExists(email: string, cpf: string) {
  return !!(await prisma.user.findFirst({
    where: { OR: [{ email }, { cpf }] },
  }));
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return await prisma.user.findFirst({ where: { email } });
}

export async function getUserByCpf(cpf: string): Promise<User | null> {
  return await prisma.user.findFirst({ where: { cpf } });
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      unit: {
        include: {
          items: {
            select: {
              id: true,
              name: true,
              description: true,
            },
            orderBy: {
              name: 'asc',
            },
          },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    unitId: user.unitId,
    unit: user.unit
      ? {
          id: user.unit.id,
          nome: user.unit.name,
          numero: user.unit.number,
          andar: user.unit.floor,
          itens: user.unit.items.map((item) => ({
            id: item.id,
            nome: item.name,
            descricao: item.description,
          })),
        }
      : null,
  };
}

// Funções de administração
export async function getAllUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      cpf: true,
      phone: true,
      status: true,
      userType: true,
      unitId: true,
      created_at: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return users;
}

export async function updateUserType(
  userId: string,
  userTypeId: string,
): Promise<boolean> {
  // Verifica se o tipo de usuário existe
  const userTypeExists = await prisma.userType.findUnique({
    where: { id: userTypeId },
  });

  if (!userTypeExists) {
    return false;
  }

  // Verifica se o usuário existe
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userExists) {
    return false;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { userType: userTypeId },
  });

  return true;
}

export async function deleteUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return false;
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  return true;
}

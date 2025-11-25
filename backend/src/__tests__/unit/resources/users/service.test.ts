import {
  generateRandomPassword,
  login,
  changePassword,
  completeFirstAccessChangePassword,
  createNewUser,
  massRegisterUsers,
  userAlreadyExists,
  getUserByEmail,
  getUserByCpf,
  getCurrentUser,
  getAllUsers,
  updateUserType,
  deleteUser,
} from '../../../../resources/users/service';
import prisma from '../../../../resources/prisma/client';
import bcrypt from 'bcryptjs';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import {
  UserRegisterDto,
  UserCSVRegisterDto,
  UserTypes,
} from '../../../../types/types';
import { sendFirstAccessEmail } from '../../../../utils/mailer';
import { UserStatus } from '@prisma/client';

jest.mock('../../../../resources/prisma/client', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    unit: {
      findFirst: jest.fn(),
    },
    userType: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('../../../../utils/mailer', () => ({
  sendFirstAccessEmail: jest.fn(),
}));

jest.mock('../../../../resources/units/service', () => ({
  getUnitById: jest.fn(),
}));

describe('Users Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
  });

  describe('generateRandomPassword', () => {
    it('deve gerar uma senha aleatória', () => {
      const password1 = generateRandomPassword();
      const password2 = generateRandomPassword();

      expect(password1).toBeDefined();
      expect(typeof password1).toBe('string');
      expect(password1.length).toBeGreaterThan(0);

      // As senhas devem ser diferentes (probabilidade muito baixa de serem iguais)
      expect(password1).not.toBe(password2);
    });

    it('deve gerar senhas com tamanho fixo (6 caracteres hex)', () => {
      const password = generateRandomPassword();
      // randomBytes(3).toString('hex') gera 6 caracteres
      expect(password).toHaveLength(6);
      // Deve conter apenas caracteres hexadecimais
      expect(password).toMatch(/^[0-9a-f]+$/);
    });

    it('deve gerar senhas sempre diferentes', () => {
      const passwords = Array.from({ length: 10 }, () =>
        generateRandomPassword(),
      );
      const uniquePasswords = new Set(passwords);
      expect(uniquePasswords.size).toBe(10);
    });
  });

  describe('login', () => {
    it('deve fazer login com sucesso', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@test.com',
        password: 'hashedPassword',
        name: 'Usuário Teste',
        userType: 'type-id',
        status: UserStatus.ATIVO,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await login('user@test.com', 'password123');

      expect(result).toEqual({
        id: 'user-1',
        name: 'Usuário Teste',
        email: 'user@test.com',
        userTypeId: 'type-id',
        status: UserStatus.ATIVO,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );
    });

    it('deve retornar null quando usuário não encontrado', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const result = await login('inexistente@test.com', 'password123');

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('deve retornar null quando senha incorreta', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@test.com',
        password: 'hashedPassword',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const result = await login('user@test.com', 'senhaErrada');

      expect(result).toBeNull();
    });
  });

  describe('changePassword', () => {
    it('deve alterar senha com sucesso', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@test.com',
        password: 'hashedOldPassword',
        userType: 'type-id',
      };

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser as any);
      jest
        .mocked(bcrypt.compare)
        .mockResolvedValueOnce(true as never) // senha antiga correta
        .mockResolvedValueOnce(false as never); // nova senha diferente
      jest.mocked(bcrypt.hash).mockResolvedValue('hashedNewPassword' as never);
      jest
        .spyOn(prisma.user, 'update')
        .mockResolvedValue({ userType: 'type-id' } as any);

      const result = await changePassword(
        'user@test.com',
        'senhaAntiga123',
        'senhaNova123',
      );

      expect(result).toBe('type-id');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { email: 'user@test.com' },
        data: {
          password: 'hashedNewPassword',
          status: UserStatus.ATIVO,
        },
      });
    });

    it('deve lançar erro quando usuário não encontrado', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);

      await expect(
        changePassword('inexistente@test.com', 'senhaAntiga', 'senhaNova123'),
      ).rejects.toThrow('Usuário não encontrado');
    });

    it('deve lançar erro quando senha antiga incorreta', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@test.com',
        password: 'hashedPassword',
      };

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser as any);
      jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        changePassword('user@test.com', 'senhaErrada', 'senhaNova123'),
      ).rejects.toThrow('Senha antiga incorreta.');
    });

    it('deve lançar erro quando nova senha não atende requisitos (muito curta)', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@test.com',
        password: 'hashedPassword',
      };

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser as any);
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

      await expect(
        changePassword('user@test.com', 'senhaAntiga123', 'curta1'),
      ).rejects.toThrow(
        'A nova senha deve ter pelo menos 8 caracteres e conter letras e números.',
      );
    });

    it('deve lançar erro quando nova senha não contém letras', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@test.com',
        password: 'hashedPassword',
      };

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser as any);
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

      await expect(
        changePassword('user@test.com', 'senhaAntiga123', '12345678'),
      ).rejects.toThrow(
        'A nova senha deve ter pelo menos 8 caracteres e conter letras e números.',
      );
    });

    it('deve lançar erro quando nova senha não contém números', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@test.com',
        password: 'hashedPassword',
      };

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser as any);
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

      await expect(
        changePassword('user@test.com', 'senhaAntiga123', 'senhaNova'),
      ).rejects.toThrow(
        'A nova senha deve ter pelo menos 8 caracteres e conter letras e números.',
      );
    });

    it('deve lançar erro quando nova senha é igual à senha atual', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@test.com',
        password: 'hashedPassword',
      };

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser as any);
      jest
        .mocked(bcrypt.compare)
        .mockResolvedValueOnce(true as never) // senha antiga correta
        .mockResolvedValueOnce(true as never); // nova senha igual à atual

      await expect(
        changePassword('user@test.com', 'senhaAntiga123', 'senhaNova123'),
      ).rejects.toThrow('A nova senha deve ser diferente da senha atual.');
    });
  });

  describe('completeFirstAccessChangePassword', () => {
    it('deve completar primeiro acesso com sucesso', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@test.com',
        password: 'hashedTempPassword',
        status: UserStatus.AGUARDANDO_1_ACESSO,
      };

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser as any);
      jest.mocked(bcrypt.compare).mockResolvedValue(false as never);
      jest.mocked(bcrypt.hash).mockResolvedValue('hashedNewPassword' as never);
      jest.spyOn(prisma.user, 'update').mockResolvedValue({} as any);

      await completeFirstAccessChangePassword('user@test.com', 'senhaNova123');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { email: 'user@test.com' },
        data: {
          password: 'hashedNewPassword',
          status: UserStatus.ATIVO,
        },
      });
    });

    it('deve lançar erro quando usuário não encontrado', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);

      await expect(
        completeFirstAccessChangePassword(
          'inexistente@test.com',
          'senhaNova123',
        ),
      ).rejects.toThrow('Usuário não encontrado');
    });

    it('deve lançar erro quando status não é AGUARDANDO_1_ACESSO', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@test.com',
        status: UserStatus.ATIVO,
      };

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser as any);

      await expect(
        completeFirstAccessChangePassword('user@test.com', 'senhaNova123'),
      ).rejects.toThrow(
        'A redefinição de senha de primeiro acesso não está disponível para este usuário.',
      );
    });

    it('deve lançar erro quando nova senha é igual à senha temporária', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@test.com',
        password: 'hashedTempPassword',
        status: UserStatus.AGUARDANDO_1_ACESSO,
      };

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser as any);
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

      await expect(
        completeFirstAccessChangePassword('user@test.com', 'senhaNova123'),
      ).rejects.toThrow('A nova senha deve ser diferente da senha temporária.');
    });

    it('deve validar requisitos da senha', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@test.com',
        password: 'hashedTempPassword',
        status: UserStatus.AGUARDANDO_1_ACESSO,
      };

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser as any);

      await expect(
        completeFirstAccessChangePassword('user@test.com', 'curta1'),
      ).rejects.toThrow(
        'A nova senha deve ter pelo menos 8 caracteres e conter letras e números.',
      );
    });
  });

  describe('createNewUser', () => {
    it('deve criar usuário com sucesso', async () => {
      const userData: UserRegisterDto = {
        name: 'Usuário Novo',
        email: 'novo@test.com',
        phone: '1234567890',
        cpf: '12345678901',
        unitId: 'unit-id',
        userType: 'type-id',
      };

      const mockCreatedUser = {
        id: 'user-1',
        ...userData,
        password: 'hashedPassword',
        status: UserStatus.AGUARDANDO_1_ACESSO,
      };

      jest
        .spyOn(prisma.user, 'create')
        .mockResolvedValue(mockCreatedUser as any);
      jest.mocked(bcrypt.hash).mockResolvedValue('hashedPassword' as never);
      jest.mocked(sendFirstAccessEmail).mockResolvedValue(true);

      const result = await createNewUser(userData);

      expect(result).toBe(true);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...userData,
          password: 'hashedPassword',
          status: UserStatus.AGUARDANDO_1_ACESSO,
        }),
      });
      expect(sendFirstAccessEmail).toHaveBeenCalled();
    });

    it('deve lançar erro quando criação falha', async () => {
      const userData: UserRegisterDto = {
        name: 'Usuário Novo',
        email: 'novo@test.com',
        phone: '1234567890',
        cpf: '12345678901',
        unitId: 'unit-id',
        userType: 'type-id',
      };

      jest.spyOn(prisma.user, 'create').mockResolvedValue(null as any);
      jest.mocked(bcrypt.hash).mockResolvedValue('hashedPassword' as never);

      await expect(createNewUser(userData)).rejects.toThrow(
        'Erro ao criar usuário',
      );
    });
  });

  describe('userAlreadyExists', () => {
    it('deve retornar true quando usuário existe por email', async () => {
      jest
        .spyOn(prisma.user, 'findFirst')
        .mockResolvedValue({ id: 'user-1', email: 'user@test.com' } as any);

      const result = await userAlreadyExists('user@test.com', '12345678901');

      expect(result).toBe(true);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: 'user@test.com' }, { cpf: '12345678901' }],
        },
      });
    });

    it('deve retornar true quando usuário existe por CPF', async () => {
      jest
        .spyOn(prisma.user, 'findFirst')
        .mockResolvedValue({ id: 'user-1', cpf: '12345678901' } as any);

      const result = await userAlreadyExists('user@test.com', '12345678901');

      expect(result).toBe(true);
    });

    it('deve retornar false quando usuário não existe', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);

      const result = await userAlreadyExists('novo@test.com', '99999999999');

      expect(result).toBe(false);
    });
  });

  describe('getUserByEmail', () => {
    it('deve retornar usuário quando encontrado', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@test.com',
        name: 'Usuário Teste',
      };

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser as any);

      const result = await getUserByEmail('user@test.com');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'user@test.com' },
      });
    });

    it('deve retornar null quando usuário não encontrado', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);

      const result = await getUserByEmail('inexistente@test.com');

      expect(result).toBeNull();
    });
  });

  describe('getUserByCpf', () => {
    it('deve retornar usuário quando encontrado', async () => {
      const mockUser = {
        id: 'user-1',
        cpf: '12345678901',
        name: 'Usuário Teste',
      };

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser as any);

      const result = await getUserByCpf('12345678901');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { cpf: '12345678901' },
      });
    });

    it('deve retornar null quando usuário não encontrado', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);

      const result = await getUserByCpf('99999999999');

      expect(result).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('deve retornar usuário com unidade e itens formatados', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'Usuário Teste',
        email: 'user@test.com',
        unitId: 'unit-1',
        unit: {
          id: 'unit-1',
          name: 'Unidade 101',
          number: 101,
          floor: 1,
          items: [
            {
              id: 'item-1',
              name: 'Item A',
              description: 'Descrição do Item A',
            },
            {
              id: 'item-2',
              name: 'Item B',
              description: 'Descrição do Item B',
            },
          ],
        },
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      const result = await getCurrentUser('user-1');

      expect(result).toEqual({
        id: 'user-1',
        name: 'Usuário Teste',
        email: 'user@test.com',
        unitId: 'unit-1',
        unit: {
          id: 'unit-1',
          nome: 'Unidade 101',
          numero: 101,
          andar: 1,
          itens: [
            {
              id: 'item-1',
              nome: 'Item A',
              descricao: 'Descrição do Item A',
            },
            {
              id: 'item-2',
              nome: 'Item B',
              descricao: 'Descrição do Item B',
            },
          ],
        },
      });
    });

    it('deve retornar usuário sem unidade', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'Usuário Teste',
        email: 'user@test.com',
        unitId: null,
        unit: null,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      const result = await getCurrentUser('user-1');

      expect(result).toEqual({
        id: 'user-1',
        name: 'Usuário Teste',
        email: 'user@test.com',
        unitId: null,
        unit: null,
      });
    });

    it('deve retornar null quando usuário não encontrado', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const result = await getCurrentUser('user-inexistente');

      expect(result).toBeNull();
    });

    it('deve retornar unidade sem itens', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'Usuário Teste',
        email: 'user@test.com',
        unitId: 'unit-1',
        unit: {
          id: 'unit-1',
          name: 'Unidade 101',
          number: 101,
          floor: 1,
          items: [],
        },
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      const result = await getCurrentUser('user-1');

      expect(result?.unit?.itens).toEqual([]);
    });
  });

  describe('getAllUsers', () => {
    it('deve retornar lista de usuários formatada', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          name: 'Usuário A',
          email: 'a@test.com',
          cpf: '12345678901',
          phone: '1234567890',
          status: UserStatus.ATIVO,
          userType: 'type-id',
          unitId: 'unit-1',
          created_at: new Date('2024-01-01'),
        },
        {
          id: 'user-2',
          name: 'Usuário B',
          email: 'b@test.com',
          cpf: '98765432109',
          phone: '0987654321',
          status: UserStatus.ATIVO,
          userType: 'type-id',
          unitId: 'unit-2',
          created_at: new Date('2024-01-02'),
        },
      ];

      jest.spyOn(prisma.user, 'findMany').mockResolvedValue(mockUsers as any);

      const result = await getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
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
    });

    it('deve retornar array vazio quando não há usuários', async () => {
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue([] as any);

      const result = await getAllUsers();

      expect(result).toEqual([]);
    });
  });

  describe('updateUserType', () => {
    it('deve atualizar tipo de usuário com sucesso', async () => {
      jest
        .spyOn(prisma.userType, 'findUnique')
        .mockResolvedValue({ id: 'type-id', label: 'Admin' } as any);
      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue({ id: 'user-1' } as any);
      jest.spyOn(prisma.user, 'update').mockResolvedValue({} as any);

      const result = await updateUserType('user-1', 'type-id');

      expect(result).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { userType: 'type-id' },
      });
    });

    it('deve retornar false quando tipo de usuário não existe', async () => {
      jest.spyOn(prisma.userType, 'findUnique').mockResolvedValue(null);

      const result = await updateUserType('user-1', 'type-inexistente');

      expect(result).toBe(false);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('deve retornar false quando usuário não existe', async () => {
      jest
        .spyOn(prisma.userType, 'findUnique')
        .mockResolvedValue({ id: 'type-id' } as any);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const result = await updateUserType('user-inexistente', 'type-id');

      expect(result).toBe(false);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('deve deletar usuário com sucesso', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'Usuário Teste',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      jest.spyOn(prisma.user, 'delete').mockResolvedValue(mockUser as any);

      const result = await deleteUser('user-1');

      expect(result).toBe(true);
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('deve retornar false quando usuário não encontrado', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const result = await deleteUser('user-inexistente');

      expect(result).toBe(false);
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });
  });

  describe('massRegisterUsers', () => {
    const mockUnit = {
      id: 'unit-1',
      number: 101,
      floor: 1,
    };

    beforeEach(() => {
      jest.mocked(bcrypt.hash).mockResolvedValue('hashedPassword' as never);
      jest.mocked(sendFirstAccessEmail).mockResolvedValue(true);
      jest.spyOn(prisma.unit, 'findFirst').mockResolvedValue(mockUnit as any);
    });

    it('deve registrar múltiplos usuários com sucesso', async () => {
      const rows: UserCSVRegisterDto[] = [
        {
          name: 'Usuário A',
          cpf: '12345678901',
          email: 'a@test.com',
          phone: '1234567890',
          unit_number: 101,
          floor: 1,
          building_name: 'Torre A',
        },
        {
          name: 'Usuário B',
          cpf: '98765432109',
          email: 'b@test.com',
          phone: '0987654321',
          unit_number: 101,
          floor: 1,
          building_name: 'Torre A',
        },
      ];

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(prisma.user, 'create')
        .mockResolvedValue({ id: 'user-1' } as any);

      const result = await massRegisterUsers(rows);

      expect(result.successCount).toBe(2);
      expect(result.errors).toEqual([]);
      expect(result.totalRows).toBe(2);
      expect(prisma.user.create).toHaveBeenCalledTimes(2);
    });

    it('deve reportar erro quando campos obrigatórios faltam', async () => {
      const rows: UserCSVRegisterDto[] = [
        {
          name: '',
          cpf: '12345678901',
          email: 'a@test.com',
          phone: '1234567890',
          unit_number: 101,
          floor: 1,
          building_name: 'Torre A',
        },
      ];

      const result = await massRegisterUsers(rows);

      expect(result.successCount).toBe(0);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].error).toBe(
        'Campos obrigatórios faltando (name, cpf, email, phone)',
      );
    });

    it('deve reportar erro quando dados de unidade são inválidos', async () => {
      const rows: UserCSVRegisterDto[] = [
        {
          name: 'Usuário A',
          cpf: '12345678901',
          email: 'a@test.com',
          phone: '1234567890',
          unit_number: NaN,
          floor: 1,
          building_name: 'Torre A',
        },
      ];

      const result = await massRegisterUsers(rows);

      expect(result.successCount).toBe(0);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].error).toContain('Dados de unidade inválidos');
    });

    it('deve reportar erro quando unidade não existe', async () => {
      const rows: UserCSVRegisterDto[] = [
        {
          name: 'Usuário A',
          cpf: '12345678901',
          email: 'a@test.com',
          phone: '1234567890',
          unit_number: 999,
          floor: 99,
          building_name: 'Torre Inexistente',
        },
      ];

      jest.spyOn(prisma.unit, 'findFirst').mockResolvedValue(null);

      const result = await massRegisterUsers(rows);

      expect(result.successCount).toBe(0);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].error).toContain('não existe');
    });

    it('deve reportar erro quando usuário já existe', async () => {
      const rows: UserCSVRegisterDto[] = [
        {
          name: 'Usuário A',
          cpf: '12345678901',
          email: 'a@test.com',
          phone: '1234567890',
          unit_number: 101,
          floor: 1,
          building_name: 'Torre A',
        },
      ];

      jest
        .spyOn(prisma.user, 'findFirst')
        .mockResolvedValue({ id: 'user-1', email: 'a@test.com' } as any);

      const result = await massRegisterUsers(rows);

      expect(result.successCount).toBe(0);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].error).toBe(
        'Usuário com email/CPF já cadastrado',
      );
    });

    it('deve processar algumas linhas com sucesso e outras com erro', async () => {
      const rows: UserCSVRegisterDto[] = [
        {
          name: 'Usuário A',
          cpf: '12345678901',
          email: 'a@test.com',
          phone: '1234567890',
          unit_number: 101,
          floor: 1,
          building_name: 'Torre A',
        },
        {
          name: '',
          cpf: '98765432109',
          email: 'b@test.com',
          phone: '0987654321',
          unit_number: 101,
          floor: 1,
          building_name: 'Torre A',
        },
      ];

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(prisma.user, 'create')
        .mockResolvedValue({ id: 'user-1' } as any);

      const result = await massRegisterUsers(rows);

      expect(result.successCount).toBe(1);
      expect(result.errors.length).toBe(1);
      expect(result.totalRows).toBe(2);
    });

    it('deve lidar com array vazio', async () => {
      const result = await massRegisterUsers([]);

      expect(result.successCount).toBe(0);
      expect(result.errors).toEqual([]);
      expect(result.totalRows).toBe(0);
      expect(result.message).toBe('Arquivo processado com sucesso');
    });

    it('deve reportar erro quando criação falha', async () => {
      const rows: UserCSVRegisterDto[] = [
        {
          name: 'Usuário A',
          cpf: '12345678901',
          email: 'a@test.com',
          phone: '1234567890',
          unit_number: 101,
          floor: 1,
          building_name: 'Torre A',
        },
      ];

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(null as any);

      const result = await massRegisterUsers(rows);

      expect(result.successCount).toBe(0);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].error).toBe('Erro ao criar usuário');
    });
  });
});

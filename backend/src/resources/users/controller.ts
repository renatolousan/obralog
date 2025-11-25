import { type Request, type Response, type NextFunction } from 'express';
import * as service from './service';
import {
  UserCSVRegisterDto,
  UserLoginDto,
  UserRegisterDto,
  UserTypes,
} from '../../types/types';
import csv from 'csv-parser';
import stream from 'stream';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';

export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.body as UserRegisterDto;
    user.cpf = user.cpf.replace('.', '').replace('-', '');
    if (await service.userAlreadyExists(user.email, user.cpf)) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: 'Email ou CPF já cadastrados' });
    } else {
      const created = await service.createNewUser(user);
      if (created)
        res
          .status(StatusCodes.CREATED)
          .json({ message: 'Usuário criado com sucesso' });
    }
  } catch (error) {
    next(error);
  }
}

export async function massRegisterController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.file) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: 'Nenhum arquivo enviado.' });
  }

  try {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    const rows: UserCSVRegisterDto[] = [];

    bufferStream
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', async () => {
        const result = await service.massRegisterUsers(rows);
        return res.status(200).json(result);
      })
      .on('error', (err) => {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: 'Erro ao processar arquivo', details: err.message });
      });
  } catch (error) {
    next(error);
  }
}

export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res
        .status(StatusCodes.OK)
        .json({ message: 'Logout realizado com sucesso' });
    });
  } catch (error) {
    next(error);
  }
}

export async function changePasswordController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { newPassword, oldPassword } = req.body as {
      newPassword?: string;
      oldPassword?: string;
    };

    if (!req.session.email) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Usuário não autenticado.' });
    }

    if (!oldPassword || !newPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'As senhas antiga e nova são obrigatórias.',
      });
    }

    const userTypeId = await service.changePassword(
      req.session.email,
      oldPassword,
      newPassword,
    );

    res.status(StatusCodes.OK).json({
      message: 'Senha atualizada com sucesso.',
      redirect:
        userTypeId == UserTypes.client ? '/pages/home' : '/pages/development',
    });
  } catch (error) {
    if (error instanceof Error) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: error.message });
    }
    next(error);
  }
}

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password } = req.body as UserLoginDto;
    const user = await service.login(email, password);

    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Email ou senha incorretos' });
    }

    req.session.uid = user.id;
    req.session.userTypeId = user.userTypeId;
    req.session.email = user.email;

    if (user.status === 'AGUARDANDO_1_ACESSO') {
      return res.status(StatusCodes.OK).json({
        message: 'Primeiro acesso - defina sua senha',
        action: 'FIRST_ACCESS_REQUIRED',
        redirect: '/change-password',
        user: { id: user.id, email: user.email },
      });
    }

    return res.status(StatusCodes.OK).json({
      message: 'Usuário autenticado com sucesso',
      action: 'LOGIN_SUCCESS',
      redirect:
        user.userTypeId === UserTypes.client
          ? '/pages/home'
          : '/pages/development',
    });
  } catch (error) {
    next(error);
  }
}

export async function firstAccessChangePasswordController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { newPassword, confirmPassword } = req.body as {
      newPassword?: string;
      confirmPassword?: string;
    };

    if (!req.session?.email || !req.session?.uid) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Sessão inválida. Faça login novamente.' });
    }

    if (!newPassword) {
      return res
        .status(StatusCodes.UNPROCESSABLE_ENTITY)
        .json({ message: 'A nova senha é obrigatória.' });
    }

    if (confirmPassword !== undefined && confirmPassword !== newPassword) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        message: 'A confirmação de senha não confere.',
      });
    }

    await service.completeFirstAccessChangePassword(
      req.session.email,
      newPassword,
    );

    return res.status(StatusCodes.OK).json({
      message: 'Senha redefinida com sucesso.',
      action: 'PASSWORD_CHANGED',
      redirect: '/home',
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUserController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session.uid!;
    const user = await service.getCurrentUser(userId);

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: ReasonPhrases.NOT_FOUND });
    }

    return res.status(StatusCodes.OK).json({ data: user });
  } catch (error) {
    next(error);
  }
}

// Rotas de administração
export async function getAllUsersController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const users = await service.getAllUsers();
    return res.status(StatusCodes.OK).json({ data: users });
  } catch (error) {
    next(error);
  }
}

export async function updateUserTypeController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const { userTypeId } = req.body as { userTypeId?: string };

    if (!id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'ID do usuário é obrigatório' });
    }

    if (!userTypeId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'O campo userTypeId é obrigatório' });
    }

    const updated = await service.updateUserType(id, userTypeId);

    if (!updated) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Usuário ou tipo de usuário não encontrado' });
    }

    return res
      .status(StatusCodes.OK)
      .json({ message: 'Tipo de usuário atualizado com sucesso' });
  } catch (error) {
    next(error);
  }
}

export async function deleteUserController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'ID do usuário é obrigatório' });
    }

    // Previne que o admin delete a si mesmo
    if (req.session.uid === id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Você não pode deletar sua própria conta' });
    }

    const deleted = await service.deleteUser(id);

    if (!deleted) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Usuário não encontrado' });
    }

    return res
      .status(StatusCodes.OK)
      .json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    next(error);
  }
}

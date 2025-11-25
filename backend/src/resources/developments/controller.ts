import { type Request, type Response, type NextFunction } from 'express';
import * as service from './service';
import { StatusCodes } from 'http-status-codes';
import { DevelopmentDto } from '../../types/types';

export async function getAllDevelopmentsController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const developments = await service.getAllDevelopments();

    res.status(StatusCodes.OK).json({
      total: developments.length,
      data: developments,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDevelopmentsByManagerController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const managerId = req.session.uid as string;
    const developments = await service.getDevelopmentByUser(managerId);
    res.status(StatusCodes.OK).json({
      total: developments.length,
      data: developments,
    });
  } catch (error) {
    next(error);
  }
}

export async function createDevelopmentController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session.uid as string;
    const development = req.body as DevelopmentDto;

    const createdDev = await service.createNewDevelopment(userId, development);

    return res.status(StatusCodes.CREATED).json({ development: createdDev });
  } catch (error) {
    next(error);
  }
}

export async function updateRiskThresholdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const { riskThreshold } = req.body;

    if (!id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'O ID do empreendimento é obrigatório',
      });
    }

    if (
      typeof riskThreshold !== 'number' ||
      riskThreshold < 0 ||
      riskThreshold > 100
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'O limiar de risco deve ser um número entre 0 e 100',
      });
    }

    const updated = await service.updateRiskThreshold(id, riskThreshold);

    return res.status(StatusCodes.OK).json({
      message: 'Limiar de risco atualizado com sucesso',
      development: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDevelopmentHealthController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'O ID do empreendimento é obrigatório',
      });
    }

    const health = await service.calculateDevelopmentHealth(id);

    return res.status(StatusCodes.OK).json(health);
  } catch (error) {
    next(error);
  }
}

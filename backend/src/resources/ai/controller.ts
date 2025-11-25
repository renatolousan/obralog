import { type Request, type Response, type NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  suggestComplaintAction,
  suggestIndicatorAction,
  analyzeDevelopmentRisk,
} from './service';
import { anyIndicator } from '../analytics/types';

export const suggestComplaintActionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { complaintText } = req.body as { complaintText?: unknown };

    if (
      typeof complaintText !== 'string' ||
      complaintText.trim().length === 0
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message:
          'O campo complaintText é obrigatório e deve ser uma string não vazia.',
      });
    }

    const suggestion = await suggestComplaintAction(complaintText);

    return res.status(StatusCodes.OK).json(suggestion);
  } catch (error) {
    return next(error);
  }
};

export const suggestIndicatorActionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const indicatorData = req.body as anyIndicator;

    const suggestion = await suggestIndicatorAction(indicatorData);

    return res.status(StatusCodes.OK).json(suggestion);
  } catch (error) {
    return next(error);
  }
};
export const analyzeDevelopmentRiskController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'O ID do empreendimento é obrigatório.',
      });
    }

    const analysis = await analyzeDevelopmentRisk(id);

    return res.status(StatusCodes.OK).json(analysis);
  } catch (error) {
    return next(error);
  }
};

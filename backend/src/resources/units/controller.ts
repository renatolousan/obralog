import { type Request, type Response, type NextFunction } from 'express';
import * as service from './service';
import { orderKeyType } from '../../types/types';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export async function getUnitsByBuildingController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const units = await service.getUnitsByBuilding(id);

    res.status(StatusCodes.OK).json({
      total: units.length,
      data: units,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUnitContextController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const context = await service.getUnitContext(id);

    if (!context) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: ReasonPhrases.NOT_FOUND });
    }

    res.status(StatusCodes.OK).json({
      data: context,
    });
  } catch (error) {
    next(error);
  }
}

export async function getFeedbacksPerUnitController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const order = req.query.order as orderKeyType;
    const unit = await service.getUnitById(id);

    if (unit) {
      const feedbacks = await service.getComplaintsPerUnit(id, order);
      const feedbacksWithStringifiedBigInt = feedbacks.map((feedback) => {
        return JSON.parse(
          JSON.stringify(feedback, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value,
          ),
        );
      });

      res.status(StatusCodes.OK).json({
        unit,
        feedbacks: feedbacksWithStringifiedBigInt,
      });
    } else {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: ReasonPhrases.NOT_FOUND });
    }
  } catch (error) {
    next(error);
  }
}

export async function createNewUnitController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { buildingId, unit } = req.body;
    const created = await service.createNewUnit(buildingId, unit);
    res.status(StatusCodes.CREATED).json(created);
  } catch (error) {
    next(error);
  }
}

import { type Request, type Response, type NextFunction } from 'express';
import * as service from './service';
import { StatusCodes } from 'http-status-codes';

export async function getBuildingsByDevelopmentController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const buildings = await service.getBuildingsByDevelopment(id);
    res.status(StatusCodes.OK).json({
      total: buildings.length,
      data: buildings,
    });
  } catch (error) {
    next(error);
  }
}

export async function getBuildingByIdController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const building = service.getBuildingById(id);
    res.status(StatusCodes.OK).json({ data: building });
  } catch (error) {
    next(error);
  }
}

export async function createNewBuilding(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id_development, building } = req.body;
    const created = await service.createNewBuilding(id_development, building);

    return res.status(StatusCodes.CREATED).json({
      message: 'Building created successfully',
      data: created,
    });
  } catch (error) {
    next(error);
  }
}

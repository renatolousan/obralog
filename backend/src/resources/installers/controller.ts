import { type Request, type Response, type NextFunction } from 'express';
import * as service from './service';
import { StatusCodes } from 'http-status-codes';
import { InstallerDto } from '../../types/types';

export async function getAllInstallersController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const installers = await service.getAllInstallers();

    res.status(StatusCodes.OK).json({
      total: installers.length,
      data: installers,
    });
  } catch (error) {
    next(error);
  }
}

export async function createInstallerController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const installer = req.body as InstallerDto;
    const created = await service.createNewInstaller(installer);
    res.status(StatusCodes.CREATED).json({ installer: created });
  } catch (error) {
    next(error);
  }
}

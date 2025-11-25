import { Request, Response, NextFunction } from 'express';
import { UserTypes } from '../types/types';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export async function isBuildingManager(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.session.uid && req.session.userTypeId === UserTypes.buildingManager) {
    next();
  } else {
    res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: ReasonPhrases.FORBIDDEN });
  }
}

export default isBuildingManager;

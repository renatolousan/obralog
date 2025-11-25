import { type Request, type Response, type NextFunction } from 'express';
import * as service from './service';
import { suggestIndicatorAction } from '../ai/service';
import { StatusCodes } from 'http-status-codes';

export async function getRecurrentSuppliersController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { developmentId } = req.body;
    const data = await service.getRecurrentSuppliers(developmentId);
    const aiSuggestion = await suggestIndicatorAction(data);
    res.status(StatusCodes.OK).json({ data, aiSuggestion });
  } catch (error) {
    next(error);
  }
}

export async function getRecurrentInstallersController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { developmentId } = req.body;
    const data = await service.getRecurrentInstallers(developmentId);
    const aiSuggestion = await suggestIndicatorAction(data);
    res.status(StatusCodes.OK).json({ data, aiSuggestion });
  } catch (error) {
    next(error);
  }
}

export async function getRecurrentBuildingsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { developmentId } = req.body;
    const data = await service.getRecurrentBuildings(developmentId);
    const aiSuggestion = await suggestIndicatorAction(data);
    res.status(StatusCodes.OK).json({ data, aiSuggestion });
  } catch (error) {
    next(error);
  }
}

export async function getRecurringItemsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { developmentId } = req.body;
    const data = await service.getRecurringItems(developmentId);
    const aiSuggestion = await suggestIndicatorAction(data);
    res.status(StatusCodes.OK).json({ data, aiSuggestion });
  } catch (error) {
    next(error);
  }
}

// Dashboard Gerencial - controllers

export async function getTop5MostComplainedItemsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await service.getTop5MostComplainedItems();
    res.status(StatusCodes.OK).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function getTopSuppliersByOccurrencesController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await service.getTopSuppliersByOccurrences();
    res.status(StatusCodes.OK).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function getTopInstallersByFailuresController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await service.getTopInstallersByFailures();
    res.status(StatusCodes.OK).json({ data });
  } catch (error) {
    next(error);
  }
}

import { type Request, type Response, type NextFunction } from 'express';
import * as service from './service';
import { StatusCodes } from 'http-status-codes';
import { Supplier } from '@prisma/client';
import csv from 'csv-parser';
import stream from 'stream';

export async function getAllSuppliersController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const suppliers = await service.getAllSuppliers();

    res.status(StatusCodes.OK).json({
      total: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    next(error);
  }
}

export async function createNewSupplierController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const supplier = req.body as Supplier;
    const created = await service.createNewSupplier(supplier);
    res.status(StatusCodes.OK).json({ supplier: created });
  } catch (error) {
    next(error);
  }
}

export async function bulkRegistrationController(
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
    bufferStream.end(req.file!.buffer);

    const rows: Supplier[] = [];

    bufferStream
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', async () => {
        const result = await service.bulkSupplierRegistration(rows);
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

import { type Request, type Response, type NextFunction } from 'express';
import stream from 'stream';
import csv from 'csv-parser';
import { StatusCodes } from 'http-status-codes';
import * as service from './service';
import { ItemCSVRegisterDto, ItemDto } from '../../types/types';
import { upload, validateCSV } from '../../middlewares/uploadTable';

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

    const rows: ItemCSVRegisterDto[] = [];

    bufferStream
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', async () => {
        const result = await service.massRegisterItems(rows);
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

export async function registerItemController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const {
      unitId,
      name,
      description,
      value,
      batch,
      warranty,
      supplier,
      installers,
    } = req.body;

    if (
      !unitId ||
      !name ||
      !supplier ||
      !installers ||
      installers.length === 0
    ) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Campos obrigatórios faltando' });
    }

    const itemData: ItemDto = {
      name,
      description: description || '',
      value: value ? parseFloat(value) : null,
      batch: batch || null,
      warranty: warranty ? parseInt(warranty, 10) : null,
      cnpj_supplier: supplier.cnpj,
      supplier: {
        cnpj: supplier.cnpj,
        name: supplier.name,
      },
      installers: installers.map(
        (inst: { cpf: string; name: string; phone: string }) => ({
          cpf: inst.cpf,
          name: inst.name,
          phone: inst.phone || '',
        }),
      ),
    };

    const created = await service.createNewItem(unitId, itemData);
    if (created) {
      return res
        .status(StatusCodes.CREATED)
        .json({ message: 'Item criado com sucesso', data: created });
    } else {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Erro ao criar item' });
    }
  } catch (error) {
    next(error);
  }
}

export { upload, validateCSV };

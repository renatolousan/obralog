import { Request, Response, NextFunction } from 'express';
import csv from 'csv-parser';
import stream from 'stream';
import multer from 'multer';
import { StatusCodes } from 'http-status-codes';

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export async function validateCSV(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.file) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: 'Nenhum arquivo enviado.' });
  }

  const allowedExtensions = ['.csv'];
  const fileExtension = req.file.originalname
    .slice(req.file.originalname.lastIndexOf('.'))
    .toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: `Extensões permitidas: ${allowedExtensions.join(', ')}.`,
    });
  }

  // Validação do mimetype é opcional - a validação da extensão já garante que é CSV
  // Alguns sistemas não definem o mimetype corretamente, então confiamos na extensão

  try {
    let rowCount = 0;
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    await new Promise<void>((resolve, reject) => {
      const csvStream = bufferStream
        .pipe(csv())
        .on('data', () => {
          rowCount++;
          if (rowCount > 20000) {
            csvStream.destroy();
            reject(
              new Error(`Arquivo com mais de 20.000 linhas não permitido.`),
            );
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    next();
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: err.message });
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Erro desconhecido.' });
  }
}

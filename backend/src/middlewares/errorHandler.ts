import { type Request, type Response, type NextFunction } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { MulterError } from 'multer';

export const multerErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res
        .status(400)
        .json({ message: 'Arquivo excede o tamanho maximo permitido.' });
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res
        .status(400)
        .json({ message: 'Somente arquivos de imagem são permitidos.' });
    }
    return res.status(StatusCodes.BAD_REQUEST).json({ message: err.message });
  }
  next(err as Error);
};

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({ message: ReasonPhrases.NOT_FOUND });
};

export const globalErrorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error('Erro nao tratado na API:', error);
  res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
};

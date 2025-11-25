import {
  multerErrorHandler,
  notFoundHandler,
  globalErrorHandler,
} from '../../../middlewares/errorHandler';
import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';
import { StatusCodes } from 'http-status-codes';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';

describe('Middleware - errorHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response> & { status: jest.Mock; json: jest.Mock };
  let mockNext: NextFunction;
  beforeEach(() => {
    mockRequest = {} as Request;
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Partial<Response> & { status: jest.Mock; json: jest.Mock };
    mockNext = jest.fn() as unknown as NextFunction;
    console.error = jest.fn() as unknown as typeof console.error;
  });

  describe('multerErrorHandler', () => {
    it('deve retornar erro 400 para LIMIT_FILE_SIZE', () => {
      const error = new MulterError('LIMIT_FILE_SIZE', 'field');
      multerErrorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Arquivo excede o tamanho maximo permitido.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve retornar erro 400 para LIMIT_UNEXPECTED_FILE', () => {
      const error = new MulterError('LIMIT_UNEXPECTED_FILE', 'field');
      multerErrorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Somente arquivos de imagem são permitidos.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve retornar erro 400 genérico para outros erros MulterError', () => {
      const error = new MulterError('LIMIT_FIELD_COUNT', 'field');
      error.message = 'Too many fields';
      multerErrorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Too many fields',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve chamar next() para erros que não são MulterError', () => {
      const error = new Error('Generic error');
      multerErrorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('notFoundHandler', () => {
    it('deve retornar erro 404 com mensagem correta', () => {
      notFoundHandler(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Not Found',
      });
    });
  });

  describe('globalErrorHandler', () => {
    it('deve retornar erro 500 e logar o erro', () => {
      const error = new Error('Internal server error');
      globalErrorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(console.error).toHaveBeenCalledWith(
        'Erro nao tratado na API:',
        error,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal Server Error',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});

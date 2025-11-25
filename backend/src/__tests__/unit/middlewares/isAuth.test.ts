import isAuth from '../../../middlewares/isAuth';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';

describe('Middleware - isAuth', () => {
  let mockRequest: Partial<Request> & { session?: any };
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {} as Partial<Request> & { session?: any };
    mockResponse = {
      status: jest.fn<(code: number) => Response>().mockReturnThis(),
      json: jest.fn<(body: any) => Response>().mockReturnThis(),
    } as Partial<Response>;
    mockNext = jest.fn();
  });

  it('deve chamar next() quando usuário está autenticado', async () => {
    mockRequest.session = {
      uid: 'user-id',
      userTypeId: 'user-type-id',
    } as any;

    await isAuth(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('deve retornar erro 511 quando uid não está presente', async () => {
    mockRequest.session = {
      userTypeId: 'user-type-id',
    } as any;

    await isAuth(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(
      StatusCodes.NETWORK_AUTHENTICATION_REQUIRED,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Network Authentication Required',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('deve retornar erro 511 quando userTypeId não está presente', async () => {
    mockRequest.session = {
      uid: 'user-id',
    } as any;

    await isAuth(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(
      StatusCodes.NETWORK_AUTHENTICATION_REQUIRED,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Network Authentication Required',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('deve retornar erro 511 quando nem uid nem userTypeId estão presentes', async () => {
    mockRequest.session = {} as any;

    await isAuth(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(
      StatusCodes.NETWORK_AUTHENTICATION_REQUIRED,
    );
    expect(mockNext).not.toHaveBeenCalled();
  });
});

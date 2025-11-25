import { isBuildingManager } from '../../../middlewares/isbuildingManager';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserTypes } from '../../../types/types';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';

describe('Middleware - isBuildingManager', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      session: {} as any,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;
    mockNext = jest.fn();
  });

  it('deve chamar next() quando usuário é buildingManager', async () => {
    mockRequest.session = {
      uid: 'user-id',
      userTypeId: UserTypes.buildingManager,
    } as any;

    await isBuildingManager(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('deve retornar erro 403 quando userTypeId não é buildingManager', async () => {
    mockRequest.session = {
      uid: 'user-id',
      userTypeId: UserTypes.client,
    } as any;

    await isBuildingManager(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Forbidden',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('deve retornar erro 403 quando uid não está presente', async () => {
    mockRequest.session = {
      userTypeId: UserTypes.buildingManager,
    } as any;

    await isBuildingManager(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    expect(mockNext).not.toHaveBeenCalled();
  });
});

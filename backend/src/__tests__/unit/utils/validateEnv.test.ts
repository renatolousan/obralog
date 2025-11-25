import validateEnv from '../../../utils/validateEnv';
import { cleanEnv } from 'envalid';

jest.mock('envalid', () => ({
  cleanEnv: jest.fn(),
  port: jest.fn(() => (val: string) => Number(val)),
  str: jest.fn(() => (val: string) => val),
  num: jest.fn(() => (val: string) => Number(val)),
}));

describe('Utils - validateEnv', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar cleanEnv com as variáveis de ambiente corretas', () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      PORT: '3000',
      DATABASE_URL: 'postgresql://localhost:5432/test',
      UPLOAD_MAX_FILE_SIZE: '10485760',
      SESSION_SECRET: 'secret',
      GEMINI_API_KEY: 'api-key',
    };

    validateEnv();

    expect(cleanEnv).toHaveBeenCalledTimes(1);
    expect(cleanEnv).toHaveBeenCalledWith(process.env, {
      PORT: expect.any(Function),
      DATABASE_URL: expect.any(Function),
      UPLOAD_MAX_FILE_SIZE: expect.any(Function),
      SESSION_SECRET: expect.any(Function),
      GEMINI_API_KEY: expect.any(Function),
    });

    process.env = originalEnv;
  });

  it('deve validar todas as variáveis obrigatórias', () => {
    validateEnv();

    const callArgs = (cleanEnv as jest.Mock).mock.calls[0];
    const envObject = callArgs[1];

    expect(envObject).toHaveProperty('PORT');
    expect(envObject).toHaveProperty('DATABASE_URL');
    expect(envObject).toHaveProperty('UPLOAD_MAX_FILE_SIZE');
    expect(envObject).toHaveProperty('SESSION_SECRET');
    expect(envObject).toHaveProperty('GEMINI_API_KEY');
  });
});

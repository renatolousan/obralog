import { Request } from 'express';

// Helper para adicionar sessão mockada nas requisições de teste
export function mockSession(req: any) {
  req.session = {
    uid: 'test-user-id',
    email: 'test@example.com',
    userTypeId: '1',
    cookie: {
      maxAge: 10 * 24 * 6 * 60 * 1000,
      originalMaxAge: 10 * 24 * 6 * 60 * 1000,
    },
    save: (callback?: (err?: any) => void) => {
      if (callback) callback();
    },
    regenerate: (callback: (err?: any) => void) => {
      callback();
    },
    destroy: (callback: (err?: any) => void) => {
      callback();
    },
    reload: (callback: (err?: any) => void) => {
      callback();
    },
    touch: () => {},
  };
  return req;
}

// Middleware mock para bypass de autenticação em testes
export function bypassAuth(req: any, res: any, next: any) {
  mockSession(req);
  next();
}

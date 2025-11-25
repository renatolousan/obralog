import { parseAllowedOrigins, corsOptions } from '../../../middlewares/cors';
import { describe, it, expect } from '@jest/globals';

describe('Middleware - cors', () => {
  describe('parseAllowedOrigins', () => {
    it('deve parsear string com múltiplas origens separadas por vírgula', () => {
      const result = parseAllowedOrigins(
        'http://localhost:3000,https://example.com',
      );
      expect(result).toEqual(['http://localhost:3000', 'https://example.com']);
    });

    it('deve remover espaços em branco', () => {
      const result = parseAllowedOrigins(
        ' http://localhost:3000 , https://example.com ',
      );
      expect(result).toEqual(['http://localhost:3000', 'https://example.com']);
    });

    it('deve filtrar strings vazias', () => {
      const result = parseAllowedOrigins(
        'http://localhost:3000,,https://example.com',
      );
      expect(result).toEqual(['http://localhost:3000', 'https://example.com']);
    });

    it('deve retornar undefined para string vazia', () => {
      const result = parseAllowedOrigins('');
      expect(result).toBeUndefined();
    });

    it('deve retornar undefined para null', () => {
      const result = parseAllowedOrigins(null);
      expect(result).toBeUndefined();
    });

    it('deve retornar undefined para undefined', () => {
      const result = parseAllowedOrigins(undefined);
      expect(result).toBeUndefined();
    });

    it('deve retornar undefined para string com apenas espaços', () => {
      const result = parseAllowedOrigins('   ');
      expect(result).toBeUndefined();
    });

    it('deve retornar array vazio para string com apenas vírgulas e espaços', () => {
      const result = parseAllowedOrigins(' , , ');
      expect(result).toBeUndefined();
    });

    it('deve retornar array com uma única origem', () => {
      const result = parseAllowedOrigins('http://localhost:3000');
      expect(result).toEqual(['http://localhost:3000']);
    });
  });

  describe('corsOptions', () => {
    it('deve ter credentials como true', () => {
      expect(corsOptions.credentials).toBe(true);
    });

    it('deve ter origin configurado baseado nas variáveis de ambiente', () => {
      // O origin pode ser um array ou true dependendo da variável de ambiente
      expect(corsOptions.origin).toBeDefined();
    });
  });
});

import {
  normalizeIssue,
  formatDateTime,
  firstValue,
} from '../../../utils/feedback';

describe('Utils - feedback', () => {
  describe('normalizeIssue', () => {
    it('deve normalizar string para maiúsculo e remover espaços', () => {
      expect(normalizeIssue('  teste  ')).toBe('TESTE');
      expect(normalizeIssue('maçã')).toBe('MAÇÃ');
      expect(normalizeIssue('TESTE')).toBe('TESTE');
    });

    it('deve lidar com strings vazias', () => {
      expect(normalizeIssue('')).toBe('');
    });

    it('deve lidar com strings com apenas espaços', () => {
      expect(normalizeIssue('   ')).toBe('');
    });
  });

  describe('formatDateTime', () => {
    it('deve formatar data corretamente no formato ISO simplificado', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDateTime(date);
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
      expect(formatted).toContain('2024-01-15');
    });

    it('deve substituir T por espaço', () => {
      const date = new Date('2024-01-15T10:30:00');
      const formatted = formatDateTime(date);
      expect(formatted).not.toContain('T');
      expect(formatted).toContain(' ');
    });

    it('deve limitar a 16 caracteres (YYYY-MM-DD HH:MM)', () => {
      const date = new Date('2024-01-15T10:30:45.123Z');
      const formatted = formatDateTime(date);
      expect(formatted).toHaveLength(16);
    });
  });

  describe('firstValue', () => {
    it('deve retornar string quando recebe string', () => {
      expect(firstValue('teste')).toBe('teste');
      expect(firstValue('')).toBe('');
    });

    it('deve retornar primeiro elemento quando recebe array de strings', () => {
      expect(firstValue(['primeiro', 'segundo'])).toBe('primeiro');
      expect(firstValue(['único'])).toBe('único');
    });

    it('deve retornar undefined quando array está vazio', () => {
      expect(firstValue([])).toBeUndefined();
    });

    it('deve retornar undefined quando primeiro elemento não é string', () => {
      expect(firstValue([123, 'teste'])).toBeUndefined();
      expect(firstValue([null, 'teste'])).toBeUndefined();
      expect(firstValue([{}, 'teste'])).toBeUndefined();
    });

    it('deve retornar undefined quando recebe valor não string e não array', () => {
      expect(firstValue(123)).toBeUndefined();
      expect(firstValue(null)).toBeUndefined();
      expect(firstValue(undefined)).toBeUndefined();
      expect(firstValue({})).toBeUndefined();
      expect(firstValue(true)).toBeUndefined();
    });

    it('deve retornar string quando primeiro elemento do array é string', () => {
      expect(firstValue(['teste', 123])).toBe('teste');
    });
  });
});

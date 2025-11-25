import { jest } from '@jest/globals';

// Mock do uuid para evitar problemas com ESM
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}));

// Mock do Google GenAI para evitar problemas com ESM
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn(() => ({
    getGenerativeModel: jest.fn(() => ({
      generateContent: jest.fn(async () => ({
        response: {
          text: () => JSON.stringify({
            nivelRisco: 'MÉDIO',
            resumo: 'Teste de análise mock',
            pontosAtencao: ['Ponto 1', 'Ponto 2'],
            recomendacoes: ['Recomendação 1'],
            fornecedoresCriticos: [],
          }),
        },
      })),
    })),
  })),
}));

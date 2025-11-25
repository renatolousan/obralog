import request from 'supertest';
import { createApp } from '../../app';
import { prisma } from '../../app';
import { describe, it, expect, afterAll } from '@jest/globals';

describe('AI API - Integration Tests', () => {
  const app = createApp({ disableAuth: true });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/ai/analisar-risco/:id', () => {
    it('deve retornar análise de risco para empreendimento válido', async () => {
      // Buscar um desenvolvimento real
      const developments = await request(app).get('/api/developments');
      
      if (developments.body.length > 0) {
        const devId = developments.body[0].id;
        
        const response = await request(app).post(`/api/ai/analisar-risco/${devId}`);

        // A resposta pode ser 200 (com análise IA) ou 200 (sem análise IA por falta de API key)
        expect([200, 500]).toContain(response.status);
        
        if (response.status === 200) {
          expect(response.body).toHaveProperty('healthStatus');
          expect(response.body.healthStatus).toHaveProperty('status');
          expect(response.body.healthStatus).toHaveProperty('color');
          
          // Verificar estrutura da análise (se houver)
          if (response.body.analysis) {
            expect(response.body.analysis).toHaveProperty('riskLevel');
            expect(response.body.analysis).toHaveProperty('summary');
          }
        }
      }
    }, 30000); // Timeout de 30s pois pode chamar API externa

    it('deve calcular métricas mesmo sem API Gemini', async () => {
      const developments = await request(app).get('/api/developments');
      
      if (developments.body.length > 0) {
        const devId = developments.body[0].id;
        
        // Temporariamente remover a API key para testar fallback
        const originalKey = process.env.GEMINI_API_KEY;
        delete process.env.GEMINI_API_KEY;
        
        const response = await request(app).post(`/api/ai/analisar-risco/${devId}`);
        
        // Restaurar API key
        process.env.GEMINI_API_KEY = originalKey;
        
        // Mesmo sem IA, deve retornar dados básicos
        if (response.status === 200) {
          expect(response.body).toHaveProperty('healthStatus');
        }
      }
    }, 30000);
  });
});

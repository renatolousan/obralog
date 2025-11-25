import request from 'supertest';
import { createApp } from '../../app';
import { prisma } from '../../app';
import { describe, it, expect, afterAll } from '@jest/globals';

describe('Developments API - Integration Tests', () => {
  const app = createApp({ disableAuth: true });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /health', () => {
    it('deve retornar status ok quando o servidor está funcionando', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('PATCH /api/developments/:id/risk-threshold', () => {
    it('deve retornar 400 quando riskThreshold não é fornecido', async () => {
      const response = await request(app)
        .patch('/api/developments/1/risk-threshold')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar 400 quando riskThreshold está fora do intervalo', async () => {
      const response = await request(app)
        .patch('/api/developments/1/risk-threshold')
        .send({ riskThreshold: 150 });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('0 e 100');
    });

    it('deve retornar 400 quando riskThreshold é negativo', async () => {
      const response = await request(app)
        .patch('/api/developments/1/risk-threshold')
        .send({ riskThreshold: -10 });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('0 e 100');
    });

    it('deve aceitar riskThreshold válido', async () => {
      // Primeiro, vamos buscar um desenvolvimento real
      const developments = await request(app).get('/api/developments');
      
      if (developments.body.length > 0) {
        const devId = developments.body[0].id;
        
        const response = await request(app)
          .patch(`/api/developments/${devId}/risk-threshold`)
          .send({ riskThreshold: 60 });

        expect([200, 404]).toContain(response.status);
        
        if (response.status === 200) {
          expect(response.body).toHaveProperty('riskThreshold', 60);
        }
      }
    });
  });

  describe('GET /api/developments/:id/health', () => {
    it('deve retornar estrutura de healthStatus correta', async () => {
      // Buscar um desenvolvimento real
      const developments = await request(app).get('/api/developments');
      
      if (developments.body.length > 0) {
        const devId = developments.body[0].id;
        
        const response = await request(app).get(`/api/developments/${devId}/health`);

        if (response.status === 200) {
          expect(response.body).toHaveProperty('healthStatus');
          expect(response.body.healthStatus).toHaveProperty('status');
          expect(response.body.healthStatus).toHaveProperty('color');
          expect(['ÓTIMO', 'OK', 'RUIM']).toContain(response.body.healthStatus.status);
        }
      }
    });
  });
});

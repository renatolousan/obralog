import { GoogleGenAI } from '@google/genai';
import { StatusCodes } from 'http-status-codes';
import { anyIndicator } from '../analytics/types';
import { developmentSummary } from '../../types/types';

export interface ComplaintSuggestion {
  categoria_sugerida: string;
  acao_sugerida: string;
}

const MODEL_NAME = 'gemini-2.0-flash-001';

type ErrorWithStatus = Error & { status?: number };

let cachedClient: GoogleGenAI | null = null;

const withStatus = (message: string, status: number) => {
  const error = new Error(message) as ErrorWithStatus;
  error.status = status;
  return error;
};

const getClient = () => {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey)
    throw withStatus(
      'GEMINI_API_KEY não configurada.',
      StatusCodes.INTERNAL_SERVER_ERROR,
    );

  cachedClient = new GoogleGenAI({ apiKey });
  return cachedClient;
};

const normalizeResponse = (rawResponse: string) => {
  const cleaned = rawResponse.trim();
  const withoutFence = cleaned.replace(/^```json\s*/i, '').replace(/```$/i, '');

  return withoutFence;
};

export const suggestComplaintAction = async (
  complaintText: string,
): Promise<ComplaintSuggestion> => {
  const client = getClient();

  const systemInstruction =
    'Você é analista de assistência técnica de um condomínio residencial. ' +
    'Dado o texto de uma reclamação, responda exclusivamente com JSON contendo: ' +
    '{ "categoria_sugerida": <categoria da equipe>, "acao_sugerida": <ação objetiva a executar> }. ' +
    'Use português nos valores e mantenha apenas uma categoria e uma ação por resposta.';

  const trimmedComplaint = complaintText.trim();

  const result = await client.models.generateContent({
    model: MODEL_NAME,
    contents: [
      {
        role: 'user',
        parts: [{ text: trimmedComplaint }],
      },
    ],
    config: {
      systemInstruction: {
        role: 'system',
        parts: [{ text: systemInstruction }],
      },
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  const text = result.text?.trim();

  if (!text)
    throw withStatus(
      'Resposta vazia do provedor Gemini.',
      StatusCodes.BAD_GATEWAY,
    );

  try {
    const suggestion = JSON.parse(
      normalizeResponse(text),
    ) as ComplaintSuggestion;

    if (
      typeof suggestion.categoria_sugerida !== 'string' ||
      typeof suggestion.acao_sugerida !== 'string'
    ) {
      throw new Error('Formato inválido retornado pela IA.');
    }

    return {
      categoria_sugerida: suggestion.categoria_sugerida.trim(),
      acao_sugerida: suggestion.acao_sugerida.trim(),
    };
  } catch (error) {
    const parsingError =
      error instanceof Error
        ? error
        : new Error('Falha ao interpretar resposta da IA.');
    throw withStatus(parsingError.message, StatusCodes.BAD_GATEWAY);
  }
};

export const suggestIndicatorAction = async (
  indicatorData: anyIndicator,
): Promise<string> => {
  const client = getClient();

  const systemInstruction =
    'Você é um analista especializado em gestão predial e análise de dados. ' +
    'Com base nos indicadores fornecidos, forneça uma recomendação objetiva e curta em português brasileiro ' +
    'sobre possíveis ações de melhoria ou manutenção. A resposta deve ser uma única frase clara e direta, ' +
    'focando nos aspectos mais críticos que requerem atenção imediata.' +
    'os indicadores que fornecerei a você são arrays de objetos em JSON ordenados por total de reclamaçẽs feitas por usuários, ' +
    'Considere que quanto mais reclamações, mais problemas há com o alvo do indicador. ' +
    'Sua resposta deve ser uma string somente';

  const indicatorDataStr = JSON.stringify(indicatorData);

  const result = await client.models.generateContent({
    model: MODEL_NAME,
    contents: [
      {
        role: 'user',
        parts: [{ text: indicatorDataStr }],
      },
    ],
    config: {
      systemInstruction: {
        role: 'system',
        parts: [{ text: systemInstruction }],
      },
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  const text = result.text?.trim();

  if (!text)
    throw withStatus(
      'Resposta vazia do provedor Gemini.',
      StatusCodes.BAD_GATEWAY,
    );

  try {
    const suggestion = JSON.parse(normalizeResponse(text));
    return suggestion;
  } catch (error) {
    const parsingError =
      error instanceof Error
        ? error
        : new Error('Falha ao interpretar resposta da IA.');
    throw withStatus(parsingError.message, StatusCodes.BAD_GATEWAY);
  }
};

export const summarizeDevelopmentStatistics = async (
  data: developmentSummary,
): Promise<string> => {
  const client = getClient();

  const systemInstruction =
    'Você é um analista especializado em gestão predial e análise de dados ' +
    'E você está encarregado de analisar as estatísticas sobre esta obra, considerando:' +
    `A obra "${data.obra.nome}" conta com ${data.estatisticas.total_reclamacoes} reclamações,
${data.estatisticas.total_visitas} visitas técnicas e um custo acumulado de R$${data.estatisticas.total_custo_reparo.toFixed(2)}.` +
    `O desempenho geral indica um bom acompanhamento das torres (${data.estatisticas.torres} no total.` +
    'Sua resposta deve ser somente um objeto JSON no formato {resumo: string} com o campo "resumo" sendo um parágrafo em português brasileiro.';

  const result = await client.models.generateContent({
    model: MODEL_NAME,
    contents: [
      {
        role: 'user',
        parts: [{ text: 'Faça um resumo para esta obra.' }],
      },
    ],
    config: {
      systemInstruction: {
        role: 'system',
        parts: [{ text: systemInstruction }],
      },
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  const text = result.text?.trim();

  if (!text)
    throw withStatus(
      'Resposta vazia do provedor Gemini.',
      StatusCodes.BAD_GATEWAY,
    );

  try {
    const suggestion = JSON.parse(normalizeResponse(text)).resumo as string;
    console.log(suggestion);
    return suggestion;
  } catch (error) {
    const parsingError =
      error instanceof Error
        ? error
        : new Error('Falha ao interpretar resposta da IA.');
    throw withStatus(parsingError.message, StatusCodes.BAD_GATEWAY);
  }
};

export const analyzeDevelopmentRisk = async (
  developmentId: string,
): Promise<any> => {
  const prisma = (await import('../prisma/client')).default;

  // Buscar dados do empreendimento
  const development = await prisma.development.findUnique({
    where: { id: developmentId },
    include: {
      buildings: {
        include: {
          units: {
            include: {
              items: {
                include: {
                  feedbacks: {
                    select: {
                      id: true,
                      issue: true,
                      description: true,
                      repairCost: true,
                      created_at: true,
                      status: true,
                    },
                  },
                  supplier: {
                    select: {
                      name: true,
                      cnpj: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!development) {
    throw withStatus('Empreendimento não encontrado', StatusCodes.NOT_FOUND);
  }

  // Calcular métricas
  let totalItems = 0;
  let itemsWithComplaints = 0;
  let totalRepairCost = 0;
  const complaintsBySupplier: Record<string, number> = {};
  const complaintsByIssue: Record<string, number> = {};

  for (const building of development.buildings) {
    for (const unit of building.units) {
      totalItems += unit.items.length;

      for (const item of unit.items) {
        if (item.feedbacks.length > 0) {
          itemsWithComplaints++;

          for (const feedback of item.feedbacks) {
            totalRepairCost += Number(feedback.repairCost || 0);

            // Agrupar por fornecedor
            const supplierName = item.supplier.name;
            complaintsBySupplier[supplierName] =
              (complaintsBySupplier[supplierName] || 0) + 1;

            // Agrupar por tipo de problema
            complaintsByIssue[feedback.issue] =
              (complaintsByIssue[feedback.issue] || 0) + 1;
          }
        }
      }
    }
  }

  const percentageWithComplaints =
    totalItems > 0 ? (itemsWithComplaints / totalItems) * 100 : 0;

  // Determinar status de saúde
  let healthStatus: 'ÓTIMO' | 'OK' | 'RUIM';
  let healthColor: 'green' | 'yellow' | 'red';

  if (percentageWithComplaints <= 30) {
    healthStatus = 'ÓTIMO';
    healthColor = 'green';
  } else if (percentageWithComplaints <= 50) {
    healthStatus = 'OK';
    healthColor = 'yellow';
  } else {
    healthStatus = 'RUIM';
    healthColor = 'red';
  }

  // Preparar dados para o prompt
  const suppliersList = Object.entries(complaintsBySupplier)
    .map(([supplier, count]) => `- ${supplier}: ${count} reclamações`)
    .join('\n');

  const issuesList = Object.entries(complaintsByIssue)
    .map(([issue, count]) => `- ${issue}: ${count} ocorrências`)
    .join('\n');

  const systemInstruction = `Você é um analista especializado em gestão de obras e análise de risco.
Analise o empreendimento e forneça insights objetivos sobre o risco.

**Empreendimento:** ${development.name}
**Descrição:** ${development.description}

**Métricas:**
- Total de itens instalados: ${totalItems}
- Itens com reclamações: ${itemsWithComplaints} (${percentageWithComplaints.toFixed(2)}%)
- Custo total de reparos: R$ ${totalRepairCost.toFixed(2)}
- Status de saúde: ${healthStatus}
- Limiar de risco configurado: ${development.riskThreshold}%

**Reclamações por fornecedor:**
${suppliersList || 'Nenhuma reclamação registrada'}

**Reclamações por tipo de problema:**
${issuesList || 'Nenhuma reclamação registrada'}

Forneça uma análise estruturada em formato JSON com:
{
  "nivelRisco": "BAIXO" | "MÉDIO" | "ALTO",
  "resumo": "Análise geral do empreendimento",
  "pontosAtencao": ["ponto1", "ponto2"],
  "recomendacoes": ["recomendação1", "recomendação2"],
  "fornecedoresCriticos": ["fornecedor1", "fornecedor2"]
}`;

  const client = getClient();

  try {
    const result = await client.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: 'user',
          parts: [{ text: 'Analise o risco deste empreendimento.' }],
        },
      ],
      config: {
        systemInstruction: {
          role: 'system',
          parts: [{ text: systemInstruction }],
        },
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    });

    const text = result.text?.trim();

    console.log('🤖 Resposta do Gemini:', text);

    let aiAnalysis;
    if (text) {
      try {
        const parsed = JSON.parse(normalizeResponse(text));
        console.log('✅ JSON parseado com sucesso:', parsed);

        // Mapear para inglês para compatibilidade com frontend
        aiAnalysis = {
          riskLevel: parsed.nivelRisco || 'MÉDIO',
          summary: parsed.resumo || '',
          attentionPoints: parsed.pontosAtencao || [],
          recommendations: parsed.recomendacoes || [],
          criticalSuppliers: parsed.fornecedoresCriticos || [],
        };
      } catch (error) {
        console.error('❌ Erro ao parsear JSON do Gemini:', error);
        aiAnalysis = {
          riskLevel: 'MÉDIO',
          summary: text,
          attentionPoints: [],
          recommendations: [],
          criticalSuppliers: [],
        };
      }
    } else {
      console.warn('⚠️ Gemini retornou resposta vazia');
      aiAnalysis = null;
    }

    const response = {
      developmentId,
      developmentName: development.name,
      metrics: {
        totalItems,
        itemsWithComplaints,
        percentageWithComplaints: Number(percentageWithComplaints.toFixed(2)),
        totalRepairCost: Number(totalRepairCost.toFixed(2)),
        riskThreshold: Number(development.riskThreshold || 50),
      },
      healthStatus: {
        status: healthStatus,
        color: healthColor,
      },
      complaintsBySupplier,
      complaintsByIssue,
      aiAnalysis,
    };

    console.log(
      '📊 Resposta final sendo enviada:',
      JSON.stringify(response, null, 2),
    );
    return response;
  } catch (error) {
    console.error('❌ Erro ao chamar Gemini:', error);

    // Retornar análise sem IA em caso de erro
    return {
      developmentId,
      developmentName: development.name,
      metrics: {
        totalItems,
        itemsWithComplaints,
        percentageWithComplaints: Number(percentageWithComplaints.toFixed(2)),
        totalRepairCost: Number(totalRepairCost.toFixed(2)),
        riskThreshold: Number(development.riskThreshold || 50),
      },
      healthStatus: {
        status: healthStatus,
        color: healthColor,
      },
      complaintsBySupplier,
      complaintsByIssue,
      aiAnalysis: null,
    };
  }
};

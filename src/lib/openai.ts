import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface MorphologicalAnalysis {
  face_shape: string;
  nose_analysis: string;
  eyes_analysis: string;
  jawline: string;
  proportions: string;
  recommendations: string[];
}

export interface WeeklyPlan {
  week_1: string; // Cabelo
  week_2: string; // Harmonização e Molduras
  week_3: string; // Skincare
  week_4: string; // Acessórios & Postura
}

export async function analyzeWithGPT4oMini(
  imageBase64: string,
  quizAnswers: any
): Promise<{ analysis: MorphologicalAnalysis; plan: WeeklyPlan }> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em análise morfológica facial e harmonização estética. 
Analise a imagem fornecida e as respostas do questionário para criar:
1. Uma análise técnica detalhada da estrutura facial
2. Um plano universal de 30 dias (4 semanas) para otimização da aparência

IMPORTANTE: Use linguagem neutra e universal. Não assuma gênero.

Retorne APENAS um JSON válido no seguinte formato:
{
  "analysis": {
    "face_shape": "descrição da forma do rosto",
    "nose_analysis": "análise do nariz",
    "eyes_analysis": "análise dos olhos",
    "jawline": "análise da mandíbula",
    "proportions": "análise das proporções áureas",
    "recommendations": ["recomendação 1", "recomendação 2", "recomendação 3"]
  },
  "plan": {
    "week_1": "Plano detalhado para cabelo (corte, estilo, produtos)",
    "week_2": "Plano detalhado para harmonização e molduras faciais",
    "week_3": "Plano detalhado para skincare (rotina, produtos)",
    "week_4": "Plano detalhado para acessórios e postura corporal"
  }
}`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Respostas do questionário:
- Objetivo: ${quizAnswers.question_1}
- Estilo: ${quizAnswers.question_2}
- Preocupação: ${quizAnswers.question_3}
- Rotina: ${quizAnswers.question_4}
- Investimento: ${quizAnswers.question_5}

Analise a imagem e crie um plano personalizado de 30 dias.`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Resposta vazia da API OpenAI');
    }

    // Parse do JSON retornado
    const result = JSON.parse(content);
    
    return {
      analysis: result.analysis,
      plan: result.plan
    };
  } catch (error: any) {
    console.error('Erro ao analisar com GPT-4o-mini:', error);
    throw new Error(`Falha na análise: ${error.message}`);
  }
}

export { openai };

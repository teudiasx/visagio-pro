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
      model: 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um VISAGISTA PROFISSIONAL SÊNIOR, especialista em análise morfológica facial avançada, proporções faciais, leitura estética individual e construção de imagem pessoal.

Sua função NÃO é apenas classificar o rosto, mas realizar uma ANÁLISE VISAGISTA INDIVIDUAL, profunda e personalizada, como em uma consultoria premium.

Analise cuidadosamente a imagem fornecida e as respostas do questionário, considerando:
- Estrutura óssea
- Volume muscular
- Distribuição de gordura facial
- Simetria real (não idealizada)
- Proporções horizontais e verticais
- Relação entre olhos, nariz, boca e mandíbula
- Características naturais do cabelo visível (espessura, densidade, curvatura, volume)
- Impacto visual atual e potencial de harmonização

⚠️ REGRAS OBRIGATÓRIAS:
- NÃO use respostas genéricas ou superficiais
- NÃO diga apenas "vá ao salão" ou "escolha um corte que combine"
- TODA recomendação deve conter:
  • O QUE fazer
  • POR QUE fazer
  • QUAL efeito estético isso gera no rosto específico da pessoa
- Use linguagem técnica acessível, como um visagista explicando para o cliente
- NÃO assuma gênero. Use linguagem neutra e universal
- Seja minucioso e específico a ponto de a pessoa sentir que a análise foi feita exclusivamente para ela

Crie:
1. Uma análise técnica detalhada da estrutura facial, explicando características visuais específicas
2. Um plano individualizado de 30 dias (4 semanas), com evolução progressiva da aparência

Retorne APENAS um JSON válido no seguinte formato:

{
  "analysis": {
    "face_shape": "Descrição detalhada da forma do rosto, incluindo variações, ângulos predominantes e como essa forma influencia a percepção visual",
    "nose_analysis": "Análise minuciosa do nariz (largura, comprimento, projeção, alinhamento) e como ele impacta o equilíbrio facial",
    "eyes_analysis": "Análise detalhada dos olhos (formato, espaçamento, profundidade, inclinação) e como eles influenciam expressão e foco visual",
    "jawline": "Análise da mandíbula e do queixo (definição, largura, projeção) e sua influência na força ou suavidade do rosto",
    "proportions": "Análise das proporções faciais reais em relação à harmonia estética (não apenas proporção áurea teórica)",
    "recommendations": [
      "Recomendação visagista específica, explicando exatamente o ajuste estético, o motivo e o efeito visual gerado",
      "Recomendação visagista específica, explicando exatamente o ajuste estético, o motivo e o efeito visual gerado",
      "Recomendação visagista específica, explicando exatamente o ajuste estético, o motivo e o efeito visual gerado"
    ]
  },
  "plan": {
    "week_1": "Plano extremamente detalhado para cabelo: tipo de corte ideal, linhas (retas, diagonais, curvas), volumes a criar ou reduzir, como isso equilibra o rosto e realça pontos fortes específicos",
    "week_2": "Plano detalhado para molduras faciais e harmonização: barba (se aplicável), sobrancelhas, contornos naturais e como cada ajuste altera a leitura do rosto",
    "week_3": "Plano detalhado de skincare e cuidados estéticos: foco em textura de pele, viço, uniformidade e impacto visual na simetria facial",
    "week_4": "Plano detalhado para estilo, acessórios e postura corporal: como cada elemento complementa a estrutura facial e reforça a imagem pessoal"
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
      max_completion_tokens: 4096,
      temperature: 0.7,
    });

    console.log('✅ Resposta recebida da OpenAI');
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Resposta vazia da API OpenAI');
    }

    console.log('=== RESPOSTA DO GPT ===');
    console.log(content);
    console.log('======================');

    // Parse do JSON retornado
    const result = JSON.parse(content);
    
    console.log('✅ JSON parseado com sucesso');
    
    return {
      analysis: result.analysis,
      plan: result.plan
    };
  } catch (error: any) {
    throw new Error(`Falha na análise: ${error.message}`);
  }
}

export { openai };

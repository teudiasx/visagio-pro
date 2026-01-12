import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userId, imageUrl, quizAnswers } = await request.json();

    if (!userId || !imageUrl) {
      return NextResponse.json(
        { error: 'userId e imageUrl são obrigatórios' },
        { status: 400 }
      );
    }

    // Prompt universal e inclusivo para análise facial
    const prompt = `Você é um especialista em análise facial e harmonia estética. Analise a imagem fornecida e retorne um JSON estruturado com as seguintes informações:\n\n{\n  \"analise_morfologica\": {\n    \"formato_rosto\": \"Descrição detalhada do formato do rosto (oval, quadrado, redondo, diamante, etc.)\",\n    \"proporcao_nariz\": \"Análise da proporção e harmonia do nariz em relação ao rosto\",\n    \"simetria_olhos\": \"Avaliação da simetria e posicionamento dos olhos\",\n    \"linha_mandibula\": \"Descrição da definição e contorno da mandíbula\"\n  },\n  \"cronograma_30_dias\": {\n    \"semana_1_cabelo\": {\n      \"titulo\": \"Semana 1: Transformação Capilar\",\n      \"recomendacoes\": [\"Lista de 3-5 recomendações específicas para o cabelo baseadas na análise facial\"],\n      \"produtos_sugeridos\": [\"Lista de produtos recomendados\"],\n      \"dicas_praticas\": [\"Dicas práticas de implementação\"]\n    },\n    \"semana_2_harmonizacao\": {\n      \"titulo\": \"Semana 2: Harmonização e Molduras Faciais\",\n      \"recomendacoes\": [\"Lista de 3-5 recomendações para design de sobrancelhas e traços faciais\"],\n      \"produtos_sugeridos\": [\"Lista de produtos recomendados\"],\n      \"dicas_praticas\": [\"Dicas práticas de implementação\"]\n    },\n    \"semana_3_skincare\": {\n      \"titulo\": \"Semana 3: Rotina de Skincare Personalizada\",\n      \"recomendacoes\": [\"Lista de 3-5 recomendações de skincare baseadas no tipo de pele\"],\n      \"produtos_sugeridos\": [\"Lista de produtos recomendados\"],\n      \"dicas_praticas\": [\"Dicas práticas de implementação\"]\n    },\n    \"semana_4_acessorios\": {\n      \"titulo\": \"Semana 4: Acessórios e Postura\",\n      \"recomendacoes\": [\"Lista de 3-5 recomendações de acessórios que complementam o formato facial\"],\n      \"produtos_sugeridos\": [\"Lista de produtos recomendados\"],\n      \"dicas_praticas\": [\"Dicas de postura e apresentação pessoal\"]\n    }\n  }\n}\n\nIMPORTANTE: \n- Use linguagem universal e inclusiva, sem distinção de gênero\n- Foque em harmonia estética e simetria\n- Seja específico e prático nas recomendações\n- Considere as respostas do quiz: ${JSON.stringify(quizAnswers)}`;

    // Chamada para OpenAI Vision API com gpt-4o-mini (modelo de alta eficiência)
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    });

    const analysisResult = JSON.parse(response.choices[0].message.content || '{}');

    // Gerar ID único para a análise
    const analysisId = 'analysis-' + Date.now();

    // Retornar sucesso com dados mock para funcionamento offline
    return NextResponse.json({
      success: true,
      analysisId: analysisId,
      analysis: analysisResult,
    });
  } catch (error) {
    console.error('Erro na análise:', error);
    return NextResponse.json(
      { error: 'Erro ao processar análise' },
      { status: 500 }
    );
  }
}
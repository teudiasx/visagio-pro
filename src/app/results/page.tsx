'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { getAnalysis } from '@/lib/auth-helpers';

interface AnalysisData {
  analise_morfologica: {
    formato_rosto: string;
    proporcao_nariz: string;
    simetria_olhos: string;
    linha_mandibula: string;
  };
  cronograma_30_dias: {
    semana_1_cabelo: WeekData;
    semana_2_harmonizacao: WeekData;
    semana_3_skincare: WeekData;
    semana_4_acessorios: WeekData;
  };
}

interface WeekData {
  titulo: string;
  recomendacoes: string[];
  produtos_sugeridos: string[];
  dicas_praticas: string[];
}

export default function ResultsPage() {
  const { profile, loading: authLoading } = useAuth();
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      console.log('[Results] Carregando dados...');
      try {
        // Recuperar foto do localStorage
        const photo = localStorage.getItem('userPhoto');
        console.log('[Results] Foto recuperada:', photo ? 'Sim' : 'Não');
        setUserPhoto(photo);

        // Status de assinatura vem do perfil do Supabase via useAuth
        console.log('[Results] Status de assinatura:', profile?.subscription_status || 'free');

        // Buscar análise do Supabase
        const analysisId = localStorage.getItem('currentAnalysisId');
        console.log('[Results] Analysis ID:', analysisId);
        if (analysisId) {
          console.log('[Results] 🔍 Buscando análise no Supabase...');
          const supabaseAnalysis = await getAnalysis(analysisId);
          
          if (supabaseAnalysis) {
            console.log('[Results] ✅ Análise encontrada no Supabase');
            // analyses_v2 já tem o formato correto como JSON
            const analysisData = supabaseAnalysis.analysis_result;
            setAnalysisData(analysisData);
            // Buscar foto da análise ou do localStorage
            setUserPhoto(supabaseAnalysis.image_url || photo);
          } else {
            console.log('[Results] ⚠️ Análise não encontrada no Supabase, tentando localStorage...');
            const savedAnalysis = localStorage.getItem('analysisResult');
            if (savedAnalysis) {
              console.log('[Results] Carregando análise do localStorage (fallback)...');
              const parsedAnalysis = JSON.parse(savedAnalysis);
              setAnalysisData(parsedAnalysis);
            } else {
              // Dados mock para demonstração
              const mockData: AnalysisData = {
              analise_morfologica: {
                formato_rosto: "Seu rosto apresenta um formato oval harmonioso, com proporções equilibradas que favorecem a maioria dos estilos de penteados e maquiagem.",
                proporcao_nariz: "O nariz está bem proporcional ao rosto, com uma ponte reta e narinas simétricas.",
                simetria_olhos: "Os olhos demonstram boa simetria, com pálpebras superiores bem definidas.",
                linha_mandibula: "A mandíbula apresenta uma definição suave, contribuindo para um perfil elegante."
              },
              cronograma_30_dias: {
                semana_1_cabelo: {
                  titulo: "Semana 1: Transformação Capilar",
                  recomendacoes: [
                    "Corte em camadas para adicionar movimento e volume aos cabelos",
                    "Use produtos para definição de cachos se aplicável",
                    "Experimente diferentes repartições para encontrar o estilo ideal"
                  ],
                  produtos_sugeridos: [
                    "Shampoo e condicionador para seu tipo de cabelo",
                    "Óleo para pontas para hidratação",
                    "Spray fixador leve para modelagem"
                  ],
                  dicas_praticas: [
                    "Lave os cabelos a cada 2-3 dias para manter a oleosidade natural",
                    "Use toalha microfiber para secar os cabelos sem frizz",
                    "Durma com os cabelos presos em um coque alto para preservar os cachos"
                  ]
                },
                semana_2_harmonizacao: {
                  titulo: "Semana 2: Harmonização e Molduras Faciais",
                  recomendacoes: [
                    "Defina as sobrancelhas com uma forma que complemente o formato do rosto",
                    "Use maquiagem para realçar os pontos fortes do rosto",
                    "Experimente diferentes estilos de óculos se necessário"
                  ],
                  produtos_sugeridos: [
                    "Pincel para sobrancelhas",
                    "Máscara para cílios",
                    "Base leve para uniformizar o tom da pele"
                  ],
                  dicas_praticas: [
                    "Dedique 5 minutos diários para cuidar das sobrancelhas",
                    "Use produtos adequados ao seu tipo de pele",
                    "Pratique técnicas de maquiagem minimalista"
                  ]
                },
                semana_3_skincare: {
                  titulo: "Semana 3: Rotina de Skincare Personalizada",
                  recomendacoes: [
                    "Estabeleça uma rotina diária de limpeza, hidratação e proteção",
                    "Use produtos específicos para seu tipo de pele",
                    "Inclua exfolição semanal para renovação celular"
                  ],
                  produtos_sugeridos: [
                    "Limpeza suave com pH balanceado",
                    "Hidratação com ácido hialurônico",
                    "Proteção solar diária FPS 30+"
                  ],
                  dicas_praticas: [
                    "Aplique produtos sempre de baixo para cima no rosto",
                    "Use algodão para aplicar tônicos e séruns",
                    "Faça massagens faciais suaves durante a aplicação"
                  ]
                },
                semana_4_acessorios: {
                  titulo: "Semana 4: Acessórios e Postura",
                  recomendacoes: [
                    "Escolha brincos que complementem o formato do rosto",
                    "Use colares para alongar o pescoço visualmente",
                    "Experimente diferentes estilos de lenços e chapéus"
                  ],
                  produtos_sugeridos: [
                    "Brincos de tamanho médio",
                    "Colares delicados",
                    "Lenços de seda para diversos looks"
                  ],
                  dicas_praticas: [
                    "Mantenha boa postura para realçar a harmonia facial",
                    "Use acessórios para equilibrar proporções",
                    "Experimente combinações diferentes diariamente"
                  ]
                }
              }
            };
            console.log('[Results] Usando dados mock');
            setAnalysisData(mockData);
            localStorage.setItem('analysisResult', JSON.stringify(mockData));
            }
          }
        }
      } catch (error) {
        console.error('[Results] Erro ao carregar dados:', error);
        console.error('[Results] Stack trace:', error instanceof Error ? error.stack : 'N/A');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [profile]);

  const subscriptionStatus = profile?.subscription_status || 'free';
  const canViewBasicAnalysis = subscriptionStatus === 'standard' || subscriptionStatus === 'premium';
  const canViewWeek1And2 = subscriptionStatus === 'standard' || subscriptionStatus === 'premium';
  const canViewWeek3And4 = subscriptionStatus === 'premium';

  const renderBlurredContent = (content: string) => (
    <div className="relative">
      <div className="blur-[12px] select-none pointer-events-none">
        <p className="text-[#E0E0E0]">{content}</p>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Lock className="w-10 h-10 mb-2" style={{ color: '#C0C0C0', filter: 'drop-shadow(0 0 10px rgba(192, 192, 192, 0.8))' }} />
        <span className="text-[#FFFFFF] font-bold text-sm" style={{ textShadow: '0 0 10px rgba(157, 80, 187, 0.8)' }}>
          Conteúdo Exclusivo
        </span>
      </div>
    </div>
  );

  const renderWeekContent = (weekData: WeekData | undefined, canView: boolean) => {
    if (canView && weekData && weekData.recomendacoes && weekData.produtos_sugeridos && weekData.dicas_praticas) {
      return (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-[#FFFFFF] mb-2">Recomendações:</h4>
            <ul className="list-disc list-inside space-y-1 text-[#E0E0E0] text-sm">
              {weekData.recomendacoes.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[#FFFFFF] mb-2">Produtos Sugeridos:</h4>
            <ul className="list-disc list-inside space-y-1 text-[#E0E0E0] text-sm">
              {weekData.produtos_sugeridos.map((prod, idx) => (
                <li key={idx}>{prod}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[#FFFFFF] mb-2">Dicas Práticas:</h4>
            <ul className="list-disc list-inside space-y-1 text-[#E0E0E0] text-sm">
              {weekData.dicas_praticas.map((dica, idx) => (
                <li key={idx}>{dica}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
    return renderBlurredContent('Conteúdo exclusivo para assinantes. Faça upgrade para desbloquear.');
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white text-xl">Carregando análise...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 animate-fade-in">
      <main className="max-w-5xl mx-auto">
        {/* Botão Voltar */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar ao Dashboard
        </Link>

        {/* User Photo with Badge */}
        <div className="glass-card mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <h1 className="text-4xl font-bold text-[#FFFFFF]">Seus Resultados</h1>
              <span
                className={`px-4 py-1 rounded-full text-sm font-bold ${
                  subscriptionStatus === 'premium'
                    ? 'bg-gradient-to-r from-[#9D50BB] to-[#B565FF] text-white'
                    : subscriptionStatus === 'standard'
                    ? 'bg-gray-600 text-gray-200'
                    : 'bg-gray-800 text-gray-400'
                }`}
                style={{
                  boxShadow: subscriptionStatus === 'premium'
                    ? '0 0 20px rgba(157, 80, 187, 0.6)'
                    : 'none'
                }}
              >
                {subscriptionStatus === 'premium' ? '⭐ Premium' : subscriptionStatus === 'standard' ? 'Standard' : 'Free'}
              </span>
            </div>
            {userPhoto ? (
              <div className="inline-block">
                <img
                  src={userPhoto}
                  alt="Sua foto"
                  className="max-w-sm w-full h-auto object-cover rounded-2xl mx-auto"
                  style={{
                    border: '2px solid #9D50BB',
                    boxShadow: '0 0 40px rgba(157, 80, 187, 0.6), inset 0 0 20px rgba(157, 80, 187, 0.2)'
                  }}
                />
              </div>
            ) : (
              <div
                className="max-w-sm h-64 mx-auto rounded-2xl flex items-center justify-center"
                style={{
                  border: '2px solid #9D50BB',
                  background: 'rgba(157, 80, 187, 0.1)'
                }}
              >
                <p className="text-[#E0E0E0]">Nenhuma foto carregada</p>
              </div>
            )}
          </div>
        </div>

        {/* Análise Morfológica Básica */}
        <div className="glass-premium mb-8">
          <h2 className="text-2xl font-bold mb-4 text-[#FFFFFF]">Análise Morfológica Básica</h2>
          {canViewBasicAnalysis && analysisData ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-[#FFFFFF] mb-2">Formato do Rosto:</h3>
                <p className="text-[#E0E0E0]">{analysisData.analise_morfologica.formato_rosto}</p>
              </div>
              <div>
                <h3 className="font-semibold text-[#FFFFFF] mb-2">Proporção do Nariz:</h3>
                <p className="text-[#E0E0E0]">{analysisData.analise_morfologica.proporcao_nariz}</p>
              </div>
              <div>
                <h3 className="font-semibold text-[#FFFFFF] mb-2">Simetria dos Olhos:</h3>
                <p className="text-[#E0E0E0]">{analysisData.analise_morfologica.simetria_olhos}</p>
              </div>
              <div>
                <h3 className="font-semibold text-[#FFFFFF] mb-2">Linha da Mandíbula:</h3>
                <p className="text-[#E0E0E0]">{analysisData.analise_morfologica.linha_mandibula}</p>
              </div>
            </div>
          ) : (
            renderBlurredContent('Análise morfológica detalhada disponível para assinantes.')
          )}
        </div>

        {/* Cronograma de 30 Dias */}
        <h2 className="text-3xl font-bold mb-6 text-center text-[#FFFFFF]">Jornada de 30 Dias</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Semana 1 */}
          <div className="glass-premium">
            <h3 className="text-xl font-bold mb-4 text-[#FFFFFF]">
              {analysisData?.cronograma_30_dias?.semana_1_cabelo?.titulo || 'Semana 1: Transformação Capilar'}
            </h3>
            {renderWeekContent(analysisData?.cronograma_30_dias?.semana_1_cabelo, canViewWeek1And2)}
          </div>

          {/* Semana 2 */}
          <div className="glass-premium">
            <h3 className="text-xl font-bold mb-4 text-[#FFFFFF]">
              {analysisData?.cronograma_30_dias?.semana_2_harmonizacao?.titulo || 'Semana 2: Harmonização e Molduras Faciais'}
            </h3>
            {renderWeekContent(analysisData?.cronograma_30_dias?.semana_2_harmonizacao, canViewWeek1And2)}
          </div>

          {/* Semana 3 */}
          <div className="glass-premium">
            <h3 className="text-xl font-bold mb-4 text-[#FFFFFF]">
              {analysisData?.cronograma_30_dias?.semana_3_skincare?.titulo || 'Semana 3: Rotina de Skincare Personalizada'}
            </h3>
            {renderWeekContent(analysisData?.cronograma_30_dias?.semana_3_skincare, canViewWeek3And4)}
          </div>

          {/* Semana 4 */}
          <div className="glass-premium">
            <h3 className="text-xl font-bold mb-4 text-[#FFFFFF]">
              {analysisData?.cronograma_30_dias?.semana_4_acessorios?.titulo || 'Semana 4: Acessórios e Postura'}
            </h3>
            {renderWeekContent(analysisData?.cronograma_30_dias?.semana_4_acessorios, canViewWeek3And4)}
          </div>
        </div>

        {/* Unlock Section */}
        {subscriptionStatus !== 'premium' && (
          <div
            className="rounded-2xl text-center"
            style={{
              padding: '40px',
              background: 'linear-gradient(135deg, rgba(157, 80, 187, 0.2) 0%, rgba(110, 72, 170, 0.3) 100%)',
              border: '2px solid rgba(157, 80, 187, 0.5)',
              boxShadow: '0 0 40px rgba(157, 80, 187, 0.3)'
            }}
          >
            <div className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-[#8A2BE2] to-[#9D4EDD] mb-4">
              <span className="text-white font-bold text-sm">🔥 PREÇO DE LANÇAMENTO - OFERTA POR TEMPO LIMITADO</span>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-[#FFFFFF]">Desbloqueie Seu Potencial Máximo</h2>
            <p className="text-[#E0E0E0] text-lg mb-2 max-w-2xl mx-auto">
              Para acessar sua análise completa e plano personalizado de evolução facial, escolha um dos nossos planos premium.
            </p>
            <p className="text-[#8A2BE2] text-xl font-bold mb-8">
              Por menos de R$ 30,00 você recebe uma consultoria completa de 30 dias!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {subscriptionStatus === 'free' && (
                <>
                  <Link href="/pricing" className="btn-secondary text-lg">
                    Standard - R$ 19,90/mês
                  </Link>
                  <Link href="/pricing" className="btn-primary text-lg">
                    Premium - R$ 29,90/mês ⭐
                  </Link>
                </>
              )}
              {subscriptionStatus === 'standard' && (
                <Link href="/pricing" className="btn-primary text-lg">
                  Upgrade para Premium - R$ 29,90/mês ⭐
                </Link>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
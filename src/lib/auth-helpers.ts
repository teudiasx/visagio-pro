import { supabase } from './supabase';

/**
 * Verifica se o usuário está autenticado
 */
export async function checkAuth() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Erro ao verificar autenticação:', error);
      return null;
    }

    return session?.user || null;
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return null;
  }
}

/**
 * Obtém ou cria o perfil do usuário
 * Retorna um perfil mock se a tabela não existir
 */
export async function getOrCreateProfile(userId: string, email: string) {
  try {
    // Tentar obter perfil existente
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profile) {
      return profile;
    }

    // Se não existir, tentar criar novo perfil
    if (fetchError?.code === 'PGRST116' || !profile) {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          subscription_status: 'free',
        })
        .select()
        .maybeSingle();

      if (newProfile) {
        return newProfile;
      }

      // Se erro ao inserir, verificar se é porque a tabela não existe
      if (insertError?.code === '42P01') {
        // Tabela não existe - retornar perfil mock
        console.warn('⚠️ Tabela profiles não existe. Usando perfil temporário.');
        return {
          id: userId,
          email: email,
          subscription_status: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      if (insertError) {
        console.error('Erro ao criar perfil:', insertError);
      }
    }

    // Se a tabela não existe, retornar perfil mock
    if (fetchError?.code === '42P01') {
      console.warn('⚠️ Tabela profiles não existe. Usando perfil temporário.');
      return {
        id: userId,
        email: email,
        subscription_status: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    // Para outros erros, retornar null silenciosamente
    return null;
  } catch (error: any) {
    // Ignorar erros de rede e abort
    if (error?.name === 'AbortError' || 
        error?.message?.includes('aborted') ||
        error?.message?.includes('Failed to fetch')) {
      return null;
    }
    
    console.error('Erro ao obter/criar perfil:', error);
    return null;
  }
}

/**
 * Faz logout do usuário
 */
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Erro ao fazer logout:', error);
      return false;
    }

    // Limpar localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('quizAnswers');
      localStorage.removeItem('userPhoto');
      localStorage.removeItem('currentAnalysisId');
    }

    return true;
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return false;
  }
}

/**
 * Verifica o status da assinatura do usuário
 */
export async function getSubscriptionStatus(userId: string) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', userId)
      .maybeSingle();

    if (error || !profile) {
      return 'free';
    }

    return profile?.subscription_status || 'free';
  } catch (error) {
    return 'free';
  }
}

/**
 * Atualiza o status da assinatura do usuário
 */
export async function updateSubscriptionStatus(
  userId: string,
  status: 'free' | 'standard' | 'premium'
) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Erro ao atualizar assinatura:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao atualizar assinatura:', error);
    return false;
  }
}

/**
 * Salva resultado do quiz
 */
export async function saveQuizResult(userId: string, answers: any) {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .insert({
        user_id: userId,
        question_1: answers.question_1 || '',
        question_2: answers.question_2 || '',
        question_3: answers.question_3 || '',
        question_4: answers.question_4 || '',
        question_5: answers.question_5 || '',
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Erro ao salvar resultado do quiz:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao salvar resultado do quiz:', error);
    return null;
  }
}

/**
 * Salva análise facial
 */
export async function saveAnalysis(
  userId: string,
  quizResultId: string | null,
  imageUrl: string,
  morphologicalAnalysis: any,
  weeklyContent: {
    week_1: string;
    week_2: string;
    week_3: string;
    week_4: string;
  },
  isPaid: boolean = false
) {
  try {
    const { data, error } = await supabase
      .from('analyses')
      .insert({
        user_id: userId,
        quiz_result_id: quizResultId,
        image_url: imageUrl,
        morphological_analysis: morphologicalAnalysis,
        week_1_content: weeklyContent.week_1,
        week_2_content: weeklyContent.week_2,
        week_3_content: weeklyContent.week_3,
        week_4_content: weeklyContent.week_4,
        is_paid: isPaid,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Erro ao salvar análise:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao salvar análise:', error);
    return null;
  }
}

/**
 * Obtém análise por ID
 */
export async function getAnalysis(analysisId: string) {
  try {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar análise:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar análise:', error);
    return null;
  }
}

/**
 * Obtém todas as análises do usuário
 */
export async function getUserAnalyses(userId: string) {
  try {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar análises do usuário:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar análises do usuário:', error);
    return [];
  }
}

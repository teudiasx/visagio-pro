import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente Supabase com configuração otimizada para persistência
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  }
});

// Types para o banco de dados
export type Profile = {
  id: string;
  email: string;
  subscription_status: 'free' | 'standard' | 'premium';
  created_at: string;
  updated_at: string;
};

export type QuizResult = {
  id: string;
  user_id: string;
  question_1: string;
  question_2: string;
  question_3: string;
  question_4: string;
  question_5: string;
  created_at: string;
};

export type Analysis = {
  id: string;
  user_id: string;
  quiz_result_id?: string;
  image_url?: string;
  morphological_analysis?: any;
  week_1_content?: string;
  week_2_content?: string;
  week_3_content?: string;
  week_4_content?: string;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
};
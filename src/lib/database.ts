import { supabase } from './supabase';
import type { Profile, QuizResult, Analysis } from './supabase';

// ===== PROFILE FUNCTIONS =====

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return null;
  }

  return data;
}

// ===== QUIZ FUNCTIONS =====

export async function saveQuizResults(userId: string, answers: {
  question_1: string;
  question_2: string;
  question_3: string;
  question_4: string;
  question_5: string;
}): Promise<QuizResult | null> {
  const { data, error } = await supabase
    .from('quiz_results')
    .insert({
      user_id: userId,
      ...answers,
    })
    .select()
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getQuizResults(userId: string): Promise<QuizResult[]> {
  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }

  return data || [];
}

export async function getLatestQuizResult(userId: string): Promise<QuizResult | null> {
  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return null;
  }

  return data;
}

// ===== ANALYSIS FUNCTIONS =====

export async function saveAnalysis(userId: string, analysisData: {
  image_metadata?: any;
  week_1_content?: string;
  week_2_content?: string;
  week_3_content?: string;
  week_4_content?: string;
}): Promise<Analysis | null> {
  const { data, error } = await supabase
    .from('analyses')
    .insert({
      user_id: userId,
      ...analysisData,
    })
    .select()
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function updateAnalysis(analysisId: string, updates: Partial<Analysis>): Promise<Analysis | null> {
  const { data, error } = await supabase
    .from('analyses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', analysisId)
    .select()
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getAnalyses(userId: string): Promise<Analysis[]> {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }

  return data || [];
}

export async function getLatestAnalysis(userId: string): Promise<Analysis | null> {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return null;
  }

  return data;
}

// ===== AUTH HELPERS =====

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return false;
  }
  return true;
}

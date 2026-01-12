export interface QuizAnswers {
  objetivo: 'Autoridade' | 'Atrair Parceiros' | 'Rejuvenescimento';
  mandibula: 'Definida' | 'Escondida';
  pele: 'Oleosa' | 'Seca' | 'Mista' | 'Não sei';
  tempo: '5min' | '15min' | '+30min';
  oculos: 'Sim' | 'Não';
  rosto: 'Quadrado' | 'Redondo' | 'Oval' | 'Diamante' | 'Não sei';
  satisfacao: number; // 0-10
}

export interface UserData {
  quiz: QuizAnswers;
  photo: string; // URL da foto
  subscriptionStart?: Date;
  plan?: 'Standard' | 'Premium';
}
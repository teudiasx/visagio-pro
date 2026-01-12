/**
 * Calcula quantas semanas devem estar liberadas baseado na data de início da subscription
 * 
 * Regras:
 * - Standard: Semana 1 (imediato) + Semana 2 (após 7 dias) = 2 semanas total
 * - Premium: Semanas 1-4, liberando 1 por semana (0, 7, 14, 21 dias)
 * 
 * @param subscriptionStartedAt - Data ISO string de quando a subscription começou
 * @param subscriptionStatus - Tipo de plano (free/standard/premium)
 * @returns Número de semanas que devem estar liberadas (1-4)
 */
export function getUnlockedWeeksCount(
  subscriptionStartedAt: string | null,
  subscriptionStatus: string
): number {
  // Free não tem acesso a nenhuma semana
  if (subscriptionStatus === 'free' || !subscriptionStartedAt) {
    return 0;
  }

  const startDate = new Date(subscriptionStartedAt);
  const now = new Date();
  
  // Calcular diferença em dias
  const diffMs = now.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  // Calcular quantas semanas completas se passaram (0, 1, 2, 3...)
  const weeksElapsed = Math.floor(diffDays / 7);
  
  // Semanas liberadas = semanas passadas + 1 (primeira semana é liberada imediatamente)
  const unlockedWeeks = weeksElapsed + 1;

  // Limitar baseado no plano
  if (subscriptionStatus === 'standard') {
    // Standard: máximo 2 semanas
    return Math.min(unlockedWeeks, 2);
  } else if (subscriptionStatus === 'premium') {
    // Premium: máximo 4 semanas
    return Math.min(unlockedWeeks, 4);
  }

  return 0;
}

/**
 * Verifica se uma semana específica deve estar desbloqueada
 * 
 * @param weekNumber - Número da semana (1-4)
 * @param subscriptionStartedAt - Data de início da subscription
 * @param subscriptionStatus - Tipo de plano
 * @returns true se a semana deve estar desbloqueada
 */
export function isWeekUnlocked(
  weekNumber: number,
  subscriptionStartedAt: string | null,
  subscriptionStatus: string
): boolean {
  const unlockedCount = getUnlockedWeeksCount(subscriptionStartedAt, subscriptionStatus);
  return weekNumber <= unlockedCount;
}

/**
 * Retorna a data em que uma semana específica será desbloqueada
 * 
 * @param weekNumber - Número da semana (1-4)
 * @param subscriptionStartedAt - Data de início da subscription
 * @returns Data de desbloqueio ou null se já estiver desbloqueada
 */
export function getWeekUnlockDate(
  weekNumber: number,
  subscriptionStartedAt: string | null
): Date | null {
  if (!subscriptionStartedAt) return null;

  // Semana 1 está sempre desbloqueada (dia 0)
  if (weekNumber === 1) return null;

  const startDate = new Date(subscriptionStartedAt);
  const daysToUnlock = (weekNumber - 1) * 7;
  
  const unlockDate = new Date(startDate);
  unlockDate.setDate(unlockDate.getDate() + daysToUnlock);
  
  return unlockDate;
}

/**
 * Formata a data de desbloqueio para exibição
 */
export function formatUnlockDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function getUnlockedWeeksCount(
  subscriptionStartedAt: string | null,
  subscriptionStatus: string
): number {
  if (subscriptionStatus === 'free' || !subscriptionStartedAt) {
    return 0;
  }

  const startDate = new Date(subscriptionStartedAt);
  const now = new Date();
  
  const diffMs = now.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  const weeksElapsed = Math.floor(diffDays / 7);
  
  const unlockedWeeks = weeksElapsed + 1;

  if (subscriptionStatus === 'standard') {
    return Math.min(unlockedWeeks, 2);
  } else if (subscriptionStatus === 'premium') {
    return Math.min(unlockedWeeks, 4);
  }

  return 0;
}

export function isWeekUnlocked(
  weekNumber: number,
  subscriptionStartedAt: string | null,
  subscriptionStatus: string
): boolean {
  const unlockedCount = getUnlockedWeeksCount(subscriptionStartedAt, subscriptionStatus);
  return weekNumber <= unlockedCount;
}

export function getWeekUnlockDate(
  weekNumber: number,
  subscriptionStartedAt: string | null
): Date | null {
  if (!subscriptionStartedAt) return null;

  if (weekNumber === 1) return null;

  const startDate = new Date(subscriptionStartedAt);
  const daysToUnlock = (weekNumber - 1) * 7;
  
  const unlockDate = new Date(startDate);
  unlockDate.setDate(unlockDate.getDate() + daysToUnlock);
  
  return unlockDate;
}

export function formatUnlockDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

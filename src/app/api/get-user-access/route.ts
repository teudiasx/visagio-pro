import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function calculateUnlockedWeeks(
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

function getWeekUnlockDate(
  weekNumber: number,
  subscriptionStartedAt: string | null
): string | null {
  if (!subscriptionStartedAt || weekNumber === 1) return null;

  const startDate = new Date(subscriptionStartedAt);
  const daysToUnlock = (weekNumber - 1) * 7;
  
  const unlockDate = new Date(startDate);
  unlockDate.setDate(unlockDate.getDate() + daysToUnlock);
  
  return unlockDate.toISOString();
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_started_at')
      .eq('id', userId)
      .maybeSingle();

    if (error || !profile) {
      return NextResponse.json({
        subscriptionStatus: 'free',
        unlockedWeeksCount: 0,
        canViewBasicAnalysis: false,
        weeks: {
          week1: { unlocked: false, unlockDate: null },
          week2: { unlocked: false, unlockDate: null },
          week3: { unlocked: false, unlockDate: null },
          week4: { unlocked: false, unlockDate: null }
        }
      });
    }

    const subscriptionStatus = profile.subscription_status || 'free';
    const subscriptionStartedAt = profile.subscription_started_at;
    
    const unlockedWeeksCount = calculateUnlockedWeeks(subscriptionStartedAt, subscriptionStatus);
    const canViewBasicAnalysis = subscriptionStatus === 'standard' || subscriptionStatus === 'premium';

    return NextResponse.json({
      subscriptionStatus,
      unlockedWeeksCount,
      canViewBasicAnalysis,
      weeks: {
        week1: {
          unlocked: unlockedWeeksCount >= 1,
          unlockDate: getWeekUnlockDate(1, subscriptionStartedAt)
        },
        week2: {
          unlocked: unlockedWeeksCount >= 2,
          unlockDate: getWeekUnlockDate(2, subscriptionStartedAt)
        },
        week3: {
          unlocked: unlockedWeeksCount >= 3,
          unlockDate: getWeekUnlockDate(3, subscriptionStartedAt)
        },
        week4: {
          unlocked: unlockedWeeksCount >= 4,
          unlockDate: getWeekUnlockDate(4, subscriptionStartedAt)
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

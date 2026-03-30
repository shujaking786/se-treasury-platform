import type { LimitStatus } from '../types';

export function getLimitStatus(utilizationPct: number): LimitStatus {
  if (utilizationPct > 100) return 'BREACH';
  if (utilizationPct > 90) return 'NEAR_LIMIT';
  if (utilizationPct > 50) return 'ELEVATED';
  return 'SAFE';
}

export function getLimitBarVariant(status: LimitStatus): string {
  switch (status) {
    case 'BREACH': return 'breach';
    case 'NEAR_LIMIT':
    case 'ELEVATED': return 'warn';
    case 'SAFE': return 'safe';
  }
}

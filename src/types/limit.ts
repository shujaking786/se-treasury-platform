export type LimitStatus = 'BREACH' | 'NEAR_LIMIT' | 'ELEVATED' | 'SAFE';

export interface BankingPartnerLimit {
  partner: string;
  hqLimitEur: number;
  actualBalanceEur: number;
  utilizationPct: number;
  status: LimitStatus;
  relatedAres: string[];
}

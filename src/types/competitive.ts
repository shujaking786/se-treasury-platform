export type ComparisonResult = 'win' | 'lose' | 'neutral';

export interface CompetitorProfile {
  name: string;
  subtitle: string;
  features: Array<{ text: string; isPositive: boolean }>;
}

export interface ComparisonCriterion {
  criterion: string;
  ripple: { text: string; result: ComparisonResult };
  seTreasury: { text: string; result: ComparisonResult };
}

export interface ProofPoint {
  label: string;
  headline: string;
  subtext: string;
  variant: 'red' | 'accent';
}

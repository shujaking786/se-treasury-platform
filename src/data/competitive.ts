import type { CompetitorProfile, ComparisonCriterion, ProofPoint } from '../types';

export const rippleProfile: CompetitorProfile = {
  name: 'Ripple Treasury',
  subtitle: 'Payment rail optimization platform',
  features: [
    { text: '\u2726 Optimizes cross-border payment speed via blockchain rails', isPositive: true },
    { text: '\u2726 Reduces FX spread on international payments', isPositive: true },
    { text: '\u2726 Real-time settlement tracking', isPositive: true },
    { text: '\u2726 Requires bank-side API integration from day 1', isPositive: true },
    { text: '\u2726 6\u20139 month enterprise deployment typical', isPositive: true },
    { text: '\u2726 Per-transaction or per-volume pricing model', isPositive: true },
    { text: '\u2717 No HQ-set limit tracking per banking partner', isPositive: false },
    { text: '\u2717 No internal vs. external account distinction', isPositive: false },
    { text: '\u2717 No MTO country sweep restriction logic', isPositive: false },
    { text: '\u2717 No HR/Tax payment forecast overlay', isPositive: false },
    { text: '\u2717 Four-eyes is afterthought, not core design', isPositive: false },
  ],
};

export const seTreasuryProfile: CompetitorProfile = {
  name: 'SE Treasury Intelligence',
  subtitle: 'Cash intelligence + compliance platform',
  features: [
    { text: "\u2713 Purpose-built for Dina's exact stated requirements", isPositive: true },
    { text: '\u2713 Excel-first onboarding \u2014 zero IT dependency for PoC', isPositive: true },
    { text: '\u2713 PoC live in 2 weeks using your own data', isPositive: true },
    { text: '\u2713 Internal/External account types as first-class design', isPositive: true },
    { text: '\u2713 MTO country flag \u2014 manual-only mode enforced', isPositive: true },
    { text: '\u2713 Bank limit breach detection (2 active NOW)', isPositive: true },
    { text: '\u2713 HR + Tax + Vendor forecast overlay \u2192 net position', isPositive: true },
    { text: '\u2713 Four-eyes governance built into every action', isPositive: true },
    { text: '\u2713 Azure-native \u2192 Siemens M365 SSO + compliance', isPositive: true },
    { text: '\u2713 ARE / Country / Region / Banking Partner views', isPositive: true },
    { text: '\u2713 Flat subscription \u2014 no per-transaction cost', isPositive: true },
  ],
};

export const comparisonCriteria: ComparisonCriterion[] = [
  { criterion: 'Core purpose', ripple: { text: 'Move money faster. Wrong problem for SE MEA.', result: 'neutral' }, seTreasury: { text: 'Know where money is + compliance. Exact match.', result: 'win' } },
  { criterion: 'Time to first value', ripple: { text: '6\u20139 months. Bank API + blockchain onboarding required.', result: 'lose' }, seTreasury: { text: '2 weeks. Excel upload \u2192 FSR rendered from your data.', result: 'win' } },
  { criterion: 'MTO country handling', ripple: { text: 'Auto-sweep model breaks. EG/PK/DZ/most Africa fail.', result: 'lose' }, seTreasury: { text: 'MTO flag per entity. Recommendation-only enforced.', result: 'win' } },
  { criterion: 'Bank limit compliance', ripple: { text: 'No concept of HQ-set banking partner exposure limits.', result: 'lose' }, seTreasury: { text: 'Core module. SG breach + Pasargad breach auto-detected NOW.', result: 'win' } },
  { criterion: 'Finavigate integration', ripple: { text: 'Requires new API connectivity. Weeks of Finavigate IT work.', result: 'lose' }, seTreasury: { text: 'Excel export accepted. API is Phase 2 upgrade, not blocker.', result: 'win' } },
  { criterion: 'Internal vs. External accts', ripple: { text: 'All accounts = payment endpoints. No HQ/Nostro distinction.', result: 'lose' }, seTreasury: { text: 'Built-in. Internal accounts use cheaper HQ rates. Tracked separately.', result: 'win' } },
  { criterion: 'HR + Tax forecast overlay', ripple: { text: 'Not in scope. Ripple handles payments, not payment planning.', result: 'lose' }, seTreasury: { text: 'Monthly HR/Tax + Weekly vendor = net expected position per entity.', result: 'win' } },
  { criterion: 'Four-eyes governance', ripple: { text: 'Speed is the product. Compliance layer is an add-on.', result: 'lose' }, seTreasury: { text: 'Dual approval on every action. Immutable audit log. Per-user RBAC.', result: 'win' } },
  { criterion: 'Microsoft / Azure fit', ripple: { text: 'Cloud-agnostic. Not Azure-native. Separate identity stack.', result: 'neutral' }, seTreasury: { text: 'Azure-native. Siemens M365 SSO. Compliance tooling native.', result: 'win' } },
  { criterion: 'Pricing exposure', ripple: { text: 'Per-transaction or volume-based. Cross-border = variable cost forever.', result: 'lose' }, seTreasury: { text: 'Flat subscription. Predictable at any payment volume.', result: 'win' } },
  { criterion: 'Gamesa Phase 2 readiness', ripple: { text: '+6 entities = scoping + pricing renegotiation.', result: 'neutral' }, seTreasury: { text: 'Entity-agnostic architecture. +6 entities = adding config rows.', result: 'win' } },
];

export const proofPoints: ProofPoint[] = [
  { label: 'PROOF POINT \u2014 LIVE TODAY', headline: 'SG BREACH: 118.7%', subtext: 'Ripple would never have flagged this', variant: 'red' },
  { label: 'PROOF POINT \u2014 LIVE TODAY', headline: 'PASARGAD: 229.6%', subtext: '2.3x the allowed limit. Needs action now.', variant: 'red' },
  { label: 'PROOF POINT \u2014 LIVE TODAY', headline: '4678 UAE: -\u20AC28K', subtext: 'Negative net after reservations. Invisible in Excel.', variant: 'red' },
  { label: 'VS RIPPLE', headline: '2 weeks \u2192 LIVE', subtext: 'Ripple: 6\u20139 months. No contest.', variant: 'accent' },
];

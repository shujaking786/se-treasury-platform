function normalizeValue(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function getCanonicalBankKey(bankName: string): string {
  const normalized = normalizeValue(bankName);

  const aliasEntries: Array<[string[], string]> = [
    [['standardcharteredbank', 'standardchartered', 'scb'], 'standardchartered'],
    [['citibankegypt', 'citibank', 'citigroupinc', 'citi'], 'citigroup'],
    [['bankofalexandria', 'alex'], 'bankofalexandria'],
    [['emiratesnbd', 'enbd'], 'emiratesnbd'],
    [['firstabudhabibank', 'fab'], 'firstabudhabi'],
    [['saudiawwalbank', 'sab'], 'saudiawwalbank'],
    [['saudibritishbank', 'sbb'], 'saudibritishbank'],
    [['bnpparibas', 'bnp'], 'bnpparibas'],
    [['riyadbank'], 'riyadbank'],
    [['bankpasargad', 'pasargad'], 'bankpasargad'],
    [['samanbank', 'saman'], 'samanbank'],
    [['hsbc'], 'hsbc'],
    [['alrajhibank', 'alrajhi'], 'alrajhibank'],
    [['emiratesbankinternational', 'ebi'], 'emiratesbankinternational'],
    [['cibegypt', 'cib'], 'cibegypt'],
    [['societegenerale'], 'societegenerale'],
    [['stdbankofsafrica', 'standardbankofsafrica'], 'standardbankofsafrica'],
    [['nbkkuwait'], 'nbkkuwait'],
    [['gulfbank'], 'gulfbank'],
  ];

  for (const [aliases, canonical] of aliasEntries) {
    if (aliases.includes(normalized)) {
      return canonical;
    }
  }

  return normalized;
}

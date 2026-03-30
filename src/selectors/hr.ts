import { countryPresence, entityContacts } from '../data';
import type { EntityContact, HrFunding } from '../data/hr';
import type { DashboardFilters } from '../types';
import { matchesAnyAreCode, matchesAreCode } from './filtering';

function formatEur(value: number): string {
  if (value === 0) {
    return '\u20AC0';
  }

  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1_000_000) {
    return `${sign}\u20AC${(abs / 1_000_000).toFixed(2)}M`;
  }

  if (abs >= 1_000) {
    return `${sign}\u20AC${(abs / 1_000).toFixed(0)}K`;
  }

  return `${sign}\u20AC${abs.toFixed(0)}`;
}

export function selectHrViewModel(filter: DashboardFilters, hrFundings: HrFunding[] = [], extraEntities: EntityContact[] = []) {
  const allContacts = [...entityContacts, ...extraEntities];
  const filteredContacts = allContacts.filter((contact) => matchesAreCode(filter, contact.areCode));
  const filteredFundings = hrFundings.filter((item) => matchesAreCode(filter, item.ARE_Code));
  const filteredCountryPresence = countryPresence.filter((entry) => matchesAnyAreCode(filter, entry.areCodes));

  const meContacts = filteredContacts.filter((contact) => contact.region === 'ME');
  const africaContacts = filteredContacts.filter((contact) => contact.region === 'AFRICA');
  const meCountries = filteredCountryPresence.filter((entry) => entry.region === 'ME');
  const africaCountries = filteredCountryPresence.filter((entry) => entry.region === 'AFRICA');
  const totalFundingAmount = filteredFundings.reduce((sum, item) => sum + (item.Amount ?? 0), 0);

  return {
    kpis: [
      {
        label: 'Total Entities',
        value: String(filteredContacts.length),
        valueColor: 'white' as const,
        subtitle: `${meContacts.length} ME · ${africaContacts.length} Africa`,
        gradient: 'default' as const,
      },
      {
        label: 'Countries',
        value: String(filteredCountryPresence.length),
        valueColor: 'white' as const,
        subtitle: `${meCountries.length} ME · ${africaCountries.length} Africa`,
        gradient: 'default' as const,
      },
      {
        label: 'HR Fundings',
        value: String(filteredFundings.length),
        valueColor: 'amber' as const,
        subtitle: 'Funding records from Fabric',
        gradient: 'amber' as const,
      },
      {
        label: 'Total Funding',
        value: formatEur(totalFundingAmount),
        valueColor: totalFundingAmount > 0 ? 'green' as const : 'white' as const,
        subtitle: 'Total funding amount in scope',
        gradient: 'green' as const,
      },
    ],
    entityContacts: filteredContacts,
    hrFundings: filteredFundings,
    meCountries,
    africaCountries,
  };
}

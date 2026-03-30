import { externalFacilities, internalLoans, legalEntities } from '../data';
import type { ExternalFacility, InternalLoan, LegalEntity } from '../data/legal';
import type { DashboardFilters } from '../types';
import { matchesAreCode } from './filtering';

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

function formatLimit(value: number, ccy: string): string {
  if (value === 0) {
    return `0 ${ccy}`;
  }

  const abs = Math.abs(value);

  if (abs >= 1_000_000_000) {
    return `${(abs / 1_000_000_000).toFixed(1)}B ${ccy}`;
  }

  if (abs >= 1_000_000) {
    return `${(abs / 1_000_000).toFixed(1)}M ${ccy}`;
  }

  if (abs >= 1_000) {
    return `${(abs / 1_000).toFixed(0)}K ${ccy}`;
  }

  return `${abs.toFixed(0)} ${ccy}`;
}

export function selectLegalViewModel(
  filter: DashboardFilters,
  entities: LegalEntity[] = legalEntities,
  facilities: ExternalFacility[] = externalFacilities,
  loans: InternalLoan[] = internalLoans,
) {
  const filteredEntities = entities.filter((entity) => matchesAreCode(filter, entity.areCode));
  const filteredFacilities = facilities.filter((facility) => matchesAreCode(filter, facility.areCode));
  const filteredLoans = loans.filter((loan) => matchesAreCode(filter, loan.areCode));

  const meEntities = filteredEntities.filter((entity) => entity.region === 'ME');
  const africaEntities = filteredEntities.filter((entity) => entity.region === 'AFRICA');
  const totalFacilityLimit = filteredFacilities.reduce((sum, facility) => sum + facility.limit, 0);
  const totalLoanAmount = filteredLoans.reduce((sum, loan) => sum + loan.amountEur, 0);
  const uniqueCountries = new Set(filteredEntities.map((entity) => entity.countryCode)).size;

  return {
    kpis: [
      {
        label: 'Legal Entities',
        value: String(filteredEntities.length),
        valueColor: 'white' as const,
        subtitle: `${meEntities.length} ME + ${africaEntities.length} Africa`,
        gradient: 'default' as const,
      },
      {
        label: 'Countries',
        value: String(uniqueCountries),
        valueColor: 'white' as const,
        subtitle: 'Active jurisdictions in scope',
        gradient: 'default' as const,
      },
      {
        label: 'External Facilities',
        value: String(filteredFacilities.length),
        valueColor: 'amber' as const,
        subtitle: `Total limit: ${formatLimit(totalFacilityLimit, 'EGP')}`,
        gradient: 'amber' as const,
      },
      {
        label: 'Internal Loans',
        value: formatEur(totalLoanAmount),
        valueColor: 'white' as const,
        subtitle: `${filteredLoans.length} active instruments`,
        gradient: 'green' as const,
      },
    ],
    meEntities,
    africaEntities,
    externalFacilities: filteredFacilities,
    internalLoans: filteredLoans,
    totalLoanAmount,
  };
}

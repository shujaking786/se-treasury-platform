import type { Region } from './entity';

export type DashboardFilterValue =
  | {
      kind: 'region';
      region: Region;
      label: string;
    }
  | {
      kind: 'country';
      countryCode: string;
      label: string;
    }
  | {
      kind: 'entity';
      areCode: string;
      label: string;
    }
  | {
      kind: 'bankingPartner';
      bank: string;
      label: string;
    };

/** An array of active filters. Empty array = no filter (show all). */
export type DashboardFilters = DashboardFilterValue[];

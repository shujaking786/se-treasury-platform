export type ViewMode = 'region' | 'country' | 'are' | 'bankingPartner';

export interface SidebarEntity {
  icon: string;
  label: string;
  areCode?: string;
  hasWarning?: boolean;
}

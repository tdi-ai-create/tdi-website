export interface GrantMatch {
  name: string;
  meta: string;
  short: string;
  partial: boolean;
}

export function grantsByState(state: string): GrantMatch[] {
  const base: GrantMatch[] = [
    { name: 'Title II-A, Part A (ESSA)', meta: 'Federal · annual allocation', short: 'Title II-A', partial: false },
    { name: 'Title IV-A (SSAE)', meta: 'Federal · annual allocation', short: 'Title IV-A', partial: false },
  ];

  const stateGrants: Record<string, GrantMatch> = {
    IL: { name: 'Illinois EBF Tier System', meta: 'State · spring cycle', short: 'EBF', partial: true },
    MD: { name: 'Maryland Blueprint Compensatory Education Aid', meta: 'State · spring cycle', short: 'Blueprint', partial: false },
    CO: { name: 'Colorado READ Act / SB-191', meta: 'State · varies', short: 'READ Act', partial: true },
    TX: { name: 'Texas TIA / TEA PD Grants', meta: 'State · annual', short: 'TIA', partial: false },
    CA: { name: 'California Educator Effectiveness Block Grant', meta: 'State · annual', short: 'EEBG', partial: false },
    FL: { name: 'Florida UniSIG', meta: 'State · annual', short: 'UniSIG', partial: true },
    other: { name: 'Section 1003 (if CSI/TSI identified)', meta: 'Federal · for identified schools', short: 'Section 1003', partial: true },
  };

  return [...base, stateGrants[state] || stateGrants.other];
}

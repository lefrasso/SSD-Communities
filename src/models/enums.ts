// Choice-field value sets from the Data Model spec (docs/specs/02-data-model.md).
export type CommunityStatus = 'Proposed' | 'Chartered' | 'Active' | 'Merged' | 'Retired';

export type CommunityRoleType = 'Community Lead' | 'Family Owner (SME)' | 'Invited Expert';

export type SourceOrg = 'IP Dev Team' | 'CSAM Strategy Org' | 'Adoption' | 'Delivery';

export type CharterStatus = 'Draft' | 'In review' | 'Signed off';

export type HealthMeasure =
  | 'Participation'
  | 'Contribution'
  | 'Responsiveness'
  | 'Knowledge reuse'
  | 'Belonging'
  | 'Cross-pollination';

export type HealthPeriod = 'Baseline' | 'Q2 FY27' | 'Q3 FY27' | 'Year-end FY27';

export type HealthUnit = 'Percent' | 'count' | 'hours' | 'score';

export type RetirementDisposition = 'Migrate' | 'Merge' | 'Close';

// ServiceFamily and TimeZone are tenant-defined choices; kept as string.
export type ServiceFamily = string;
export type TimeZoneChoice = string;

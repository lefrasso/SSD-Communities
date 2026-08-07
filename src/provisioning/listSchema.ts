// Schema-as-code for the six portal lists (docs/specs/02-data-model.md).
// This typed definition is the single source of truth consumed by the provisioning
// routine (PnPjs) so the schema is versioned with the code, not configured by hand.

export type FieldType =
  | 'Text'
  | 'Note'
  | 'Choice'
  | 'MultiChoice'
  | 'Boolean'
  | 'DateTime'
  | 'Number'
  | 'URL'
  | 'User'
  | 'Lookup';

export interface IFieldDef {
  internalName: string;
  type: FieldType;
  required?: boolean;
  indexed?: boolean; // index lookup/filter fields to stay under the list view threshold
  unique?: boolean;
  choices?: string[]; // empty array => tenant-defined choices, filled at provisioning time
  lookupList?: string; // internalName of the target list (Lookup fields)
  description?: string;
}

export interface IListDef {
  internalName: string;
  title: string;
  description: string;
  fields: IFieldDef[];
  validationFormula?: string;
  validationMessage?: string;
}

const COMMUNITIES = 'Communities';

const ROLE_CHOICES = ['Community Lead', 'Subject Matter Expert'];
const TARGET_ROLE_CHOICES = [
  'CSA',
  'POD Lead',
  'Partner CSA (pCSA)',
  'Partner Lead',
  'Nebula member',
  'Manager'
];
const SOURCE_ORG_CHOICES = ['IP Dev Team', 'CSAM Strategy Org', 'Adoption', 'Delivery'];
const COMMUNITY_STATUS_CHOICES = ['Proposed', 'Chartered', 'Active', 'Merged', 'Retired'];
const CHARTER_STATUS_CHOICES = ['Draft', 'In review', 'Signed off'];
const MEASURE_CHOICES = [
  'Participation',
  'Contribution',
  'Responsiveness',
  'Knowledge reuse',
  'Belonging',
  'Cross-pollination'
];
const PERIOD_CHOICES = ['Baseline', 'Q2 FY27', 'Q3 FY27', 'Year-end FY27'];
const UNIT_CHOICES = ['Percent', 'count', 'hours', 'score'];
const DISPOSITION_CHOICES = ['Migrate', 'Merge', 'Close'];

/** All six lists. Title is the built-in field and is reused as the primary name where noted. */
export const COMMUNITY_LISTS: IListDef[] = [
  {
    internalName: COMMUNITIES,
    title: 'Communities',
    description: 'The community register: scope, family, channels, status.',
    fields: [
      // Title = community name (built-in), indexed for search.
      { internalName: 'Title', type: 'Text', required: true, indexed: true, unique: true },
      { internalName: 'ServiceFamily', type: 'Choice', indexed: true, choices: [], description: 'Tenant-defined service family' },
      { internalName: 'ScopeInScope', type: 'Note' },
      { internalName: 'ScopeOutOfScope', type: 'Note', description: 'Drives overlap review' },
      { internalName: 'VivaEngageGroupId', type: 'Text', description: 'Backing M365 group id' },
      { internalName: 'VivaEngageUrl', type: 'URL' },
      { internalName: 'ChatGroupUrl', type: 'URL' },
      { internalName: 'TargetRoles', type: 'MultiChoice', choices: TARGET_ROLE_CHOICES },
      { internalName: 'IsCrossCommunity', type: 'Boolean' },
      { internalName: 'Status', type: 'Choice', required: true, indexed: true, choices: COMMUNITY_STATUS_CHOICES },
      { internalName: 'LaunchDate', type: 'DateTime', description: 'Anchors the health baseline period' }
    ]
  },
  {
    internalName: 'CommunityRoles',
    title: 'Community Roles',
    description: 'Named people and their role in a community.',
    fields: [
      { internalName: 'Community', type: 'Lookup', lookupList: COMMUNITIES, required: true, indexed: true },
      { internalName: 'Person', type: 'User', required: true, description: 'Resolves against Entra; never free text' },
      { internalName: 'Role', type: 'Choice', required: true, indexed: true, choices: ROLE_CHOICES },
      { internalName: 'SourceOrg', type: 'Choice', required: true, choices: SOURCE_ORG_CHOICES },
      { internalName: 'Active', type: 'Boolean' }
    ]
  },
  {
    internalName: 'Charters',
    title: 'Charters',
    description: 'The charter record and its sign-off state; one per community.',
    fields: [
      { internalName: 'Community', type: 'Lookup', lookupList: COMMUNITIES, required: true, indexed: true, unique: true },
      { internalName: 'InteractionModel', type: 'Note' },
      { internalName: 'Cadence', type: 'Text' },
      { internalName: 'ReadinessPlan', type: 'Note' },
      { internalName: 'LaunchReadiness', type: 'MultiChoice', choices: [], description: 'The six readiness conditions' },
      { internalName: 'Status', type: 'Choice', required: true, indexed: true, choices: CHARTER_STATUS_CHOICES },
      { internalName: 'SignOffLead', type: 'User' },
      { internalName: 'SignOffLeadDate', type: 'DateTime' },
      { internalName: 'SignOffPM', type: 'User', description: 'PM signature records the overlap review' },
      { internalName: 'SignOffPMDate', type: 'DateTime' },
      { internalName: 'SignOffSME', type: 'User' },
      { internalName: 'SignOffSMEDate', type: 'DateTime' },
      { internalName: 'CharterVersion', type: 'Text' }
    ]
  },
  {
    internalName: 'IPCatalog',
    title: 'IP Catalog',
    description: 'Delivery IPs and their owning community (build-once, share-everywhere).',
    fields: [
      { internalName: 'Title', type: 'Text', required: true, description: 'IP name' },
      { internalName: 'OwningCommunity', type: 'Lookup', lookupList: COMMUNITIES, required: true, indexed: true },
      { internalName: 'Description', type: 'Note' }
    ]
  },
  {
    internalName: 'HealthMetrics',
    title: 'Health Metrics',
    description: 'Periodic snapshots of the six health measures.',
    fields: [
      { internalName: 'Community', type: 'Lookup', lookupList: COMMUNITIES, required: true, indexed: true },
      { internalName: 'Measure', type: 'Choice', required: true, indexed: true, choices: MEASURE_CHOICES },
      { internalName: 'Period', type: 'Choice', required: true, indexed: true, choices: PERIOD_CHOICES },
      { internalName: 'Value', type: 'Number', required: true },
      { internalName: 'Unit', type: 'Choice', required: true, choices: UNIT_CHOICES },
      { internalName: 'IsBaseline', type: 'Boolean' },
      { internalName: 'Commentary', type: 'Note' }
    ]
  },
  {
    internalName: 'ForumRetirement',
    title: 'Forum Retirement',
    description: 'Consolidation register and reduction tracking; one item per legacy forum.',
    fields: [
      { internalName: 'Title', type: 'Text', required: true, description: 'Forum / DL / channel name' },
      { internalName: 'Disposition', type: 'Choice', required: true, indexed: true, choices: DISPOSITION_CHOICES },
      { internalName: 'TargetCommunity', type: 'Lookup', lookupList: COMMUNITIES, required: true, indexed: true },
      { internalName: 'CompletionDate', type: 'DateTime' }
    ]
  }
];

import {
  CommunityStatus,
  CommunityRoleType,
  SourceOrg,
  CharterStatus,
  HealthMeasure,
  HealthPeriod,
  HealthUnit,
  RetirementDisposition,
  ServiceFamily,
  TimeZoneChoice
} from './enums';

/** Fields every SharePoint list item carries; the audit trail is built in. */
export interface IListItem {
  Id: number;
  Created?: string; // ISO 8601
  Modified?: string; // ISO 8601
  Author?: IPersonRef;
  Editor?: IPersonRef;
}

/** SharePoint hyperlink field shape. */
export interface IHyperlink {
  Url: string;
  Description?: string;
}

/** Resolved person; never a free-text name (resolves against Entra). */
export interface IPersonRef {
  id: number | string;
  displayName: string;
  email?: string;
  loginName?: string;
  jobTitle?: string;
}

/** Communities — the spine of the model. */
export interface ICommunity extends IListItem {
  Title: string;
  ServiceFamily: ServiceFamily;
  ScopeInScope?: string;
  ScopeOutOfScope?: string;
  VivaEngageGroupId?: string;
  VivaEngageUrl?: IHyperlink;
  ChatGroupUrl?: IHyperlink;
  TargetRoles: string[];
  IsCrossCommunity: boolean;
  Status: CommunityStatus;
  LaunchDate?: string;
}

/** CommunityRoles — one row per person/role; keeps time-zone coverage queryable. */
export interface ICommunityRole extends IListItem {
  CommunityId: number;
  Person: IPersonRef;
  Role: CommunityRoleType;
  TimeZone?: TimeZoneChoice; // required when Role === 'Family Owner (SME)'
  SourceOrg: SourceOrg;
  Active: boolean;
}

/** Charters — the launch gate; exactly one per community. */
export interface ICharter extends IListItem {
  CommunityId: number;
  InteractionModel?: string;
  Cadence?: string;
  ReadinessPlan?: string;
  LaunchReadiness: string[]; // the six readiness conditions that are met
  Status: CharterStatus;
  SignOffLead?: IPersonRef;
  SignOffLeadDate?: string;
  SignOffPM?: IPersonRef; // PM signature records the overlap review
  SignOffPMDate?: string;
  SignOffFamilyOwner?: IPersonRef;
  SignOffFamilyOwnerDate?: string;
  CharterVersion?: string;
}

/** IPCatalog — delivery IPs and their owning community (build-once, share-everywhere). */
export interface IIPCatalogItem extends IListItem {
  Title: string;
  OwningCommunityId: number;
  Description?: string;
}

/** HealthMetrics — periodic snapshots (community x measure x period). */
export interface IHealthMetric extends IListItem {
  CommunityId: number;
  Measure: HealthMeasure;
  Period: HealthPeriod;
  Value: number;
  Unit: HealthUnit;
  IsBaseline: boolean;
  Commentary?: string;
}

/** ForumRetirement — consolidation register; the reduction target is reported from here. */
export interface IForumRetirementItem extends IListItem {
  Title: string;
  Disposition: RetirementDisposition;
  TargetCommunityId: number;
  CompletionDate?: string;
}

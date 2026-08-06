import {
  CharterStatus,
  CommunityRoleType,
  CommunityStatus,
  HealthMeasure,
  HealthPeriod,
  HealthUnit,
  ICharter,
  ICommunity,
  ICommunityRole,
  IForumRetirementItem,
  IHealthMetric,
  IHyperlink,
  IIPCatalogItem,
  IPersonRef,
  RetirementDisposition,
  SourceOrg
} from '../models';

export interface ISharePointPerson {
  Id?: number;
  Title?: string;
  EMail?: string;
  Name?: string;
  JobTitle?: string;
}

export interface ISharePointLookup {
  Id?: number;
  Title?: string;
}

export interface ISharePointUrl {
  Url?: string;
  Description?: string;
}

interface ISharePointAuditItem {
  Id: number;
  Created?: string;
  Modified?: string;
  Author?: ISharePointPerson;
  Editor?: ISharePointPerson;
}

export interface ISharePointCommunity extends ISharePointAuditItem {
  Title: string;
  ServiceFamily?: string;
  ScopeInScope?: string;
  ScopeOutOfScope?: string;
  VivaEngageGroupId?: string;
  VivaEngageUrl?: ISharePointUrl | string;
  ChatGroupUrl?: ISharePointUrl | string;
  TargetRoles?: string[] | { results?: string[] };
  IsCrossCommunity?: boolean;
  Status: CommunityStatus;
  LaunchDate?: string;
}

export interface ISharePointRole extends ISharePointAuditItem {
  CommunityId?: number;
  Community?: ISharePointLookup;
  Person?: ISharePointPerson;
  Role: CommunityRoleType;
  TimeZone?: string;
  SourceOrg: SourceOrg;
  Active?: boolean;
}

export interface ISharePointCharter extends ISharePointAuditItem {
  CommunityId?: number;
  Community?: ISharePointLookup;
  InteractionModel?: string;
  Cadence?: string;
  ReadinessPlan?: string;
  LaunchReadiness?: string[] | { results?: string[] };
  Status: CharterStatus;
  SignOffLead?: ISharePointPerson;
  SignOffLeadDate?: string;
  SignOffPM?: ISharePointPerson;
  SignOffPMDate?: string;
  SignOffFamilyOwner?: ISharePointPerson;
  SignOffFamilyOwnerDate?: string;
  CharterVersion?: string;
}

export interface ISharePointIPItem extends ISharePointAuditItem {
  Title: string;
  OwningCommunityId?: number;
  OwningCommunity?: ISharePointLookup;
  Description?: string;
}

export interface ISharePointHealthMetric extends ISharePointAuditItem {
  CommunityId?: number;
  Community?: ISharePointLookup;
  Measure: HealthMeasure;
  Period: HealthPeriod;
  Value: number;
  Unit: HealthUnit;
  IsBaseline?: boolean;
  Commentary?: string;
}

export interface ISharePointRetirementItem extends ISharePointAuditItem {
  Title: string;
  Disposition: RetirementDisposition;
  TargetCommunityId?: number;
  TargetCommunity?: ISharePointLookup;
  CompletionDate?: string;
}

function mapPerson(person: ISharePointPerson | undefined): IPersonRef | undefined {
  if (!person || person.Id === undefined || !person.Title) {
    return undefined;
  }
  return {
    id: person.Id,
    displayName: person.Title,
    email: person.EMail,
    loginName: person.Name,
    jobTitle: person.JobTitle
  };
}

function mapRequiredPerson(person: ISharePointPerson | undefined): IPersonRef {
  return mapPerson(person) || { id: 0, displayName: 'Unassigned' };
}

function mapLookupId(directId: number | undefined, lookup: ISharePointLookup | undefined): number {
  return directId ?? lookup?.Id ?? 0;
}

function mapMultiChoice(value: string[] | { results?: string[] } | undefined): string[] {
  return Array.isArray(value) ? value : value?.results || [];
}

function mapUrl(value: ISharePointUrl | string | undefined): IHyperlink | undefined {
  if (typeof value === 'string') {
    return value ? { Url: value } : undefined;
  }
  return value?.Url ? { Url: value.Url, Description: value.Description } : undefined;
}

function audit(item: ISharePointAuditItem): Pick<ISharePointAuditItem, 'Id' | 'Created' | 'Modified'> & {
  Author?: IPersonRef;
  Editor?: IPersonRef;
} {
  return {
    Id: item.Id,
    Created: item.Created,
    Modified: item.Modified,
    Author: mapPerson(item.Author),
    Editor: mapPerson(item.Editor)
  };
}

export function mapCommunity(item: ISharePointCommunity): ICommunity {
  return {
    ...audit(item),
    Title: item.Title,
    ServiceFamily: item.ServiceFamily || '',
    ScopeInScope: item.ScopeInScope,
    ScopeOutOfScope: item.ScopeOutOfScope,
    VivaEngageGroupId: item.VivaEngageGroupId,
    VivaEngageUrl: mapUrl(item.VivaEngageUrl),
    ChatGroupUrl: mapUrl(item.ChatGroupUrl),
    TargetRoles: mapMultiChoice(item.TargetRoles),
    IsCrossCommunity: !!item.IsCrossCommunity,
    Status: item.Status,
    LaunchDate: item.LaunchDate
  };
}

export function mapRole(item: ISharePointRole): ICommunityRole {
  return {
    ...audit(item),
    CommunityId: mapLookupId(item.CommunityId, item.Community),
    Person: mapRequiredPerson(item.Person),
    Role: item.Role,
    TimeZone: item.TimeZone,
    SourceOrg: item.SourceOrg,
    Active: item.Active !== false
  };
}

export function mapCharter(item: ISharePointCharter): ICharter {
  return {
    ...audit(item),
    CommunityId: mapLookupId(item.CommunityId, item.Community),
    InteractionModel: item.InteractionModel,
    Cadence: item.Cadence,
    ReadinessPlan: item.ReadinessPlan,
    LaunchReadiness: mapMultiChoice(item.LaunchReadiness),
    Status: item.Status,
    SignOffLead: mapPerson(item.SignOffLead),
    SignOffLeadDate: item.SignOffLeadDate,
    SignOffPM: mapPerson(item.SignOffPM),
    SignOffPMDate: item.SignOffPMDate,
    SignOffFamilyOwner: mapPerson(item.SignOffFamilyOwner),
    SignOffFamilyOwnerDate: item.SignOffFamilyOwnerDate,
    CharterVersion: item.CharterVersion
  };
}

export function mapIPItem(item: ISharePointIPItem): IIPCatalogItem {
  return {
    ...audit(item),
    Title: item.Title,
    OwningCommunityId: mapLookupId(item.OwningCommunityId, item.OwningCommunity),
    Description: item.Description
  };
}

export function mapHealthMetric(item: ISharePointHealthMetric): IHealthMetric {
  return {
    ...audit(item),
    CommunityId: mapLookupId(item.CommunityId, item.Community),
    Measure: item.Measure,
    Period: item.Period,
    Value: Number(item.Value),
    Unit: item.Unit,
    IsBaseline: !!item.IsBaseline,
    Commentary: item.Commentary
  };
}

export function mapRetirementItem(item: ISharePointRetirementItem): IForumRetirementItem {
  return {
    ...audit(item),
    Title: item.Title,
    Disposition: item.Disposition,
    TargetCommunityId: mapLookupId(item.TargetCommunityId, item.TargetCommunity),
    CompletionDate: item.CompletionDate
  };
}
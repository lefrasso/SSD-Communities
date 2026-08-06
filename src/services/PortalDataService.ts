import { SPFI } from '@pnp/sp';
import '@pnp/sp/batching';
import '@pnp/sp/items';
import '@pnp/sp/lists';
import '@pnp/sp/webs';
import {
  CharterStatus,
  ICharter,
  ICommunity,
  ICommunityRole,
  IForumRetirementItem,
  IHealthMetric,
  IIPCatalogItem,
  IPersonRef
} from '../models';
import { CacheService, CACHE_TTL } from './CacheService';
import {
  ICommunityDetailData,
  ICommunityQuery,
  IPortalDataService
} from './IPortalDataService';
import { PortalError, toPortalError } from './PortalError';
import { SERVICE_STRINGS } from './ServiceStrings';
import {
  ISharePointCharter,
  ISharePointCommunity,
  ISharePointHealthMetric,
  ISharePointIPItem,
  ISharePointRetirementItem,
  ISharePointRole,
  mapCharter,
  mapCommunity,
  mapHealthMetric,
  mapIPItem,
  mapRetirementItem,
  mapRole
} from './sharePointMappers';
import {
  canTransitionCharter,
  filterCommunities,
  requiresTimeZone,
  validateCharter
} from './portalLogic';
import { ITelemetryService, TelemetryService } from './TelemetryService';

const LISTS = {
  communities: 'Communities',
  roles: 'Community Roles',
  charters: 'Charters',
  ipCatalog: 'IP Catalog',
  healthMetrics: 'Health Metrics',
  forumRetirement: 'Forum Retirement'
} as const;

const PAGE_SIZE = 500;
const COMMUNITY_SELECT = [
  'Id', 'Title', 'ServiceFamily', 'ScopeInScope', 'ScopeOutOfScope',
  'VivaEngageGroupId', 'VivaEngageUrl', 'ChatGroupUrl', 'TargetRoles',
  'IsCrossCommunity', 'Status', 'LaunchDate', 'Created', 'Modified',
  'Author/Id', 'Author/Title', 'Author/EMail',
  'Editor/Id', 'Editor/Title', 'Editor/EMail'
];
const ROLE_SELECT = [
  'Id', 'Community/Id', 'Person/Id', 'Person/Title', 'Person/EMail', 'Person/Name',
  'Role', 'TimeZone', 'SourceOrg', 'Active', 'Created', 'Modified',
  'Author/Id', 'Author/Title', 'Author/EMail',
  'Editor/Id', 'Editor/Title', 'Editor/EMail'
];
const CHARTER_SELECT = [
  'Id', 'Community/Id', 'InteractionModel', 'Cadence', 'ReadinessPlan',
  'LaunchReadiness', 'Status', 'SignOffLead/Id', 'SignOffLead/Title', 'SignOffLead/EMail',
  'SignOffLeadDate', 'SignOffPM/Id', 'SignOffPM/Title', 'SignOffPM/EMail',
  'SignOffPMDate', 'SignOffFamilyOwner/Id', 'SignOffFamilyOwner/Title',
  'SignOffFamilyOwner/EMail', 'SignOffFamilyOwnerDate', 'CharterVersion',
  'Created', 'Modified', 'Author/Id', 'Author/Title', 'Author/EMail',
  'Editor/Id', 'Editor/Title', 'Editor/EMail'
];
const IP_SELECT = [
  'Id', 'Title', 'OwningCommunity/Id', 'Description', 'Created', 'Modified',
  'Author/Id', 'Author/Title', 'Author/EMail',
  'Editor/Id', 'Editor/Title', 'Editor/EMail'
];
const METRIC_SELECT = [
  'Id', 'Community/Id', 'Measure', 'Period', 'Value', 'Unit', 'IsBaseline',
  'Commentary', 'Created', 'Modified', 'Author/Id', 'Author/Title', 'Author/EMail',
  'Editor/Id', 'Editor/Title', 'Editor/EMail'
];
const RETIREMENT_SELECT = [
  'Id', 'Title', 'Disposition', 'TargetCommunity/Id', 'CompletionDate',
  'Created', 'Modified', 'Author/Id', 'Author/Title', 'Author/EMail',
  'Editor/Id', 'Editor/Title', 'Editor/EMail'
];

interface IAsyncPageQuery<T> {
  [Symbol.asyncIterator](): AsyncIterator<T[]>;
}

interface IAddResultShape {
  Id?: number;
  ID?: number;
  data?: { Id?: number; ID?: number };
}

function escapeOData(value: string): string {
  return value.replace(/'/g, "''");
}

function personId(person: IPersonRef | undefined): number | null {
  if (!person) {
    return null;
  }
  const id = Number(person.id);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function addResultId(result: unknown): number {
  const shaped = result as IAddResultShape;
  const id = shaped.data?.Id ?? shaped.data?.ID ?? shaped.Id ?? shaped.ID;
  if (!id || id <= 0) {
    throw new PortalError('Unknown', SERVICE_STRINGS.addedIdMissing);
  }
  return id;
}

export class PortalDataService implements IPortalDataService {
  public constructor(
    private readonly sp: SPFI,
    private readonly cache = new CacheService(),
    private readonly telemetry: ITelemetryService = new TelemetryService()
  ) {}

  public getCommunities(query?: ICommunityQuery): Promise<ICommunity[]> {
    const cacheKey = `communities:${JSON.stringify(query || {})}`;
    return this.execute(SERVICE_STRINGS.directoryLoad, () =>
      this.cache.getOrCreate(cacheKey, CACHE_TTL.communities, async () => {
        const filters: string[] = [];
        if (query?.serviceFamily) {
          filters.push(`ServiceFamily eq '${escapeOData(query.serviceFamily)}'`);
        }
        filters.push(query?.status
          ? `Status eq '${escapeOData(query.status)}'`
          : "Status ne 'Retired'");

        const communitiesQuery = this.sp.web.lists.getByTitle(LISTS.communities).items
          .select(...COMMUNITY_SELECT)
          .expand('Author', 'Editor')
          .filter(filters.join(' and '))
          .orderBy('Title', true)
          .top(PAGE_SIZE);
        const chartersQuery = this.sp.web.lists.getByTitle(LISTS.charters).items
          .select('Id', 'Community/Id', 'Status')
          .expand('Community')
          .filter("Status eq 'Signed off'")
          .top(PAGE_SIZE);

        const [rawCommunities, signedCharters] = await Promise.all([
          this.getPaged<ISharePointCommunity>(communitiesQuery),
          this.getPaged<ISharePointCharter>(chartersQuery)
        ]);
        const publishedIds = new Set(signedCharters.map((item) => mapCharter(item).CommunityId));
        const published = rawCommunities.map(mapCommunity).filter((item) => publishedIds.has(item.Id));
        return filterCommunities(published, query);
      })
    );
  }

  public getCommunity(id: number): Promise<ICommunity | undefined> {
    return this.execute(SERVICE_STRINGS.communityLoad, () =>
      this.cache.getOrCreate(`community:${id}`, CACHE_TTL.communities, async () => {
        try {
          const raw = await this.sp.web.lists.getByTitle(LISTS.communities).items.getById(id)
            .select(...COMMUNITY_SELECT)
            .expand('Author', 'Editor')() as ISharePointCommunity;
          return mapCommunity(raw);
        } catch (error: unknown) {
          const portalError = toPortalError(error);
          if (portalError.kind === 'NotFound') {
            return undefined;
          }
          throw portalError;
        }
      })
    );
  }

  public getCommunityDetail(id: number): Promise<ICommunityDetailData | undefined> {
    return this.execute(SERVICE_STRINGS.detailLoad, () =>
      this.cache.getOrCreate(`community-detail:${id}`, CACHE_TTL.records, async () => {
        const [batchedSP, executeBatch] = this.sp.batched();
        const communityRequest = batchedSP.web.lists.getByTitle(LISTS.communities).items.getById(id)
          .select(...COMMUNITY_SELECT)
          .expand('Author', 'Editor')() as Promise<ISharePointCommunity>;
        const rolesRequest = batchedSP.web.lists.getByTitle(LISTS.roles).items
          .select(...ROLE_SELECT)
          .expand('Community', 'Person', 'Author', 'Editor')
          .filter(`CommunityId eq ${id}`)
          .orderBy('Role', true)
          .top(1000)() as Promise<ISharePointRole[]>;
        const ipRequest = batchedSP.web.lists.getByTitle(LISTS.ipCatalog).items
          .select(...IP_SELECT)
          .expand('OwningCommunity', 'Author', 'Editor')
          .filter(`OwningCommunityId eq ${id}`)
          .orderBy('Title', true)
          .top(1000)() as Promise<ISharePointIPItem[]>;

        await executeBatch();
        try {
          const [community, roles, ipCatalog] = await Promise.all([
            communityRequest,
            rolesRequest,
            ipRequest
          ]);
          return {
            community: mapCommunity(community),
            roles: roles.map(mapRole),
            ipCatalog: ipCatalog.map(mapIPItem)
          };
        } catch (error: unknown) {
          const portalError = toPortalError(error);
          if (portalError.kind === 'NotFound') {
            return undefined;
          }
          throw portalError;
        }
      })
    );
  }

  public getRoles(communityId?: number): Promise<ICommunityRole[]> {
    const key = communityId === undefined ? 'roles:all' : `roles:${communityId}`;
    return this.execute(SERVICE_STRINGS.rolesLoad, () =>
      this.cache.getOrCreate(key, CACHE_TTL.roles, async () => {
        let query = this.sp.web.lists.getByTitle(LISTS.roles).items
          .select(...ROLE_SELECT)
          .expand('Community', 'Person', 'Author', 'Editor')
          .orderBy('Role', true)
          .top(PAGE_SIZE);
        if (communityId !== undefined) {
          query = query.filter(`CommunityId eq ${communityId}`);
        }
        return (await this.getPaged<ISharePointRole>(query)).map(mapRole);
      })
    );
  }

  public getCharter(communityId: number): Promise<ICharter | undefined> {
    return this.execute(SERVICE_STRINGS.charterLoad, () =>
      this.cache.getOrCreate(`charter:${communityId}`, CACHE_TTL.records, async () => {
        const query = this.sp.web.lists.getByTitle(LISTS.charters).items
          .select(...CHARTER_SELECT)
          .expand(
            'Community', 'SignOffLead', 'SignOffPM', 'SignOffFamilyOwner',
            'Author', 'Editor'
          )
          .filter(`CommunityId eq ${communityId}`)
          .top(2);
        const items = await this.getPaged<ISharePointCharter>(query);
        if (items.length > 1) {
          throw new PortalError('Conflict', 'More than one charter exists for this community.');
        }
        return items[0] ? mapCharter(items[0]) : undefined;
      })
    );
  }

  public getIPCatalog(communityId?: number): Promise<IIPCatalogItem[]> {
    const key = communityId === undefined ? 'ip-catalog:all' : `ip-catalog:${communityId}`;
    return this.execute(SERVICE_STRINGS.ipCatalogLoad, () =>
      this.cache.getOrCreate(key, CACHE_TTL.records, async () => {
        let query = this.sp.web.lists.getByTitle(LISTS.ipCatalog).items
          .select(...IP_SELECT)
          .expand('OwningCommunity', 'Author', 'Editor')
          .orderBy('Title', true)
          .top(PAGE_SIZE);
        if (communityId !== undefined) {
          query = query.filter(`OwningCommunityId eq ${communityId}`);
        }
        return (await this.getPaged<ISharePointIPItem>(query)).map(mapIPItem);
      })
    );
  }

  public getHealthMetrics(communityId?: number): Promise<IHealthMetric[]> {
    const key = communityId === undefined ? 'metrics:all' : `metrics:${communityId}`;
    return this.execute(SERVICE_STRINGS.metricsLoad, () =>
      this.cache.getOrCreate(key, CACHE_TTL.records, async () => {
        let query = this.sp.web.lists.getByTitle(LISTS.healthMetrics).items
          .select(...METRIC_SELECT)
          .expand('Community', 'Author', 'Editor')
          .orderBy('Period', true)
          .top(PAGE_SIZE);
        if (communityId !== undefined) {
          query = query.filter(`CommunityId eq ${communityId}`);
        }
        return (await this.getPaged<ISharePointHealthMetric>(query)).map(mapHealthMetric);
      })
    );
  }

  public getForumRetirement(): Promise<IForumRetirementItem[]> {
    return this.execute(SERVICE_STRINGS.retirementLoad, () =>
      this.cache.getOrCreate('retirement:all', CACHE_TTL.records, async () => {
        const query = this.sp.web.lists.getByTitle(LISTS.forumRetirement).items
          .select(...RETIREMENT_SELECT)
          .expand('TargetCommunity', 'Author', 'Editor')
          .orderBy('Title', true)
          .top(PAGE_SIZE);
        return (await this.getPaged<ISharePointRetirementItem>(query)).map(mapRetirementItem);
      })
    );
  }

  public saveCharter(charter: ICharter): Promise<ICharter> {
    return this.execute(SERVICE_STRINGS.charterSave, async () => {
      const validation = validateCharter(charter);
      if (validation.length > 0) {
        throw new PortalError('Conflict', validation.join(' '));
      }

      const existing = await this.getCharter(charter.CommunityId);
      if (existing && charter.Id !== existing.Id) {
        throw new PortalError('Conflict', SERVICE_STRINGS.duplicateCharter);
      }
      if (!existing && charter.Status !== 'Draft') {
        throw new PortalError('Conflict', SERVICE_STRINGS.charterMustStartDraft);
      }
      if (existing?.Status === 'Signed off') {
        throw new PortalError('Conflict', SERVICE_STRINGS.charterReadOnly);
      }
      if (existing && !canTransitionCharter(existing.Status, charter.Status)) {
        throw new PortalError('Conflict', SERVICE_STRINGS.charterTransition(existing.Status, charter.Status));
      }

      const payload = this.charterPayload(charter);
      if (existing) {
        await this.sp.web.lists.getByTitle(LISTS.charters).items.getById(existing.Id).update(payload);
      } else {
        await this.sp.web.lists.getByTitle(LISTS.charters).items.add(payload);
      }
      this.invalidateCharter(charter.CommunityId);
      const saved = await this.getCharter(charter.CommunityId);
      if (!saved) {
        throw new PortalError('Unknown', SERVICE_STRINGS.charterReload);
      }
      this.telemetry.track('CharterTransition', 'Success', charter.CommunityId, charter.Status);
      return saved;
    });
  }

  public async setCharterStatus(communityId: number, status: CharterStatus): Promise<void> {
    const charter = await this.getCharter(communityId);
    if (!charter) {
      throw new PortalError('NotFound', SERVICE_STRINGS.charterMissing);
    }
    await this.saveCharter({ ...charter, Status: status });
  }

  public upsertRole(role: ICommunityRole): Promise<ICommunityRole> {
    return this.execute(SERVICE_STRINGS.roleSave, async () => {
      if (requiresTimeZone(role) && !role.TimeZone) {
        throw new PortalError('Conflict', SERVICE_STRINGS.ownerTimeZone);
      }
      const payload: Record<string, unknown> = {
        CommunityId: role.CommunityId,
        PersonId: personId(role.Person),
        Role: role.Role,
        TimeZone: role.TimeZone,
        SourceOrg: role.SourceOrg,
        Active: role.Active
      };
      let id = role.Id;
      if (id > 0) {
        await this.sp.web.lists.getByTitle(LISTS.roles).items.getById(id).update(payload);
      } else {
        id = addResultId(await this.sp.web.lists.getByTitle(LISTS.roles).items.add(payload));
      }
      this.cache.removeByPrefix('roles:');
      this.cache.remove(`community-detail:${role.CommunityId}`);
      const saved = (await this.getRoles(role.CommunityId)).find((item) => item.Id === id);
      if (!saved) {
        throw new PortalError('Unknown', SERVICE_STRINGS.roleReload);
      }
      return saved;
    });
  }

  public upsertHealthMetric(metric: IHealthMetric): Promise<IHealthMetric> {
    return this.execute(SERVICE_STRINGS.metricSave, async () => {
      if (!Number.isFinite(metric.Value)) {
        throw new PortalError('Conflict', SERVICE_STRINGS.metricNumeric);
      }
      const existingMetrics = await this.getHealthMetrics(metric.CommunityId);
      const duplicate = existingMetrics.find((item) =>
        item.Measure === metric.Measure && item.Period === metric.Period
      );
      if (metric.IsBaseline) {
        const otherBaseline = existingMetrics.find((item) =>
          item.Measure === metric.Measure && item.IsBaseline && item.Id !== metric.Id
        );
        if (otherBaseline) {
          throw new PortalError('Conflict', SERVICE_STRINGS.baselineExists);
        }
      }

      const payload: Record<string, unknown> = {
        CommunityId: metric.CommunityId,
        Measure: metric.Measure,
        Period: metric.Period,
        Value: metric.Value,
        Unit: metric.Unit,
        IsBaseline: metric.IsBaseline,
        Commentary: metric.Commentary
      };
      let id = metric.Id || duplicate?.Id || 0;
      if (id > 0) {
        await this.sp.web.lists.getByTitle(LISTS.healthMetrics).items.getById(id).update(payload);
      } else {
        id = addResultId(await this.sp.web.lists.getByTitle(LISTS.healthMetrics).items.add(payload));
      }
      this.cache.removeByPrefix('metrics:');
      const saved = (await this.getHealthMetrics(metric.CommunityId)).find((item) => item.Id === id);
      if (!saved) {
        throw new PortalError('Unknown', SERVICE_STRINGS.metricReload);
      }
      this.telemetry.track('MetricUpdate', 'Success', metric.CommunityId, metric.Measure);
      return saved;
    });
  }

  public upsertForumRetirement(item: IForumRetirementItem): Promise<IForumRetirementItem> {
    return this.execute(SERVICE_STRINGS.retirementSave, async () => {
      if (!item.Title.trim() || item.TargetCommunityId <= 0) {
        throw new PortalError('Conflict', SERVICE_STRINGS.retirementRequired);
      }
      const payload: Record<string, unknown> = {
        Title: item.Title.trim(),
        Disposition: item.Disposition,
        TargetCommunityId: item.TargetCommunityId,
        CompletionDate: item.CompletionDate || null
      };
      let id = item.Id;
      if (id > 0) {
        await this.sp.web.lists.getByTitle(LISTS.forumRetirement).items.getById(id).update(payload);
      } else {
        id = addResultId(await this.sp.web.lists.getByTitle(LISTS.forumRetirement).items.add(payload));
      }
      this.cache.removeByPrefix('retirement:');
      const saved = (await this.getForumRetirement()).find((entry) => entry.Id === id);
      if (!saved) {
        throw new PortalError('Unknown', SERVICE_STRINGS.retirementReload);
      }
      this.telemetry.track('RetirementUpdate', 'Success', item.TargetCommunityId, item.Disposition);
      return saved;
    });
  }

  private async getPaged<T>(query: unknown): Promise<T[]> {
    const result: T[] = [];
    const pagedQuery = query as IAsyncPageQuery<T>;
    for await (const page of pagedQuery) {
      result.push(...page);
    }
    return result;
  }

  private charterPayload(charter: ICharter): Record<string, unknown> {
    return {
      CommunityId: charter.CommunityId,
      InteractionModel: charter.InteractionModel,
      Cadence: charter.Cadence,
      ReadinessPlan: charter.ReadinessPlan,
      LaunchReadiness: { results: charter.LaunchReadiness },
      Status: charter.Status,
      SignOffLeadId: personId(charter.SignOffLead),
      SignOffLeadDate: charter.SignOffLeadDate || null,
      SignOffPMId: personId(charter.SignOffPM),
      SignOffPMDate: charter.SignOffPMDate || null,
      SignOffFamilyOwnerId: personId(charter.SignOffFamilyOwner),
      SignOffFamilyOwnerDate: charter.SignOffFamilyOwnerDate || null,
      CharterVersion: charter.CharterVersion
    };
  }

  private invalidateCharter(communityId: number): void {
    this.cache.remove(`charter:${communityId}`);
    this.cache.removeByPrefix('communities:');
  }

  private async execute<T>(message: string, operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error: unknown) {
      throw toPortalError(error, message);
    }
  }
}
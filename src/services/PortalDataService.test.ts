import { describe, expect, it } from '@jest/globals';
import type { SPFI } from '@pnp/sp';
import { ICharter, ICommunityRole, IHealthMetric } from '../models';
import { CacheService } from './CacheService';
import { addResultId, PortalDataService } from './PortalDataService';
import { PortalError } from './PortalError';

type ItemRecord = Record<string, unknown> & { Id: number };

interface IListStore {
  items: ItemRecord[];
  filters: string[];
  reads: number;
}

interface ICollectionQuery {
  (): Promise<ItemRecord[]>;
  select(...fields: string[]): ICollectionQuery;
  expand(...fields: string[]): ICollectionQuery;
  filter(value: string): ICollectionQuery;
  orderBy(field: string, ascending?: boolean): ICollectionQuery;
  top(value: number): ICollectionQuery;
  getById(id: number): IItemQuery;
  add(payload: Record<string, unknown>): Promise<unknown>;
  [Symbol.asyncIterator](): AsyncIterator<ItemRecord[]>;
}

interface IItemQuery {
  (): Promise<ItemRecord>;
  select(...fields: string[]): IItemQuery;
  expand(...fields: string[]): IItemQuery;
  update(payload: Record<string, unknown>): Promise<void>;
}

function lookupId(item: ItemRecord, fieldName: string): number {
  const direct = Number(item[`${fieldName}Id`]);
  if (direct > 0) {
    return direct;
  }
  return Number((item[fieldName] as { Id?: number } | undefined)?.Id || 0);
}

function filterItems(items: ItemRecord[], expression: string | undefined): ItemRecord[] {
  if (!expression) {
    return items;
  }
  return items.filter((item) => {
    const lookup = /(Community|OwningCommunity|TargetCommunity)Id eq (\d+)/.exec(expression);
    if (lookup && lookupId(item, lookup[1]) !== Number(lookup[2])) {
      return false;
    }
    const statusEquals = /Status eq '([^']+)'/.exec(expression);
    if (statusEquals && item.Status !== statusEquals[1]) {
      return false;
    }
    if (expression.indexOf("Status ne 'Retired'") >= 0 && item.Status === 'Retired') {
      return false;
    }
    const family = /ServiceFamily eq '([^']+)'/.exec(expression);
    return !family || item.ServiceFamily === family[1];
  });
}

function applyPayload(item: ItemRecord, payload: Record<string, unknown>): void {
  const lookupFields: Record<string, string> = {
    CommunityId: 'Community',
    OwningCommunityId: 'OwningCommunity',
    TargetCommunityId: 'TargetCommunity',
    PersonId: 'Person',
    SignOffLeadId: 'SignOffLead',
    SignOffPMId: 'SignOffPM',
    SignOffSMEId: 'SignOffSME'
  };
  Object.keys(payload).forEach((key) => {
    const value = payload[key];
    item[key] = value;
    const lookupField = lookupFields[key];
    if (lookupField) {
      item[lookupField] = value
        ? { Id: Number(value), Title: `Person ${value}`, EMail: `person${value}@example.com` }
        : undefined;
    }
  });
}

function createCollectionQuery(store: IListStore): ICollectionQuery {
  let filter: string | undefined;
  let limit = 500;
  const values = (): ItemRecord[] => filterItems(store.items, filter).slice(0, limit);
  const query = (async (): Promise<ItemRecord[]> => {
    store.reads += 1;
    return values();
  }) as ICollectionQuery;
  query.select = () => query;
  query.expand = () => query;
  query.filter = (value: string) => {
    filter = value;
    store.filters.push(value);
    return query;
  };
  query.orderBy = () => query;
  query.top = (value: number) => {
    limit = value;
    return query;
  };
  query.getById = (id: number): IItemQuery => {
    const itemQuery = (async (): Promise<ItemRecord> => {
      store.reads += 1;
      const item = store.items.find((candidate) => candidate.Id === id);
      if (!item) {
        throw { status: 404 };
      }
      return item;
    }) as IItemQuery;
    itemQuery.select = () => itemQuery;
    itemQuery.expand = () => itemQuery;
    itemQuery.update = async (payload: Record<string, unknown>) => {
      const item = store.items.find((candidate) => candidate.Id === id);
      if (!item) {
        throw { status: 404 };
      }
      applyPayload(item, payload);
    };
    return itemQuery;
  };
  query.add = async (payload: Record<string, unknown>) => {
    const id = Math.max(0, ...store.items.map((item) => item.Id)) + 1;
    const item: ItemRecord = { Id: id };
    applyPayload(item, payload);
    store.items.push(item);
    return { data: { Id: id } };
  };
  query[Symbol.asyncIterator] = (): AsyncIterator<ItemRecord[]> => {
    let complete = false;
    return {
      next: async () => {
        if (complete) {
          return { done: true, value: undefined };
        }
        complete = true;
        store.reads += 1;
        return { done: false, value: values() };
      }
    };
  };
  return query;
}

function createFakeSp(stores: Record<string, IListStore>): SPFI {
  const fakeSp: { web: unknown; batched: () => [unknown, () => Promise<void>] } = {
    web: {
      lists: {
        getByTitle: (title: string) => ({
          get items(): ICollectionQuery {
            return createCollectionQuery(stores[title]);
          }
        })
      }
    },
    batched: () => [fakeSp, async () => undefined]
  };
  return fakeSp as unknown as SPFI;
}

function stores(overrides: Partial<Record<string, ItemRecord[]>> = {}): Record<string, IListStore> {
  const values: Record<string, ItemRecord[]> = {
    Communities: [],
    'Community Roles': [],
    Charters: [],
    'IP Catalog': [],
    'Health Metrics': [],
    'Forum Retirement': [],
    ...overrides
  };
  return Object.fromEntries(Object.entries(values).map(([title, items]) => [
    title,
    { items, filters: [], reads: 0 }
  ]));
}

function service(listStores: Record<string, IListStore>): PortalDataService {
  return new PortalDataService(createFakeSp(listStores), new CacheService('data-test', undefined));
}

function draft(overrides: Partial<ICharter> = {}): ICharter {
  return {
    Id: 10,
    CommunityId: 1,
    LaunchReadiness: [],
    Status: 'Draft',
    ...overrides
  };
}

describe('PortalDataService', () => {
  it('publishes only communities with signed-off charters and caches the result', async () => {
    const listStores = stores({
      Communities: [
        { Id: 1, Title: 'Published', ServiceFamily: 'Azure', Status: 'Active', TargetRoles: [] },
        { Id: 2, Title: 'Draft', ServiceFamily: 'Azure', Status: 'Active', TargetRoles: [] }
      ],
      Charters: [
        { Id: 10, Community: { Id: 1 }, Status: 'Signed off', LaunchReadiness: [] },
        { Id: 11, Community: { Id: 2 }, Status: 'Draft', LaunchReadiness: [] }
      ]
    });
    const data = service(listStores);
    await expect(data.getCommunities()).resolves.toEqual([
      expect.objectContaining({ Id: 1, Title: 'Published' })
    ]);
    const reads = listStores.Communities.reads + listStores.Charters.reads;
    await data.getCommunities();
    expect(listStores.Communities.reads + listStores.Charters.reads).toBe(reads);
    expect(listStores.Charters.filters).toContain("Status eq 'Signed off'");
  });

  it('moves a saved charter from Draft to In review', async () => {
    const listStores = stores({
      Charters: [{ Id: 10, Community: { Id: 1 }, Status: 'Draft', LaunchReadiness: [] }]
    });
    const saved = await service(listStores).saveCharter(draft({ Status: 'In review' }));
    expect(saved.Status).toBe('In review');
    expect(listStores.Charters.items[0].Status).toBe('In review');
  });

  it('rejects an invalid direct Draft to Signed off transition', async () => {
    const listStores = stores({
      Charters: [{ Id: 10, Community: { Id: 1 }, Status: 'Draft', LaunchReadiness: [] }]
    });
    await expect(service(listStores).saveCharter(draft({ Status: 'Signed off' })))
      .rejects.toEqual(expect.objectContaining({ kind: 'Conflict' }));
  });

  it('saves a nomination-based Subject Matter Expert assignment', async () => {
    const listStores = stores({ 'Community Roles': [] });
    const role: ICommunityRole = {
      Id: 0,
      CommunityId: 1,
      Person: { id: 2, displayName: 'Expert' },
      Role: 'Subject Matter Expert',
      SourceOrg: 'Delivery',
      Active: true
    };
    const saved = await service(listStores).upsertRole(role);
    expect(saved.Role).toBe('Subject Matter Expert');
  });

  it('rejects a second baseline for the same community and measure', async () => {
    const listStores = stores({
      'Health Metrics': [{
        Id: 1,
        Community: { Id: 1 },
        Measure: 'Participation',
        Period: 'Baseline',
        Value: 45,
        Unit: 'Percent',
        IsBaseline: true
      }]
    });
    const metric: IHealthMetric = {
      Id: 0,
      CommunityId: 1,
      Measure: 'Participation',
      Period: 'Q2 FY27',
      Value: 50,
      Unit: 'Percent',
      IsBaseline: true
    };
    await expect(service(listStores).upsertHealthMetric(metric))
      .rejects.toEqual(expect.objectContaining({ kind: 'Conflict' }));
  });
});

describe('addResultId', () => {
  it('reads PnP add result IDs and rejects missing IDs', () => {
    expect(addResultId({ data: { Id: 7 } })).toBe(7);
    expect(() => addResultId({})).toThrow(PortalError);
  });
});
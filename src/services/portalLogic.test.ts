// Runs under the SPFx Jest harness (installed with the scaffold). Until `npm install`,
// only the '@jest/globals' import is unresolved; the assertions below are complete.
import { describe, it, expect } from '@jest/globals';
import {
  filterCommunities,
  isCharterSignedOff,
  isCharterFullySignedOff,
  canTransitionCharter,
  validateCharter,
  requiresTimeZone,
  timeZoneCoverageGaps,
  baselineValue,
  deltaFromBaseline,
  reductionProgress
} from './portalLogic';
import {
  ICommunity,
  ICharter,
  ICommunityRole,
  IHealthMetric,
  IForumRetirementItem,
  IPersonRef
} from '../models';

const person = (id: number): IPersonRef => ({ id, displayName: 'Person ' + id });

const community = (over: Partial<ICommunity>): ICommunity => ({
  Id: 1,
  Title: 'Azure',
  ServiceFamily: 'Cloud & AI',
  TargetRoles: [],
  IsCrossCommunity: false,
  Status: 'Active',
  ...over
});

const charter = (over: Partial<ICharter>): ICharter => ({
  Id: 1,
  CommunityId: 1,
  LaunchReadiness: [],
  Status: 'Draft',
  ...over
});

const role = (over: Partial<ICommunityRole>): ICommunityRole => ({
  Id: 1,
  CommunityId: 1,
  Person: person(1),
  Role: 'Family Owner (SME)',
  SourceOrg: 'Delivery',
  Active: true,
  ...over
});

const metric = (over: Partial<IHealthMetric>): IHealthMetric => ({
  Id: 1,
  CommunityId: 1,
  Measure: 'Participation',
  Period: 'Baseline',
  Value: 0,
  Unit: 'Percent',
  IsBaseline: false,
  ...over
});

describe('filterCommunities', () => {
  const items: ICommunity[] = [
    community({ Id: 1, Title: 'Azure', ServiceFamily: 'Cloud & AI', Status: 'Active', TargetRoles: ['Invited Expert'] }),
    community({ Id: 2, Title: 'Modern-Apps', ServiceFamily: 'Apps', Status: 'Proposed', TargetRoles: ['Community Lead'] })
  ];

  it('returns all when no query', () => {
    expect(filterCommunities(items)).toHaveLength(2);
  });

  it('filters by service family', () => {
    const result = filterCommunities(items, { serviceFamily: 'Apps' });
    expect(result.map((c) => c.Id)).toEqual([2]);
  });

  it('filters by status and role', () => {
    expect(filterCommunities(items, { status: 'Active' }).map((c) => c.Id)).toEqual([1]);
    expect(filterCommunities(items, { role: 'Community Lead' }).map((c) => c.Id)).toEqual([2]);
  });

  it('matches search text against title and scope', () => {
    expect(filterCommunities(items, { searchText: 'azure' }).map((c) => c.Id)).toEqual([1]);
    expect(filterCommunities(items, { searchText: 'nomatch' })).toHaveLength(0);
  });
});

describe('charter gates', () => {
  it('is signed off only when status is Signed off', () => {
    expect(isCharterSignedOff(charter({ Status: 'Signed off' }))).toBe(true);
    expect(isCharterSignedOff(charter({ Status: 'In review' }))).toBe(false);
    expect(isCharterSignedOff(undefined)).toBe(false);
  });

  it('is fully signed off only when all three sign-offs exist', () => {
    expect(isCharterFullySignedOff(charter({
      SignOffLead: person(1),
      SignOffLeadDate: '2026-08-01',
      SignOffPM: person(2),
      SignOffPMDate: '2026-08-02',
      SignOffFamilyOwner: person(3),
      SignOffFamilyOwnerDate: '2026-08-03'
    }))).toBe(true);
    expect(isCharterFullySignedOff(charter({ SignOffLead: person(1), SignOffPM: person(2) }))).toBe(false);
  });

  it('allows only the documented status transitions', () => {
    expect(canTransitionCharter('Draft', 'In review')).toBe(true);
    expect(canTransitionCharter('In review', 'Draft')).toBe(true);
    expect(canTransitionCharter('In review', 'Signed off')).toBe(true);
    expect(canTransitionCharter('Draft', 'Signed off')).toBe(false);
    expect(canTransitionCharter('Signed off', 'Draft')).toBe(false);
  });

  it('requires readiness and dated signatures for final sign-off', () => {
    const signed = charter({
      Status: 'Signed off',
      LaunchReadiness: ['1', '2', '3', '4', '5', '6'],
      SignOffLead: person(1),
      SignOffLeadDate: '2026-08-01',
      SignOffPM: person(2),
      SignOffPMDate: '2026-08-02',
      SignOffFamilyOwner: person(3),
      SignOffFamilyOwnerDate: '2026-08-03'
    });
    expect(validateCharter(signed)).toEqual([]);
    expect(validateCharter({ ...signed, LaunchReadiness: [] })).toContain(
      'Complete all six launch-readiness checks before sign-off.'
    );
  });
});

describe('role coverage', () => {
  it('requires a time zone for Family Owners only', () => {
    expect(requiresTimeZone(role({ Role: 'Family Owner (SME)' }))).toBe(true);
    expect(requiresTimeZone(role({ Role: 'Community Lead' }))).toBe(false);
  });

  it('reports uncovered time zones', () => {
    const roles = [
      role({ Role: 'Family Owner (SME)', TimeZone: 'ATZ', Active: true }),
      role({ Role: 'Family Owner (SME)', TimeZone: 'EMEA', Active: false }), // inactive: not covered
      role({ Role: 'Invited Expert', TimeZone: 'ASIA', Active: true }) // wrong role: not covered
    ];
    expect(timeZoneCoverageGaps(roles, ['ATZ', 'EMEA', 'ASIA'])).toEqual(['EMEA', 'ASIA']);
  });
});

describe('health metrics', () => {
  const metrics: IHealthMetric[] = [
    metric({ Measure: 'Participation', Period: 'Baseline', Value: 50, IsBaseline: true }),
    metric({ Measure: 'Participation', Period: 'Q2 FY27', Value: 62 })
  ];

  it('reads the baseline value', () => {
    expect(baselineValue(metrics, 'Participation')).toBe(50);
    expect(baselineValue(metrics, 'Belonging')).toBeUndefined();
  });

  it('computes the delta from baseline', () => {
    expect(deltaFromBaseline(metrics, 'Participation', 'Q2 FY27')).toBe(12);
    expect(deltaFromBaseline(metrics, 'Participation', 'Q3 FY27')).toBeUndefined();
  });
});

describe('reductionProgress', () => {
  it('counts completed dispositions', () => {
    const items: IForumRetirementItem[] = [
      { Id: 1, Title: 'DL A', Disposition: 'Close', TargetCommunityId: 1, CompletionDate: '2026-07-01' },
      { Id: 2, Title: 'Channel B', Disposition: 'Merge', TargetCommunityId: 1 }
    ];
    expect(reductionProgress(items)).toEqual({ completed: 1, total: 2, ratio: 0.5 });
  });

  it('handles an empty register', () => {
    expect(reductionProgress([])).toEqual({ completed: 0, total: 0, ratio: 0 });
  });
});

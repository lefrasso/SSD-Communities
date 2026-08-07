import {
  ICommunity,
  ICommunityRole,
  ICharter,
  IHealthMetric,
  IForumRetirementItem,
  HealthMeasure,
  HealthPeriod,
  CharterStatus
} from '../models';
import { ICommunityQuery } from './IPortalDataService';
import { SERVICE_STRINGS } from './ServiceStrings';

/** Directory filter (FR-02) — applied client-side after an indexed server query. */
export function filterCommunities(communities: ICommunity[], query?: ICommunityQuery): ICommunity[] {
  if (!query) {
    return communities;
  }
  const text = query.searchText ? query.searchText.trim().toLowerCase() : undefined;
  return communities.filter((c) => {
    if (query.serviceFamily && c.ServiceFamily !== query.serviceFamily) {
      return false;
    }
    if (query.status && c.Status !== query.status) {
      return false;
    }
    if (query.role && (c.TargetRoles || []).indexOf(query.role) === -1) {
      return false;
    }
    if (text) {
      const haystack = [c.Title, c.ServiceFamily, c.ScopeInScope || ''].join(' ').toLowerCase();
      if (haystack.indexOf(text) === -1) {
        return false;
      }
    }
    return true;
  });
}

/** Publication gate (FR-13) — a community is published only once its charter is signed off. */
export function isCharterSignedOff(charter: ICharter | undefined): boolean {
  return !!charter && charter.Status === 'Signed off';
}

/** All three sign-offs present (FR-11): Lead, PM and one nominated SME. */
export function isCharterFullySignedOff(charter: ICharter): boolean {
  return !!(
    charter.SignOffLead && charter.SignOffLeadDate &&
    charter.SignOffPM && charter.SignOffPMDate &&
    charter.SignOffSME && charter.SignOffSMEDate
  );
}

/** The only workflow transitions allowed by the v1 charter state machine. */
export function canTransitionCharter(from: CharterStatus, to: CharterStatus): boolean {
  if (from === to) {
    return true;
  }
  if (from === 'Draft') {
    return to === 'In review';
  }
  if (from === 'In review') {
    return to === 'Draft' || to === 'Signed off';
  }
  return false;
}

/** Returns user-facing validation messages; an empty array means the charter is valid. */
export function validateCharter(charter: ICharter): string[] {
  const errors: string[] = [];
  if (charter.CommunityId <= 0) {
    errors.push(SERVICE_STRINGS.selectCommunity);
  }
  if (charter.Status === 'Signed off') {
    if (charter.LaunchReadiness.length !== 6) {
      errors.push(SERVICE_STRINGS.readinessRequired);
    }
    if (!isCharterFullySignedOff(charter)) {
      errors.push(SERVICE_STRINGS.signOffsRequired);
    }
  }
  return errors;
}

/** The launch baseline value for a measure (FR-19). */
export function baselineValue(metrics: IHealthMetric[], measure: HealthMeasure): number | undefined {
  const baseline = metrics.filter((m) => m.Measure === measure && m.IsBaseline)[0];
  return baseline ? baseline.Value : undefined;
}

/** Movement of a measure at a period versus the baseline (FR-20). */
export function deltaFromBaseline(
  metrics: IHealthMetric[],
  measure: HealthMeasure,
  period: HealthPeriod
): number | undefined {
  const base = baselineValue(metrics, measure);
  const atPeriod = metrics.filter((m) => m.Measure === measure && m.Period === period)[0];
  if (base === undefined || !atPeriod) {
    return undefined;
  }
  return atPeriod.Value - base;
}

/** Forum reduction progress (FR-22) — completed dispositions versus total. */
export function reductionProgress(
  items: IForumRetirementItem[]
): { completed: number; total: number; ratio: number } {
  const total = items.length;
  const completed = items.filter((i) => !!i.CompletionDate).length;
  return { completed: completed, total: total, ratio: total === 0 ? 0 : completed / total };
}

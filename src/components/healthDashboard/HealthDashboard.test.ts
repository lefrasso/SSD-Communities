import { describe, expect, it } from '@jest/globals';
import { IHealthMetric } from '../../models';
import { formatMetricValue } from './HealthDashboard';

const metric: IHealthMetric = {
  Id: 1,
  CommunityId: 1,
  Measure: 'Participation',
  Period: 'Q2 FY27',
  Value: 62,
  Unit: 'Percent',
  IsBaseline: false
};

describe('formatMetricValue', () => {
  it('formats percentages and missing values', () => {
    expect(formatMetricValue(metric)).toBe('62%');
    expect(formatMetricValue(undefined)).toBe('—');
  });
});
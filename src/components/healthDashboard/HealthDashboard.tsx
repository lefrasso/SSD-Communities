import * as React from 'react';
import { Dropdown, IDropdownOption } from '@fluentui/react';
import * as strings from 'PortalStrings';
import {
  HealthMeasure,
  HealthPeriod,
  ICommunity,
  IHealthMetric
} from '../../models';
import {
  baselineValue,
  deltaFromBaseline,
  IPortalDataService,
  IPermissionService,
  ITelemetryService
} from '../../services';
import styles from '../../styles/portal.module.scss';
import { AccessDeniedState, EmptyState, ErrorState, LoadingState } from '../shared/PortalStates';
import { PortalHeader } from '../shared/PortalHeader';
import { useAsyncData } from '../shared/useAsyncData';

export interface IHealthDashboardProps {
  data: IPortalDataService;
  permissions: IPermissionService;
  telemetry: ITelemetryService;
}

interface IHealthDashboardData {
  communities: ICommunity[];
  metrics: IHealthMetric[];
  canView: boolean;
}

const MEASURES: HealthMeasure[] = [
  'Participation',
  'Contribution',
  'Responsiveness',
  'Knowledge reuse',
  'Belonging',
  'Cross-pollination'
];

const PERIODS: HealthPeriod[] = ['Baseline', 'Q2 FY27', 'Q3 FY27', 'Year-end FY27'];

export function formatMetricValue(metric: IHealthMetric | undefined): string {
  if (!metric) {
    return '—';
  }
  if (metric.Unit === 'Percent') {
    return `${metric.Value}%`;
  }
  if (metric.Unit === 'hours') {
    return `${metric.Value}h`;
  }
  return `${metric.Value} ${metric.Unit}`;
}

function deltaClass(delta: number | undefined): string {
  if (delta === undefined || delta === 0) {
    return styles.deltaNeutral;
  }
  return delta > 0 ? styles.deltaPositive : styles.deltaNegative;
}

export function HealthDashboard(props: IHealthDashboardProps): React.ReactElement {
  const loaded = useAsyncData<IHealthDashboardData>(async () => {
    const [communities, metrics, capabilities] = await Promise.all([
      props.data.getCommunities(),
      props.data.getHealthMetrics(),
      props.permissions.getCapabilities()
    ]);
    return { communities, metrics, canView: capabilities.canViewDashboard };
  }, [props.data, props.permissions]);
  const [period, setPeriod] = React.useState<HealthPeriod>('Q2 FY27');
  const [communityId, setCommunityId] = React.useState<number>();

  React.useEffect(() => {
    props.telemetry.track('PageView', 'Success', undefined, 'HealthDashboard');
  }, [props.telemetry]);

  if (loaded.loading) {
    return <div className={styles.portal}><LoadingState /></div>;
  }
  if (loaded.error) {
    return <div className={styles.portal}><ErrorState error={loaded.error} retry={loaded.reload} /></div>;
  }
  if (!loaded.data?.canView) {
    return <div className={styles.portal}><AccessDeniedState /></div>;
  }

  const communities = communityId
    ? loaded.data.communities.filter((community) => community.Id === communityId)
    : loaded.data.communities;
  const periodOptions: IDropdownOption[] = PERIODS.map((value) => ({ key: value, text: value }));
  const communityOptions: IDropdownOption[] = [
    { key: 0, text: strings.PortfolioLabel },
    ...loaded.data.communities.map((community) => ({ key: community.Id, text: community.Title }))
  ];

  return (
    <main className={styles.portal}>
      <PortalHeader title={strings.HealthTitle} subtitle={strings.HealthSubtitle} />
      <div className={styles.metricControls}>
        <Dropdown
          label={strings.PeriodLabel}
          selectedKey={period}
          options={periodOptions}
          onChange={(_, option) => setPeriod(option?.key as HealthPeriod)}
        />
        <Dropdown
          label={strings.CommunityFilterLabel}
          selectedKey={communityId || 0}
          options={communityOptions}
          onChange={(_, option) => setCommunityId(Number(option?.key) || undefined)}
        />
      </div>

      {communities.length === 0 ? (
        <EmptyState title={strings.NoCommunitiesTitle} message={strings.NoCommunitiesMessage} />
      ) : communities.map((community) => {
        const communityMetrics = loaded.data?.metrics.filter((metric) => metric.CommunityId === community.Id) || [];
        return (
          <section className={styles.communityMetrics} key={community.Id} aria-labelledby={`health-${community.Id}`}>
            <h3 id={`health-${community.Id}`}>{community.Title}</h3>
            <div className={styles.metricGrid}>
              {MEASURES.map((measure) => {
                const metric = communityMetrics.find((item) => item.Measure === measure && item.Period === period);
                const baseline = baselineValue(communityMetrics, measure);
                const delta = deltaFromBaseline(communityMetrics, measure, period);
                const deltaText = delta === undefined ? '—' : `${delta > 0 ? '+' : ''}${delta}`;
                return (
                  <article className={styles.metricTile} key={measure} tabIndex={0}>
                    <div className={styles.metricName}>{measure}</div>
                    <div className={styles.metricValue}>{formatMetricValue(metric)}</div>
                    <div className={styles.muted}>
                      {strings.BaselineLabel}: {baseline === undefined ? '—' : baseline}
                    </div>
                    <div className={deltaClass(delta)}>
                      {strings.DeltaLabel}: {deltaText}
                    </div>
                    {metric?.Commentary && <div className={styles.commentary}>{metric.Commentary}</div>}
                    {!metric && <div className={styles.commentary}>{strings.NoMetricsLabel}</div>}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}
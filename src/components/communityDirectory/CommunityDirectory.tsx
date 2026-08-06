import * as React from 'react';
import {
  DefaultButton,
  Dropdown,
  IDropdownOption,
  SearchBox
} from '@fluentui/react';
import * as strings from 'PortalStrings';
import { CommunityStatus, ICommunity } from '../../models';
import {
  filterCommunities,
  IPortalDataService,
  ITelemetryService
} from '../../services';
import styles from '../../styles/portal.module.scss';
import { EmptyState, ErrorState, LoadingState } from '../shared/PortalStates';
import { PortalHeader } from '../shared/PortalHeader';
import { useAsyncData } from '../shared/useAsyncData';

export interface ICommunityDirectoryProps {
  data: IPortalDataService;
  telemetry: ITelemetryService;
  detailPageUrl: string;
}

const STATUS_OPTIONS: CommunityStatus[] = ['Proposed', 'Chartered', 'Active', 'Merged', 'Retired'];

function uniqueOptions(values: string[]): IDropdownOption[] {
  return Array.from(new Set(values.filter(Boolean)))
    .sort((left, right) => left.localeCompare(right))
    .map((value) => ({ key: value, text: value }));
}

export function buildCommunityDetailUrl(baseUrl: string, communityId: number): string {
  const target = baseUrl.trim() || window.location.pathname;
  return `${target}${target.indexOf('?') >= 0 ? '&' : '?'}communityId=${communityId}`;
}

export function CommunityDirectory(props: ICommunityDirectoryProps): React.ReactElement {
  const communities = useAsyncData(() => props.data.getCommunities(), [props.data]);
  const [searchText, setSearchText] = React.useState('');
  const [serviceFamily, setServiceFamily] = React.useState<string>();
  const [targetRole, setTargetRole] = React.useState<string>();
  const [status, setStatus] = React.useState<CommunityStatus>();

  React.useEffect(() => {
    props.telemetry.track('PageView', 'Success', undefined, 'CommunityDirectory');
  }, [props.telemetry]);

  if (communities.loading) {
    return <div className={styles.portal}><LoadingState /></div>;
  }
  if (communities.error) {
    return <div className={styles.portal}><ErrorState error={communities.error} retry={communities.reload} /></div>;
  }

  const allCommunities = communities.data || [];
  const visible = filterCommunities(allCommunities, {
    searchText,
    serviceFamily,
    role: targetRole,
    status
  });
  const familyOptions: IDropdownOption[] = [
    { key: '', text: strings.AllFamiliesLabel },
    ...uniqueOptions(allCommunities.map((community) => community.ServiceFamily))
  ];
  const roleOptions: IDropdownOption[] = [
    { key: '', text: strings.AllRolesLabel },
    ...uniqueOptions(allCommunities.reduce<string[]>((values, community) =>
      values.concat(community.TargetRoles || []), []))
  ];
  const statusOptions: IDropdownOption[] = [
    { key: '', text: strings.AllStatusesLabel },
    ...STATUS_OPTIONS.map((value) => ({ key: value, text: value }))
  ];

  return (
    <main className={styles.portal}>
      <PortalHeader title={strings.DirectoryTitle} subtitle={strings.DirectorySubtitle} />
      <div className={styles.toolbar} role="search" aria-label={strings.DirectoryTitle}>
        <SearchBox
          placeholder={strings.SearchPlaceholder}
          value={searchText}
          onChange={(_, value) => setSearchText(value || '')}
        />
        <Dropdown
          label={strings.FamilyFilterLabel}
          selectedKey={serviceFamily || ''}
          options={familyOptions}
          onChange={(_, option) => setServiceFamily(String(option?.key || '') || undefined)}
        />
        <Dropdown
          label={strings.RoleFilterLabel}
          selectedKey={targetRole || ''}
          options={roleOptions}
          onChange={(_, option) => setTargetRole(String(option?.key || '') || undefined)}
        />
        <Dropdown
          label={strings.StatusFilterLabel}
          selectedKey={status || ''}
          options={statusOptions}
          onChange={(_, option) => setStatus((String(option?.key || '') || undefined) as CommunityStatus | undefined)}
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState title={strings.NoCommunitiesTitle} message={strings.NoCommunitiesMessage} iconName="SearchIssue" />
      ) : (
        <div className={styles.cardGrid} aria-live="polite">
          {visible.map((community: ICommunity) => (
            <article className={styles.card} key={community.Id}>
              <div className={styles.cardAccent} />
              <div className={styles.cardBody}>
                <div className={styles.cardMeta}>{community.ServiceFamily}</div>
                <h3 className={styles.cardTitle}>{community.Title}</h3>
                <p className={styles.cardText}>{community.ScopeInScope || strings.EmptyValue}</p>
                <div className={styles.cardFooter}>
                  <div className={styles.buttonRow}>
                    <span className={styles.statusBadge}>{community.Status}</span>
                    {community.IsCrossCommunity && <span className={styles.badge}>{strings.CrossCommunityLabel}</span>}
                  </div>
                  <DefaultButton
                    href={buildCommunityDetailUrl(props.detailPageUrl, community.Id)}
                    text={strings.ViewCommunityLabel}
                    ariaLabel={`${strings.ViewCommunityLabel}: ${community.Title}`}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
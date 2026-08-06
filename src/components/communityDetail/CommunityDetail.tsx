import * as React from 'react';
import {
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  Link,
  MessageBar,
  MessageBarType,
  PrimaryButton
} from '@fluentui/react';
import * as strings from 'PortalStrings';
import { ICommunity, ICommunityRole } from '../../models';
import {
  ICommunityDetailData,
  IGraphService,
  IPortalDataService,
  isPortalError,
  ITelemetryService,
  timeZoneCoverageGaps
} from '../../services';
import styles from '../../styles/portal.module.scss';
import { EmptyState, ErrorState, LoadingState } from '../shared/PortalStates';
import { PortalHeader } from '../shared/PortalHeader';
import { useAsyncData } from '../shared/useAsyncData';

export interface ICommunityDetailProps {
  communityId: number;
  expectedTimeZones: string[];
  data: IPortalDataService;
  graph: IGraphService;
  telemetry: ITelemetryService;
}

interface IDetailState {
  detail?: ICommunityDetailData;
  joined: boolean;
}

const ROLE_ORDER: Record<ICommunityRole['Role'], number> = {
  'Community Lead': 0,
  'Family Owner (SME)': 1,
  'Invited Expert': 2
};

export function sortCommunityRoles(roles: ICommunityRole[]): ICommunityRole[] {
  return roles.slice().sort((left, right) => {
    const roleDifference = ROLE_ORDER[left.Role] - ROLE_ORDER[right.Role];
    if (roleDifference !== 0) {
      return roleDifference;
    }
    const zoneDifference = (left.TimeZone || '').localeCompare(right.TimeZone || '');
    return zoneDifference !== 0
      ? zoneDifference
      : left.Person.displayName.localeCompare(right.Person.displayName);
  });
}

export function CommunityDetail(props: ICommunityDetailProps): React.ReactElement {
  const loaded = useAsyncData<IDetailState>(async () => {
    const detail = props.communityId > 0
      ? await props.data.getCommunityDetail(props.communityId)
      : undefined;
    const groupId = detail?.community.VivaEngageGroupId;
    const joined = !!(groupId && props.graph.membershipEnabled &&
      await props.graph.getMembershipState(groupId));
    return { detail, joined };
  }, [props.communityId, props.data, props.graph]);
  const [joined, setJoined] = React.useState(false);
  const [joining, setJoining] = React.useState(false);
  const [joinError, setJoinError] = React.useState<unknown>();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  React.useEffect(() => {
    if (loaded.data) {
      setJoined(loaded.data.joined);
    }
  }, [loaded.data]);

  React.useEffect(() => {
    if (props.communityId > 0) {
      props.telemetry.track('PageView', 'Success', props.communityId, 'CommunityDetail');
    }
  }, [props.communityId, props.telemetry]);

  if (loaded.loading) {
    return <div className={styles.portal}><LoadingState /></div>;
  }
  if (loaded.error) {
    return <div className={styles.portal}><ErrorState error={loaded.error} retry={loaded.reload} /></div>;
  }
  if (!loaded.data?.detail) {
    return (
      <div className={styles.portal}>
        <EmptyState title={strings.NoCommunitiesTitle} message={strings.NoCommunitiesMessage} />
      </div>
    );
  }

  const detail = loaded.data.detail;
  const community = detail.community;
  const roles = sortCommunityRoles(detail.roles.filter((role) => role.Active));
  const coverageGaps = timeZoneCoverageGaps(roles, props.expectedTimeZones);
  const groupConfigured = !!community.VivaEngageGroupId;

  const joinNow = async (): Promise<void> => {
    if (!community.VivaEngageGroupId) {
      return;
    }
    setConfirmOpen(false);
    setJoining(true);
    setJoinError(undefined);
    try {
      await props.graph.joinGroup(community.VivaEngageGroupId);
      setJoined(true);
    } catch (error: unknown) {
      setJoinError(error);
    } finally {
      setJoining(false);
    }
  };

  const beginJoin = async (): Promise<void> => {
    setJoinError(undefined);
    try {
      const communities = await props.data.getCommunities();
      const candidates = communities.filter((candidate: ICommunity) =>
        candidate.Id !== community.Id && !!candidate.VivaEngageGroupId
      );
      const membership = await Promise.all(candidates.map(async (candidate) => ({
        candidate,
        joined: await props.graph.getMembershipState(candidate.VivaEngageGroupId as string)
      })));
      if (membership.some((entry) => entry.joined)) {
        setConfirmOpen(true);
        return;
      }
      await joinNow();
    } catch (error: unknown) {
      setJoinError(error);
    }
  };

  const joinMessage = joinError
    ? isPortalError(joinError) ? joinError.userMessage : strings.JoinFailedMessage
    : undefined;

  return (
    <main className={styles.portal}>
      <PortalHeader
        eyebrow={community.ServiceFamily}
        title={community.Title}
        subtitle={strings.DetailSubtitle}
        aside={<span className={styles.statusBadge}>{community.Status}</span>}
      />

      {joinMessage && (
        <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setJoinError(undefined)}>
          {joinMessage}
        </MessageBar>
      )}

      <section className={styles.section} aria-labelledby="scope-heading">
        <h3 id="scope-heading" className={styles.sectionTitle}>{strings.InScopeLabel}</h3>
        <div className={styles.twoColumn}>
          <div className={styles.surface}>
            <strong>{strings.InScopeLabel}</strong>
            <p className={styles.muted}>{community.ScopeInScope || strings.EmptyValue}</p>
          </div>
          <div className={styles.surface}>
            <strong>{strings.OutOfScopeLabel}</strong>
            <p className={styles.muted}>{community.ScopeOutOfScope || strings.EmptyValue}</p>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="roles-heading">
        <h3 id="roles-heading" className={styles.sectionTitle}>{strings.RolesTitle}</h3>
        <div className={styles.twoColumn}>
          <div className={styles.surface}>
            {roles.length === 0 ? <p className={styles.muted}>{strings.NoRolesLabel}</p> : (
              <ul className={styles.roleList}>
                {roles.map((role) => (
                  <li className={styles.roleItem} key={role.Id}>
                    <strong>{role.Person.displayName}</strong>
                    <span>{role.Role}</span>
                    <span className={styles.muted}>{role.TimeZone || role.SourceOrg}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={`${styles.coverage} ${coverageGaps.length > 0 ? styles.coverageWarning : ''}`}>
            <strong>{strings.CoverageTitle}</strong>
            <p className={styles.muted}>
              {coverageGaps.length === 0
                ? strings.CoverageCompleteLabel
                : `${strings.CoverageGapLabel}: ${coverageGaps.join(', ')}`}
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="ip-heading">
        <h3 id="ip-heading" className={styles.sectionTitle}>{strings.IpCatalogTitle}</h3>
        <div className={styles.surface}>
          {detail.ipCatalog.length === 0 ? <p className={styles.muted}>{strings.NoIpLabel}</p> : (
            <ul className={styles.plainList}>
              {detail.ipCatalog.map((item) => (
                <li key={item.Id}>
                  <strong>{item.Title}</strong>
                  {item.Description && <div className={styles.muted}>{item.Description}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="channels-heading">
        <h3 id="channels-heading" className={styles.sectionTitle}>{strings.ChannelsTitle}</h3>
        <div className={`${styles.surface} ${styles.buttonRow}`}>
          {community.VivaEngageUrl && (
            <DefaultButton
              href={community.VivaEngageUrl.Url}
              target="_blank"
              rel="noreferrer"
              text={props.graph.membershipEnabled ? strings.VivaEngageLabel : strings.JoinUnavailableLabel}
              iconProps={{ iconName: 'YammerLogo' }}
            />
          )}
          {props.graph.membershipEnabled && groupConfigured && !joined && (
            <PrimaryButton
              text={strings.JoinLabel}
              iconProps={{ iconName: 'AddFriend' }}
              disabled={joining}
              onClick={() => { void beginJoin(); }}
            />
          )}
          {joined && <span className={styles.badge}>{strings.JoinedLabel}</span>}
          {joined && community.ChatGroupUrl && (
            <Link href={community.ChatGroupUrl.Url} target="_blank" rel="noreferrer">
              {strings.ChatLabel}
            </Link>
          )}
        </div>
      </section>

      <Dialog
        hidden={!confirmOpen}
        onDismiss={() => setConfirmOpen(false)}
        dialogContentProps={{
          type: DialogType.normal,
          title: strings.SecondJoinTitle,
          subText: strings.SecondJoinMessage
        }}
        modalProps={{ isBlocking: true }}
      >
        <DialogFooter>
          <PrimaryButton onClick={() => { void joinNow(); }} text={strings.ConfirmJoinLabel} />
          <DefaultButton onClick={() => setConfirmOpen(false)} text={strings.CancelLabel} />
        </DialogFooter>
      </Dialog>
    </main>
  );
}
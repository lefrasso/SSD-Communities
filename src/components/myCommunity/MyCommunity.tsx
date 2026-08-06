import * as React from 'react';
import {
  DefaultButton,
  MessageBar,
  MessageBarType,
  Persona,
  PersonaSize
} from '@fluentui/react';
import * as strings from 'PortalStrings';
import { ICommunity, ICommunityRole, IPersonRef } from '../../models';
import {
  IGraphService,
  IPortalDataService,
  ITelemetryService,
  personMatchesUser
} from '../../services';
import styles from '../../styles/portal.module.scss';
import { EmptyState, ErrorState, LoadingState } from '../shared/PortalStates';
import { PortalHeader } from '../shared/PortalHeader';
import { useAsyncData } from '../shared/useAsyncData';

export interface IMyCommunityProps {
  data: IPortalDataService;
  graph: IGraphService;
  telemetry: ITelemetryService;
  directoryPageUrl: string;
}

interface IMyCommunityEntry {
  community: ICommunity;
  roles: ICommunityRole[];
}

interface IMyCommunityData {
  me: IPersonRef;
  entries: IMyCommunityEntry[];
}

export function MyCommunity(props: IMyCommunityProps): React.ReactElement {
  const loaded = useAsyncData<IMyCommunityData>(async () => {
    const [me, communities, roles] = await Promise.all([
      props.graph.getMe(),
      props.data.getCommunities(),
      props.data.getRoles()
    ]);
    const myRoles = roles.filter((role) => role.Active && personMatchesUser(role.Person, {
      email: me.email,
      loginName: me.loginName
    }));
    const roleCommunityIds = new Set(myRoles.map((role) => role.CommunityId));
    const membershipStates = props.graph.membershipEnabled
      ? await Promise.all(communities.map(async (community) => ({
          communityId: community.Id,
          joined: !!community.VivaEngageGroupId &&
            await props.graph.getMembershipState(community.VivaEngageGroupId)
        })))
      : [];
    const joinedIds = new Set(membershipStates.filter((state) => state.joined).map((state) => state.communityId));
    return {
      me,
      entries: communities
        .filter((community) => joinedIds.has(community.Id) || roleCommunityIds.has(community.Id))
        .map((community) => ({
          community,
          roles: myRoles.filter((role) => role.CommunityId === community.Id)
        }))
    };
  }, [props.data, props.graph]);

  React.useEffect(() => {
    props.telemetry.track('PageView', 'Success', undefined, 'MyCommunity');
  }, [props.telemetry]);

  if (loaded.loading) {
    return <div className={styles.portal}><LoadingState /></div>;
  }
  if (loaded.error) {
    return <div className={styles.portal}><ErrorState error={loaded.error} retry={loaded.reload} /></div>;
  }

  const data = loaded.data as IMyCommunityData;
  return (
    <main className={styles.portal}>
      <PortalHeader title={strings.MyCommunityTitle} subtitle={strings.MyCommunitySubtitle} />
      <div className={styles.profileBand}>
        <Persona
          text={data.me.displayName}
          secondaryText={data.me.jobTitle || data.me.email}
          tertiaryText={data.me.jobTitle ? data.me.email : undefined}
          size={PersonaSize.size56}
        />
      </div>

      {!props.graph.membershipEnabled && (
        <MessageBar messageBarType={MessageBarType.info} isMultiline>
          <strong>{strings.MembershipUnavailableTitle}</strong> {strings.MembershipUnavailableMessage}
        </MessageBar>
      )}

      {data.entries.length === 0 ? (
        <div>
          <EmptyState
            title={strings.NoMembershipTitle}
            message={strings.NoMembershipMessage}
            iconName="People"
          />
          {props.directoryPageUrl && (
            <div className={styles.buttonRow} style={{ justifyContent: 'center' }}>
              <DefaultButton href={props.directoryPageUrl} text={strings.BrowseDirectoryLabel} />
            </div>
          )}
        </div>
      ) : (
        <div className={styles.cardGrid}>
          {data.entries.map((entry) => (
            <article className={styles.card} key={entry.community.Id}>
              <div className={styles.cardAccent} />
              <div className={styles.cardBody}>
                <div className={styles.cardMeta}>{entry.community.ServiceFamily}</div>
                <h3 className={styles.cardTitle}>{entry.community.Title}</h3>
                <p className={styles.cardText}>{entry.community.ScopeInScope || strings.EmptyValue}</p>
                {entry.roles.length > 0 && (
                  <div className={styles.buttonRow}>
                    {entry.roles.map((role) => <span className={styles.badge} key={role.Id}>{role.Role}</span>)}
                  </div>
                )}
                <div className={`${styles.cardFooter} ${styles.buttonRow}`}>
                  {entry.community.VivaEngageUrl && (
                    <DefaultButton
                      href={entry.community.VivaEngageUrl.Url}
                      target="_blank"
                      rel="noreferrer"
                      text={strings.VivaEngageLabel}
                    />
                  )}
                  {entry.community.ChatGroupUrl && (
                    <DefaultButton
                      href={entry.community.ChatGroupUrl.Url}
                      target="_blank"
                      rel="noreferrer"
                      text={strings.ChatLabel}
                    />
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
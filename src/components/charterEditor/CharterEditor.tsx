import * as React from 'react';
import {
  Checkbox,
  DefaultButton,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  TextField
} from '@fluentui/react';
import * as strings from 'PortalStrings';
import { ICharter, ICommunity, IPersonRef } from '../../models';
import {
  IPortalCapabilities,
  IPortalDataService,
  IPermissionService,
  isCharterFullySignedOff,
  isPortalError,
  ITelemetryService
} from '../../services';
import styles from '../../styles/portal.module.scss';
import { EmptyState, ErrorState, LoadingState } from '../shared/PortalStates';
import { PortalHeader } from '../shared/PortalHeader';
import { useAsyncData } from '../shared/useAsyncData';

export interface ICharterEditorProps {
  communityId: number;
  readinessItems: string[];
  currentUser: IPersonRef;
  data: IPortalDataService;
  permissions: IPermissionService;
  telemetry: ITelemetryService;
}

interface ICharterEditorData {
  community?: ICommunity;
  charter?: ICharter;
  capabilities: IPortalCapabilities;
}

type SignatureRole = 'Lead' | 'ProgramManager' | 'SME';

function emptyCharter(communityId: number): ICharter {
  return {
    Id: 0,
    CommunityId: communityId,
    InteractionModel: '',
    Cadence: '',
    ReadinessPlan: '',
    LaunchReadiness: [],
    Status: 'Draft',
    CharterVersion: '1.0'
  };
}

function signoffText(person: IPersonRef | undefined, date: string | undefined): string {
  if (!person || !date) {
    return strings.NotSignedLabel;
  }
  return `${person.displayName} · ${new Date(date).toLocaleDateString()}`;
}

export function CharterEditor(props: ICharterEditorProps): React.ReactElement {
  const loaded = useAsyncData<ICharterEditorData>(async () => {
    const [community, charter, capabilities] = await Promise.all([
      props.communityId > 0 ? props.data.getCommunity(props.communityId) : Promise.resolve(undefined),
      props.communityId > 0 ? props.data.getCharter(props.communityId) : Promise.resolve(undefined),
      props.permissions.getCapabilities(props.communityId)
    ]);
    return { community, charter, capabilities };
  }, [props.communityId, props.data, props.permissions]);
  const [draft, setDraft] = React.useState<ICharter>();
  const [busy, setBusy] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: MessageBarType; text: string }>();

  React.useEffect(() => {
    if (loaded.data) {
      setDraft(loaded.data.charter || emptyCharter(props.communityId));
    }
  }, [loaded.data, props.communityId]);

  React.useEffect(() => {
    if (props.communityId > 0) {
      props.telemetry.track('PageView', 'Success', props.communityId, 'CharterEditor');
    }
  }, [props.communityId, props.telemetry]);

  if (loaded.loading || !draft) {
    return <div className={styles.portal}><LoadingState /></div>;
  }
  if (loaded.error) {
    return <div className={styles.portal}><ErrorState error={loaded.error} retry={loaded.reload} /></div>;
  }
  if (!loaded.data?.community) {
    return <div className={styles.portal}><EmptyState title={strings.NoCommunitiesTitle} /></div>;
  }

  const { community, capabilities } = loaded.data;
  const canEditBody = capabilities.canEditCharter && draft.Status === 'Draft';
  const signedOff = draft.Status === 'Signed off';

  const showFailure = (error: unknown): void => {
    setFeedback({
      type: MessageBarType.error,
      text: isPortalError(error) ? error.userMessage : strings.CharterActionFailedMessage
    });
  };

  const save = async (candidate: ICharter): Promise<ICharter | undefined> => {
    setBusy(true);
    setFeedback(undefined);
    try {
      const saved = await props.data.saveCharter(candidate);
      setDraft(saved);
      setFeedback({ type: MessageBarType.success, text: strings.CharterSavedMessage });
      return saved;
    } catch (error: unknown) {
      showFailure(error);
      return undefined;
    } finally {
      setBusy(false);
    }
  };

  const submitForReview = async (): Promise<void> => {
    let savedDraft = draft;
    if (draft.Id === 0) {
      const created = await save({ ...draft, Status: 'Draft' });
      if (!created) {
        return;
      }
      savedDraft = created;
    }
    await save({
      ...savedDraft,
      InteractionModel: draft.InteractionModel,
      Cadence: draft.Cadence,
      ReadinessPlan: draft.ReadinessPlan,
      LaunchReadiness: draft.LaunchReadiness,
      CharterVersion: draft.CharterVersion,
      Status: 'In review'
    });
  };

  const requestChanges = async (): Promise<void> => {
    await save({
      ...draft,
      Status: 'Draft',
      SignOffLead: undefined,
      SignOffLeadDate: undefined,
      SignOffPM: undefined,
      SignOffPMDate: undefined,
      SignOffSME: undefined,
      SignOffSMEDate: undefined
    });
  };

  const sign = async (role: SignatureRole): Promise<void> => {
    const timestamp = new Date().toISOString();
    let candidate: ICharter;
    if (role === 'Lead') {
      candidate = { ...draft, SignOffLead: props.currentUser, SignOffLeadDate: timestamp };
    } else if (role === 'ProgramManager') {
      candidate = { ...draft, SignOffPM: props.currentUser, SignOffPMDate: timestamp };
    } else {
      candidate = {
        ...draft,
        SignOffSME: props.currentUser,
        SignOffSMEDate: timestamp
      };
    }
    if (isCharterFullySignedOff(candidate)) {
      candidate = { ...candidate, Status: 'Signed off' };
    }
    await save(candidate);
  };

  const toggleReadiness = (item: string, checked: boolean): void => {
    setDraft((current) => {
      if (!current) {
        return current;
      }
      const values = checked
        ? Array.from(new Set([...current.LaunchReadiness, item]))
        : current.LaunchReadiness.filter((value) => value !== item);
      return { ...current, LaunchReadiness: values };
    });
  };

  return (
    <main className={styles.portal}>
      <PortalHeader
        eyebrow={community.ServiceFamily}
        title={strings.CharterTitle}
        subtitle={strings.CharterSubtitle}
        aside={<span className={styles.statusBadge}>{draft.Status}</span>}
      />

      {feedback && (
        <MessageBar
          className={styles.successBar}
          messageBarType={feedback.type}
          onDismiss={() => setFeedback(undefined)}
        >
          {feedback.text}
        </MessageBar>
      )}
      {signedOff && (
        <MessageBar className={styles.successBar} messageBarType={MessageBarType.success}>
          {strings.SignedOffMessage}
        </MessageBar>
      )}

      <div className={styles.formLayout}>
        <div className={styles.formMain}>
          <section className={styles.formSection}>
            <h3>I. {strings.CommunityLabel}</h3>
            <strong>{community.Title}</strong>
            <div className={styles.muted}>{community.ServiceFamily}</div>
          </section>

          <section className={styles.formSection}>
            <h3>II. {strings.InScopeLabel}</h3>
            <p className={styles.muted}>{community.ScopeInScope || strings.EmptyValue}</p>
          </section>

          <section className={styles.formSection}>
            <h3>III. {strings.InteractionModelLabel}</h3>
            <TextField
              multiline
              rows={5}
              value={draft.InteractionModel || ''}
              disabled={!canEditBody || busy}
              onChange={(_, value) => setDraft({ ...draft, InteractionModel: value || '' })}
            />
          </section>

          <section className={styles.formSection}>
            <h3>IV. {strings.CadenceLabel}</h3>
            <TextField
              value={draft.Cadence || ''}
              disabled={!canEditBody || busy}
              onChange={(_, value) => setDraft({ ...draft, Cadence: value || '' })}
            />
          </section>

          <section className={styles.formSection}>
            <h3>V. {strings.ReadinessPlanLabel}</h3>
            <TextField
              multiline
              rows={5}
              value={draft.ReadinessPlan || ''}
              disabled={!canEditBody || busy}
              onChange={(_, value) => setDraft({ ...draft, ReadinessPlan: value || '' })}
            />
          </section>

          <section className={styles.formSection}>
            <h3>VII. {strings.CharterStatusLabel}</h3>
            <div className={styles.twoColumn}>
              <TextField label={strings.CharterStatusLabel} value={draft.Status} readOnly />
              <TextField
                label={strings.CharterVersionLabel}
                value={draft.CharterVersion || ''}
                disabled={!canEditBody || busy}
                onChange={(_, value) => setDraft({ ...draft, CharterVersion: value || '' })}
              />
            </div>
          </section>

          <section className={styles.formSection}>
            <h3>VIII. {strings.SignOffsLabel}</h3>
            <div className={styles.signoffRow}>
              <strong>{strings.LeadSignOffLabel}</strong>
              <span>{signoffText(draft.SignOffLead, draft.SignOffLeadDate)}</span>
              {draft.Status === 'In review' && capabilities.canSignAsLead && !draft.SignOffLead && (
                <DefaultButton disabled={busy} text={strings.SignLabel} onClick={() => { void sign('Lead'); }} />
              )}
            </div>
            <div className={styles.signoffRow}>
              <strong>{strings.ProgramManagerSignOffLabel}</strong>
              <span>{signoffText(draft.SignOffPM, draft.SignOffPMDate)}</span>
              {draft.Status === 'In review' && capabilities.canSignAsProgramManager && !draft.SignOffPM && (
                <DefaultButton disabled={busy} text={strings.SignLabel} onClick={() => { void sign('ProgramManager'); }} />
              )}
            </div>
            <div className={styles.signoffRow}>
              <strong>{strings.SMESignOffLabel}</strong>
              <span>{signoffText(draft.SignOffSME, draft.SignOffSMEDate)}</span>
              {draft.Status === 'In review' && capabilities.canSignAsSME && !draft.SignOffSME && (
                <DefaultButton disabled={busy} text={strings.SignLabel} onClick={() => { void sign('SME'); }} />
              )}
            </div>
          </section>

          <section className={styles.formSection}>
            <h3>IX. {strings.AuditLabel}</h3>
            <div className={styles.muted}>
              {draft.Modified
                ? `${new Date(draft.Modified).toLocaleString()} · ${draft.Editor?.displayName || strings.EmptyValue}`
                : strings.EmptyValue}
            </div>
          </section>

          <div className={styles.buttonRow}>
            {canEditBody && (
              <DefaultButton
                disabled={busy}
                text={strings.SaveDraftLabel}
                onClick={() => { void save({ ...draft, Status: 'Draft' }); }}
              />
            )}
            {canEditBody && (
              <PrimaryButton
                disabled={busy}
                text={strings.SubmitReviewLabel}
                onClick={() => { void submitForReview(); }}
              />
            )}
            {draft.Status === 'In review' && capabilities.canEditCharter && (
              <DefaultButton
                disabled={busy}
                text={strings.RequestChangesLabel}
                onClick={() => { void requestChanges(); }}
              />
            )}
          </div>
        </div>

        <aside className={`${styles.formSection} ${styles.stickyAside}`}>
          <h3>VI. {strings.LaunchReadinessLabel}</h3>
          {props.readinessItems.map((item) => (
            <Checkbox
              key={item}
              label={item}
              checked={draft.LaunchReadiness.indexOf(item) >= 0}
              disabled={!canEditBody || busy}
              onChange={(_, checked) => toggleReadiness(item, !!checked)}
            />
          ))}
        </aside>
      </div>
    </main>
  );
}
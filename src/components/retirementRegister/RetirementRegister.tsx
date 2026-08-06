import * as React from 'react';
import {
  DefaultButton,
  DetailsList,
  Dialog,
  DialogFooter,
  DialogType,
  Dropdown,
  IColumn,
  IconButton,
  IDropdownOption,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  ProgressIndicator,
  SelectionMode,
  TextField
} from '@fluentui/react';
import * as strings from 'PortalStrings';
import {
  ICommunity,
  IForumRetirementItem,
  RetirementDisposition
} from '../../models';
import {
  IPortalDataService,
  IPermissionService,
  isPortalError,
  ITelemetryService,
  reductionProgress
} from '../../services';
import styles from '../../styles/portal.module.scss';
import { AccessDeniedState, EmptyState, ErrorState, LoadingState } from '../shared/PortalStates';
import { PortalHeader } from '../shared/PortalHeader';
import { useAsyncData } from '../shared/useAsyncData';

export interface IRetirementRegisterProps {
  data: IPortalDataService;
  permissions: IPermissionService;
  telemetry: ITelemetryService;
}

interface IRetirementData {
  items: IForumRetirementItem[];
  communities: ICommunity[];
  canView: boolean;
  canManage: boolean;
}

type SortKey = 'Title' | 'Disposition' | 'TargetCommunity' | 'CompletionDate' | 'State';

const DISPOSITIONS: RetirementDisposition[] = ['Migrate', 'Merge', 'Close'];

export function sortRetirementItems(
  items: IForumRetirementItem[],
  sortKey: SortKey,
  descending: boolean,
  communityNames: ReadonlyMap<number, string>
): IForumRetirementItem[] {
  const value = (item: IForumRetirementItem): string => {
    if (sortKey === 'TargetCommunity') {
      return communityNames.get(item.TargetCommunityId) || '';
    }
    if (sortKey === 'State') {
      return item.CompletionDate ? 'Completed' : 'Pending';
    }
    return String(item[sortKey] || '');
  };
  return items.slice().sort((left, right) => {
    const comparison = value(left).localeCompare(value(right));
    return descending ? -comparison : comparison;
  });
}

export function RetirementRegister(props: IRetirementRegisterProps): React.ReactElement {
  const loaded = useAsyncData<IRetirementData>(async () => {
    const [items, communities, capabilities] = await Promise.all([
      props.data.getForumRetirement(),
      props.data.getCommunities(),
      props.permissions.getCapabilities()
    ]);
    return {
      items,
      communities,
      canView: capabilities.canViewDashboard || capabilities.canManageRetirement,
      canManage: capabilities.canManageRetirement
    };
  }, [props.data, props.permissions]);
  const [filter, setFilter] = React.useState<RetirementDisposition>();
  const [sortKey, setSortKey] = React.useState<SortKey>('Title');
  const [descending, setDescending] = React.useState(false);
  const [editing, setEditing] = React.useState<IForumRetirementItem>();
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string>();

  React.useEffect(() => {
    props.telemetry.track('PageView', 'Success', undefined, 'RetirementRegister');
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

  const communityNames = new Map(loaded.data.communities.map((community) => [community.Id, community.Title]));
  const filtered = filter
    ? loaded.data.items.filter((item) => item.Disposition === filter)
    : loaded.data.items;
  const visibleItems = sortRetirementItems(filtered, sortKey, descending, communityNames);
  const progress = reductionProgress(loaded.data.items);
  const communityOptions: IDropdownOption[] = loaded.data.communities.map((community) => ({
    key: community.Id,
    text: community.Title
  }));
  const dispositionOptions: IDropdownOption[] = DISPOSITIONS.map((value) => ({ key: value, text: value }));

  const sort = (key: SortKey): void => {
    if (key === sortKey) {
      setDescending((current) => !current);
      return;
    }
    setSortKey(key);
    setDescending(false);
  };

  const columns: IColumn[] = [
    {
      key: 'title',
      name: strings.ForumNameLabel,
      fieldName: 'Title',
      minWidth: 180,
      isResizable: true,
      isSorted: sortKey === 'Title',
      isSortedDescending: descending,
      onColumnClick: () => sort('Title')
    },
    {
      key: 'disposition',
      name: strings.DispositionLabel,
      fieldName: 'Disposition',
      minWidth: 90,
      maxWidth: 120,
      isSorted: sortKey === 'Disposition',
      isSortedDescending: descending,
      onColumnClick: () => sort('Disposition')
    },
    {
      key: 'target',
      name: strings.TargetCommunityLabel,
      minWidth: 140,
      isResizable: true,
      isSorted: sortKey === 'TargetCommunity',
      isSortedDescending: descending,
      onColumnClick: () => sort('TargetCommunity'),
      onRender: (item?: IForumRetirementItem) => item
        ? communityNames.get(item.TargetCommunityId) || strings.EmptyValue
        : strings.EmptyValue
    },
    {
      key: 'completion',
      name: strings.CompletionDateLabel,
      minWidth: 110,
      maxWidth: 140,
      isSorted: sortKey === 'CompletionDate',
      isSortedDescending: descending,
      onColumnClick: () => sort('CompletionDate'),
      onRender: (item?: IForumRetirementItem) => item?.CompletionDate
        ? new Date(item.CompletionDate).toLocaleDateString()
        : strings.EmptyValue
    },
    {
      key: 'state',
      name: strings.StateLabel,
      minWidth: 80,
      maxWidth: 100,
      isSorted: sortKey === 'State',
      isSortedDescending: descending,
      onColumnClick: () => sort('State'),
      onRender: (item?: IForumRetirementItem) => (
        <span className={styles.statusBadge}>
          {item?.CompletionDate ? strings.CompletedLabel : strings.PendingLabel}
        </span>
      )
    }
  ];
  if (loaded.data.canManage) {
    columns.push({
      key: 'actions',
      name: '',
      minWidth: 40,
      maxWidth: 40,
      onRender: (item?: IForumRetirementItem) => item ? (
        <IconButton
          iconProps={{ iconName: 'Edit' }}
          title={strings.EditLabel}
          ariaLabel={`${strings.EditLabel}: ${item.Title}`}
          onClick={() => setEditing({ ...item })}
        />
      ) : null
    });
  }

  const save = async (): Promise<void> => {
    if (!editing) {
      return;
    }
    setSaving(true);
    setSaveError(undefined);
    try {
      await props.data.upsertForumRetirement(editing);
      setEditing(undefined);
      loaded.reload();
    } catch (error: unknown) {
      setSaveError(isPortalError(error) ? error.userMessage : strings.RetirementSaveFailedMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={styles.portal}>
      <PortalHeader title={strings.RetirementTitle} subtitle={strings.RetirementSubtitle} />
      <div className={styles.progressBand}>
        <div>
          <div className={styles.progressValue}>{progress.completed} / {progress.total}</div>
          <div className={styles.muted}>{strings.ProgressLabel}</div>
        </div>
        <ProgressIndicator
          percentComplete={progress.ratio}
          description={`${Math.round(progress.ratio * 100)}%`}
        />
      </div>

      <div className={styles.registerToolbar}>
        <Dropdown
          label={strings.DispositionFilterLabel}
          selectedKey={filter || ''}
          options={[{ key: '', text: strings.AllDispositionsLabel }, ...dispositionOptions]}
          onChange={(_, option) => setFilter((String(option?.key || '') || undefined) as RetirementDisposition | undefined)}
          styles={{ root: { minWidth: 220 } }}
        />
        {loaded.data.canManage && (
          <PrimaryButton
            iconProps={{ iconName: 'Add' }}
            text={strings.AddForumLabel}
            onClick={() => setEditing({
              Id: 0,
              Title: '',
              Disposition: 'Migrate',
              TargetCommunityId: loaded.data?.communities[0]?.Id || 0
            })}
          />
        )}
      </div>

      {visibleItems.length === 0 ? (
        <EmptyState title={strings.NoRetirementItemsLabel} iconName="Archive" />
      ) : (
        <div className={styles.surface}>
          <DetailsList
            items={visibleItems}
            columns={columns}
            selectionMode={SelectionMode.none}
            setKey="retirement-register"
            isHeaderVisible
          />
        </div>
      )}

      <Dialog
        hidden={!editing}
        onDismiss={() => setEditing(undefined)}
        dialogContentProps={{ type: DialogType.normal, title: editing?.Id ? strings.EditLabel : strings.AddForumLabel }}
        modalProps={{ isBlocking: true }}
      >
        {saveError && <MessageBar messageBarType={MessageBarType.error}>{saveError}</MessageBar>}
        <TextField
          required
          label={strings.ForumNameLabel}
          value={editing?.Title || ''}
          onChange={(_, value) => setEditing((current) => current ? { ...current, Title: value || '' } : current)}
        />
        <Dropdown
          required
          label={strings.DispositionLabel}
          selectedKey={editing?.Disposition}
          options={dispositionOptions}
          onChange={(_, option) => setEditing((current) => current
            ? { ...current, Disposition: option?.key as RetirementDisposition }
            : current)}
        />
        <Dropdown
          required
          label={strings.TargetCommunityLabel}
          selectedKey={editing?.TargetCommunityId}
          options={communityOptions}
          onChange={(_, option) => setEditing((current) => current
            ? { ...current, TargetCommunityId: Number(option?.key) }
            : current)}
        />
        <TextField
          type="date"
          label={strings.CompletionDateLabel}
          value={editing?.CompletionDate?.slice(0, 10) || ''}
          onChange={(_, value) => setEditing((current) => current
            ? { ...current, CompletionDate: value || undefined }
            : current)}
        />
        <DialogFooter>
          <PrimaryButton disabled={saving} text={strings.SaveLabel} onClick={() => { void save(); }} />
          <DefaultButton disabled={saving} text={strings.CancelLabel} onClick={() => setEditing(undefined)} />
        </DialogFooter>
      </Dialog>
    </main>
  );
}
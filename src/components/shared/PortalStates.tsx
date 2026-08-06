import * as React from 'react';
import {
  DefaultButton,
  Icon,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize
} from '@fluentui/react';
import * as strings from 'PortalStrings';
import { isPortalError } from '../../services';
import styles from '../../styles/portal.module.scss';

export function LoadingState(): React.ReactElement {
  return (
    <div className={styles.state} role="status" aria-live="polite">
      <Spinner size={SpinnerSize.large} label={strings.LoadingLabel} />
    </div>
  );
}

export function ErrorState(props: { error: unknown; retry: () => void }): React.ReactElement {
  const message = isPortalError(props.error)
    ? props.error.userMessage
    : strings.RequestFailedMessage;
  return (
    <MessageBar messageBarType={MessageBarType.error} isMultiline>
      <span>{message}</span>
      <DefaultButton className={styles.inlineAction} onClick={props.retry} text={strings.RetryLabel} />
    </MessageBar>
  );
}

export function EmptyState(props: {
  title: string;
  message?: string;
  iconName?: string;
}): React.ReactElement {
  return (
    <div className={styles.emptyState} role="status">
      <Icon iconName={props.iconName || 'OpenFolderHorizontal'} className={styles.emptyIcon} />
      <h3>{props.title}</h3>
      {props.message && <p>{props.message}</p>}
    </div>
  );
}

export function AccessDeniedState(): React.ReactElement {
  return (
    <EmptyState
      iconName="Blocked"
      title={strings.AccessDeniedTitle}
      message={strings.AccessDeniedMessage}
    />
  );
}
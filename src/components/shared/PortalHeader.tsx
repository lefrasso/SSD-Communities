import * as React from 'react';
import styles from '../../styles/portal.module.scss';

export function PortalHeader(props: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  aside?: React.ReactNode;
}): React.ReactElement {
  return (
    <header className={styles.header}>
      <div>
        {props.eyebrow && <div className={styles.eyebrow}>{props.eyebrow}</div>}
        <h2 className={styles.pageTitle}>{props.title}</h2>
        <p className={styles.subtitle}>{props.subtitle}</p>
      </div>
      {props.aside && <div className={styles.headerAside}>{props.aside}</div>}
    </header>
  );
}
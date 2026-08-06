import * as React from 'react';

export interface IAsyncData<T> {
  data?: T;
  error?: unknown;
  loading: boolean;
  reload: () => void;
}

export function useAsyncData<T>(
  loader: () => Promise<T>,
  dependencies: React.DependencyList
): IAsyncData<T> {
  const [data, setData] = React.useState<T>();
  const [error, setError] = React.useState<unknown>();
  const [loading, setLoading] = React.useState(true);
  const [reloadToken, setReloadToken] = React.useState(0);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError(undefined);
    loader().then(
      (value) => {
        if (active) {
          setData(value);
          setLoading(false);
        }
      },
      (reason: unknown) => {
        if (active) {
          setError(reason);
          setLoading(false);
        }
      }
    );
    return () => { active = false; };
  // The caller owns the dependency list just as it would for useEffect.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, reloadToken]);

  return {
    data,
    error,
    loading,
    reload: () => setReloadToken((current) => current + 1)
  };
}
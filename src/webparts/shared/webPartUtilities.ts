export function resolveCommunityId(configuredId: number | undefined): number {
  if (configuredId && configuredId > 0) {
    return configuredId;
  }
  const value = new URLSearchParams(window.location.search).get('communityId');
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

export function commaSeparatedValues(value: string | undefined): string[] {
  return (value || '').split(',').map((item) => item.trim()).filter(Boolean);
}

export function lineSeparatedValues(value: string | undefined): string[] {
  return (value || '').split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}
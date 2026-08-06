import { describe, expect, it } from '@jest/globals';
import { PortalError, toPortalError } from './PortalError';

describe('toPortalError', () => {
  it('preserves portal errors', () => {
    const error = new PortalError('NotConfigured', 'Not configured.');
    expect(toPortalError(error)).toBe(error);
  });

  it('maps HTTP status codes to user-safe kinds', () => {
    expect(toPortalError({ status: 403 }).kind).toBe('PermissionDenied');
    expect(toPortalError({ statusCode: 404 }).kind).toBe('NotFound');
    expect(toPortalError({ status: 412 }).kind).toBe('Conflict');
  });

  it('maps aborts to timeouts', () => {
    expect(toPortalError({ name: 'AbortError' }).kind).toBe('Timeout');
  });
});
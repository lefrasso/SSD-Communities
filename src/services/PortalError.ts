import { IPortalError, PortalErrorKind } from './IPortalDataService';
import { SERVICE_STRINGS } from './ServiceStrings';

interface IErrorShape {
  status?: unknown;
  statusCode?: unknown;
  code?: unknown;
  message?: unknown;
  name?: unknown;
}

export class PortalError extends Error implements IPortalError {
  public readonly kind: PortalErrorKind;
  public readonly userMessage: string;
  public readonly technical?: string;

  public constructor(kind: PortalErrorKind, userMessage: string, technical?: string) {
    super(userMessage);
    this.name = 'PortalError';
    this.kind = kind;
    this.userMessage = userMessage;
    this.technical = technical;
    Object.setPrototypeOf(this, PortalError.prototype);
  }
}

export function isPortalError(error: unknown): error is PortalError {
  return error instanceof PortalError;
}

export function toPortalError(
  error: unknown,
  fallbackMessage = SERVICE_STRINGS.requestFailed
): PortalError {
  if (isPortalError(error)) {
    return error;
  }

  const shaped = typeof error === 'object' && error !== null ? error as IErrorShape : undefined;
  const status = Number(shaped?.status ?? shaped?.statusCode);
  const code = typeof shaped?.code === 'string' ? shaped.code : '';
  const name = typeof shaped?.name === 'string' ? shaped.name : '';
  const technical = typeof shaped?.message === 'string'
    ? shaped.message
    : typeof error === 'string' ? error : undefined;

  if (status === 401 || status === 403) {
    return new PortalError('PermissionDenied', SERVICE_STRINGS.permissionDenied, technical);
  }
  if (status === 404) {
    return new PortalError('NotFound', SERVICE_STRINGS.recordNotFound, technical);
  }
  if (status === 409 || status === 412) {
    return new PortalError('Conflict', SERVICE_STRINGS.recordConflict, technical);
  }
  if (name === 'AbortError' || code === 'ETIMEDOUT' || code === 'ESOCKETTIMEDOUT') {
    return new PortalError('Timeout', SERVICE_STRINGS.timeout, technical);
  }
  return new PortalError('Unknown', fallbackMessage, technical);
}
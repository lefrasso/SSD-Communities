export type PortalEventName =
  | 'PageView'
  | 'Join'
  | 'CharterTransition'
  | 'MetricUpdate'
  | 'RetirementUpdate'
  | 'Error';

export type PortalEventResult = 'Success' | 'Failure';

export interface IPortalTelemetryEvent {
  name: PortalEventName;
  result: PortalEventResult;
  timestamp: string;
  communityId?: number;
  detail?: string;
}

export interface ITelemetrySink {
  write(event: IPortalTelemetryEvent): void;
}

export interface ITelemetryService {
  track(name: PortalEventName, result: PortalEventResult, communityId?: number, detail?: string): void;
}

const noOpSink: ITelemetrySink = { write: () => undefined };

export class TelemetryService implements ITelemetryService {
  public constructor(
    private readonly sink: ITelemetrySink = noOpSink,
    private readonly clock: () => Date = () => new Date()
  ) {}

  public track(
    name: PortalEventName,
    result: PortalEventResult,
    communityId?: number,
    detail?: string
  ): void {
    this.sink.write({
      name,
      result,
      timestamp: this.clock().toISOString(),
      communityId,
      detail
    });
  }
}
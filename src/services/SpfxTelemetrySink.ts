import { Log } from '@microsoft/sp-core-library';
import { IPortalTelemetryEvent, ITelemetrySink } from './TelemetryService';

const LOG_SOURCE = 'SSDCommunitiesPortal';

export class SpfxTelemetrySink implements ITelemetrySink {
  public write(event: IPortalTelemetryEvent): void {
    const serialized = JSON.stringify(event);
    if (event.result === 'Failure') {
      Log.warn(LOG_SOURCE, serialized);
      return;
    }
    Log.info(LOG_SOURCE, serialized);
  }
}
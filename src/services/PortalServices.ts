import { spfi, SPFx } from '@pnp/sp';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { CacheService } from './CacheService';
import { DEFAULT_FEATURE_FLAGS, IPortalFeatureFlags } from './FeatureFlags';
import { GraphService } from './GraphService';
import { IGraphService } from './IGraphService';
import { IPortalDataService } from './IPortalDataService';
import { PermissionService, IPermissionService } from './PermissionService';
import { PortalDataService } from './PortalDataService';
import { SpfxTelemetrySink } from './SpfxTelemetrySink';
import { ITelemetryService, TelemetryService } from './TelemetryService';

export interface IPortalServices {
  data: IPortalDataService;
  graph: IGraphService;
  permissions: IPermissionService;
  telemetry: ITelemetryService;
  features: Readonly<IPortalFeatureFlags>;
}

export function createPortalServices(
  context: WebPartContext,
  featureFlags: Readonly<IPortalFeatureFlags> = DEFAULT_FEATURE_FLAGS
): IPortalServices {
  const sp = spfi().using(SPFx(context));
  const cache = new CacheService();
  const telemetry = new TelemetryService(new SpfxTelemetrySink());
  const data = new PortalDataService(sp, cache, telemetry);
  const graph = new GraphService(
    context.msGraphClientFactory,
    featureFlags.membershipEnabled,
    telemetry,
    cache
  );
  const permissions = new PermissionService(sp, data, {
    email: context.pageContext.user.email,
    loginName: context.pageContext.user.loginName
  }, cache);

  return { data, graph, permissions, telemetry, features: featureFlags };
}
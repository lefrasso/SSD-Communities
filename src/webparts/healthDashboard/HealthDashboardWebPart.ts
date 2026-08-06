import * as React from 'react';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { HealthDashboard } from '../../components/healthDashboard/HealthDashboard';
import { createPortalServices, IPortalServices } from '../../services';
import { disposePortal, renderPortal } from '../shared/renderPortal';

export type IHealthDashboardWebPartProps = Record<string, never>;

export default class HealthDashboardWebPart extends BaseClientSideWebPart<IHealthDashboardWebPartProps> {
  private services!: IPortalServices;

  protected onInit(): Promise<void> {
    this.services = createPortalServices(this.context);
    return Promise.resolve();
  }

  public render(): void {
    renderPortal(React.createElement(HealthDashboard, {
      data: this.services.data,
      permissions: this.services.permissions,
      telemetry: this.services.telemetry
    }), this.domElement);
  }

  protected onDispose(): void {
    disposePortal(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }
}
import * as React from 'react';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { RetirementRegister } from '../../components/retirementRegister/RetirementRegister';
import { createPortalServices, IPortalServices } from '../../services';
import { disposePortal, renderPortal } from '../shared/renderPortal';

export type IRetirementRegisterWebPartProps = Record<string, never>;

export default class RetirementRegisterWebPart extends BaseClientSideWebPart<IRetirementRegisterWebPartProps> {
  private services!: IPortalServices;

  protected onInit(): Promise<void> {
    this.services = createPortalServices(this.context);
    return Promise.resolve();
  }

  public render(): void {
    renderPortal(React.createElement(RetirementRegister, {
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
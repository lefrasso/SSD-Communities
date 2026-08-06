import * as React from 'react';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as strings from 'PortalStrings';
import { MyCommunity } from '../../components/myCommunity/MyCommunity';
import { createPortalServices, IPortalServices } from '../../services';
import { disposePortal, renderPortal } from '../shared/renderPortal';

export interface IMyCommunityWebPartProps {
  membershipEnabled: boolean;
  directoryPageUrl: string;
}

export default class MyCommunityWebPart extends BaseClientSideWebPart<IMyCommunityWebPartProps> {
  private services!: IPortalServices;

  protected onInit(): Promise<void> {
    this.services = createPortalServices(this.context, {
      membershipEnabled: !!this.properties.membershipEnabled
    });
    return Promise.resolve();
  }

  public render(): void {
    renderPortal(React.createElement(MyCommunity, {
      data: this.services.data,
      graph: this.services.graph,
      telemetry: this.services.telemetry,
      directoryPageUrl: this.properties.directoryPageUrl || ''
    }), this.domElement);
  }

  protected onDispose(): void {
    disposePortal(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [{
        header: { description: strings.PropertyPaneDescription },
        groups: [{
          groupName: strings.BasicGroupName,
          groupFields: [
            PropertyPaneToggle('membershipEnabled', { label: strings.MembershipEnabledFieldLabel }),
            PropertyPaneTextField('directoryPageUrl', { label: strings.DirectoryPageUrlFieldLabel })
          ]
        }]
      }]
    };
  }
}
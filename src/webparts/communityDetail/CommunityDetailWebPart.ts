import * as React from 'react';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as strings from 'PortalStrings';
import { CommunityDetail } from '../../components/communityDetail/CommunityDetail';
import { createPortalServices, IPortalServices } from '../../services';
import { disposePortal, renderPortal } from '../shared/renderPortal';
import { resolveCommunityId } from '../shared/webPartUtilities';

export interface ICommunityDetailWebPartProps {
  communityId: number;
  membershipEnabled: boolean;
}

export default class CommunityDetailWebPart extends BaseClientSideWebPart<ICommunityDetailWebPartProps> {
  private services!: IPortalServices;

  protected onInit(): Promise<void> {
    this.services = createPortalServices(this.context, {
      membershipEnabled: !!this.properties.membershipEnabled
    });
    return Promise.resolve();
  }

  public render(): void {
    renderPortal(React.createElement(CommunityDetail, {
      communityId: resolveCommunityId(this.properties.communityId),
      data: this.services.data,
      graph: this.services.graph,
      telemetry: this.services.telemetry
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
            PropertyPaneTextField('communityId', { label: strings.CommunityIdFieldLabel }),
            PropertyPaneToggle('membershipEnabled', { label: strings.MembershipEnabledFieldLabel })
          ]
        }]
      }]
    };
  }
}
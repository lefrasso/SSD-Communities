import * as React from 'react';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as strings from 'PortalStrings';
import { CommunityDirectory } from '../../components/communityDirectory/CommunityDirectory';
import { createPortalServices, IPortalServices } from '../../services';
import { disposePortal, renderPortal } from '../shared/renderPortal';

export interface ICommunityDirectoryWebPartProps {
  detailPageUrl: string;
}

export default class CommunityDirectoryWebPart extends BaseClientSideWebPart<ICommunityDirectoryWebPartProps> {
  private services!: IPortalServices;

  protected onInit(): Promise<void> {
    this.services = createPortalServices(this.context);
    return Promise.resolve();
  }

  public render(): void {
    renderPortal(React.createElement(CommunityDirectory, {
      data: this.services.data,
      telemetry: this.services.telemetry,
      detailPageUrl: this.properties.detailPageUrl || ''
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
            PropertyPaneTextField('detailPageUrl', { label: strings.DetailPageUrlFieldLabel })
          ]
        }]
      }]
    };
  }
}
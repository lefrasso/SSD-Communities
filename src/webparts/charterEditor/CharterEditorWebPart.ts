import * as React from 'react';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as strings from 'PortalStrings';
import { CharterEditor } from '../../components/charterEditor/CharterEditor';
import { DEFAULT_LAUNCH_READINESS } from '../../provisioning';
import { createPortalServices, IPortalServices } from '../../services';
import { disposePortal, renderPortal } from '../shared/renderPortal';
import { lineSeparatedValues, resolveCommunityId } from '../shared/webPartUtilities';

export interface ICharterEditorWebPartProps {
  communityId: number;
  readinessItems: string;
}

interface ILegacyPageContext {
  userId?: number;
}

export default class CharterEditorWebPart extends BaseClientSideWebPart<ICharterEditorWebPartProps> {
  private services!: IPortalServices;

  protected onInit(): Promise<void> {
    this.services = createPortalServices(this.context);
    return Promise.resolve();
  }

  public render(): void {
    const configuredReadiness = lineSeparatedValues(this.properties.readinessItems);
    const legacyContext = this.context.pageContext.legacyPageContext as ILegacyPageContext;
    renderPortal(React.createElement(CharterEditor, {
      communityId: resolveCommunityId(this.properties.communityId),
      readinessItems: configuredReadiness.length === 6 ? configuredReadiness : DEFAULT_LAUNCH_READINESS,
      currentUser: {
        id: legacyContext.userId || 0,
        displayName: this.context.pageContext.user.displayName,
        email: this.context.pageContext.user.email,
        loginName: this.context.pageContext.user.loginName
      },
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

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [{
        header: { description: strings.PropertyPaneDescription },
        groups: [{
          groupName: strings.BasicGroupName,
          groupFields: [
            PropertyPaneTextField('communityId', { label: strings.CommunityIdFieldLabel }),
            PropertyPaneTextField('readinessItems', {
              label: strings.ReadinessItemsFieldLabel,
              multiline: true,
              rows: 8
            })
          ]
        }]
      }]
    };
  }
}
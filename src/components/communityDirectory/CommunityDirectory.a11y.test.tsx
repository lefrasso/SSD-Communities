import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { ICommunity } from '../../models';
import { IPortalDataService, ITelemetryService } from '../../services';
import { CommunityDirectory } from './CommunityDirectory';

const community: ICommunity = {
  Id: 1,
  Title: 'Azure Platform',
  ServiceFamily: 'Azure',
  ScopeInScope: 'Landing zones and platform engineering.',
  TargetRoles: ['Community Lead'],
  IsCrossCommunity: false,
  Status: 'Active'
};

describe('CommunityDirectory accessibility', () => {
  it('has no automated axe violations in the loaded state', async () => {
    const data = {
      getCommunities: async () => [community]
    } as unknown as IPortalDataService;
    const telemetry: ITelemetryService = { track: () => undefined };
    const rendered = render(
      <CommunityDirectory data={data} telemetry={telemetry} detailPageUrl="/detail.aspx" />
    );
    await screen.findByText('Azure Platform');
    const results = await axe(rendered.container);
    expect(results.violations).toHaveLength(0);
  });
});
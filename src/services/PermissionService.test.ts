import { describe, expect, it } from '@jest/globals';
import { ICommunityRole } from '../models';
import { deriveCapabilities, personMatchesUser } from './PermissionService';

const lead: ICommunityRole = {
  Id: 1,
  CommunityId: 7,
  Person: { id: 2, displayName: 'Ada', email: 'ada@example.com' },
  Role: 'Community Lead',
  SourceOrg: 'Delivery',
  Active: true
};

describe('permission logic', () => {
  it('matches SharePoint people by normalized email or login', () => {
    expect(personMatchesUser(lead.Person, { email: 'ADA@example.com' })).toBe(true);
    expect(personMatchesUser(lead.Person, { email: 'grace@example.com' })).toBe(false);
  });

  it('gives a lead community-scoped editing capabilities', () => {
    const capabilities = deriveCapabilities([], [lead], { email: 'ada@example.com' }, 7);
    expect(capabilities.canEditCommunity).toBe(true);
    expect(capabilities.canEditMetrics).toBe(true);
    expect(capabilities.canManageRetirement).toBe(false);
  });

  it('gives program managers portfolio capabilities', () => {
    const capabilities = deriveCapabilities(
      ['SSD Community Program Managers'],
      [],
      { email: 'pm@example.com' },
      undefined
    );
    expect(capabilities.canSignAsProgramManager).toBe(true);
    expect(capabilities.canViewDashboard).toBe(true);
    expect(capabilities.canManageRetirement).toBe(true);
  });

  it('lets Family Owners sign without editing the charter body', () => {
    const owner: ICommunityRole = {
      ...lead,
      Role: 'Family Owner (SME)',
      TimeZone: 'EMEA'
    };
    const capabilities = deriveCapabilities([], [owner], { email: 'ada@example.com' }, 7);
    expect(capabilities.canSignAsFamilyOwner).toBe(true);
    expect(capabilities.canEditCharter).toBe(false);
  });
});
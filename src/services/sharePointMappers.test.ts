import { describe, expect, it } from '@jest/globals';
import { mapCharter, mapCommunity, mapRole } from './sharePointMappers';

describe('SharePoint mappers', () => {
  it('normalizes URLs, multi-choice fields, and audit people', () => {
    expect(mapCommunity({
      Id: 7,
      Title: 'Azure',
      ServiceFamily: 'Cloud & AI',
      Status: 'Active',
      TargetRoles: { results: ['Invited Expert'] },
      VivaEngageUrl: { Url: 'https://engage.example', Description: 'Viva Engage' },
      Author: { Id: 2, Title: 'Ada', EMail: 'ada@example.com' }
    })).toEqual(expect.objectContaining({
      Id: 7,
      TargetRoles: ['Invited Expert'],
      VivaEngageUrl: { Url: 'https://engage.example', Description: 'Viva Engage' },
      Author: expect.objectContaining({ displayName: 'Ada' })
    }));
  });

  it('maps expanded lookup and person fields', () => {
    expect(mapRole({
      Id: 8,
      Community: { Id: 7, Title: 'Azure' },
      Person: { Id: 4, Title: 'Grace', Name: 'i:0#.f|membership|grace@example.com' },
      Role: 'Family Owner (SME)',
      TimeZone: 'EMEA',
      SourceOrg: 'Delivery',
      Active: true
    })).toEqual(expect.objectContaining({
      CommunityId: 7,
      Person: expect.objectContaining({ id: 4, displayName: 'Grace' })
    }));
  });

  it('normalizes charter sign-offs and readiness', () => {
    expect(mapCharter({
      Id: 9,
      CommunityId: 7,
      Status: 'In review',
      LaunchReadiness: ['Scope approved'],
      SignOffPM: { Id: 3, Title: 'Program Manager' },
      SignOffPMDate: '2026-08-06'
    })).toEqual(expect.objectContaining({
      CommunityId: 7,
      LaunchReadiness: ['Scope approved'],
      SignOffPM: expect.objectContaining({ id: 3 })
    }));
  });
});
import { describe, expect, it } from '@jest/globals';
import { ICommunityRole } from '../../models';
import { sortCommunityRoles } from './CommunityDetail';

function role(id: number, type: ICommunityRole['Role'], timeZone?: string): ICommunityRole {
  return {
    Id: id,
    CommunityId: 1,
    Person: { id, displayName: `Person ${id}` },
    Role: type,
    TimeZone: timeZone,
    SourceOrg: 'Delivery',
    Active: true
  };
}

describe('sortCommunityRoles', () => {
  it('orders leads, time-zoned owners, then experts', () => {
    const sorted = sortCommunityRoles([
      role(3, 'Invited Expert'),
      role(2, 'Family Owner (SME)', 'EMEA'),
      role(1, 'Community Lead'),
      role(4, 'Family Owner (SME)', 'AMER')
    ]);
    expect(sorted.map((entry) => entry.Id)).toEqual([1, 4, 2, 3]);
  });
});
import { describe, expect, it } from '@jest/globals';
import { ICommunityRole } from '../../models';
import { sortCommunityRoles } from './CommunityDetail';

function role(id: number, type: ICommunityRole['Role']): ICommunityRole {
  return {
    Id: id,
    CommunityId: 1,
    Person: { id, displayName: `Person ${id}` },
    Role: type,
    SourceOrg: 'Delivery',
    Active: true
  };
}

describe('sortCommunityRoles', () => {
  it('orders the Community Lead before Subject Matter Experts', () => {
    const sorted = sortCommunityRoles([
      role(3, 'Subject Matter Expert'),
      role(2, 'Subject Matter Expert'),
      role(1, 'Community Lead'),
    ]);
    expect(sorted.map((entry) => entry.Id)).toEqual([1, 2, 3]);
  });
});
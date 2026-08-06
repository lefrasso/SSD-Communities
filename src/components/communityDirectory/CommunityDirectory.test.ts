import { describe, expect, it } from '@jest/globals';
import { buildCommunityDetailUrl } from './CommunityDirectory';

describe('buildCommunityDetailUrl', () => {
  it('adds a community query parameter', () => {
    expect(buildCommunityDetailUrl('/sites/portal/detail.aspx', 7)).toBe(
      '/sites/portal/detail.aspx?communityId=7'
    );
  });

  it('preserves an existing query string', () => {
    expect(buildCommunityDetailUrl('/detail.aspx?source=home', 7)).toBe(
      '/detail.aspx?source=home&communityId=7'
    );
  });
});
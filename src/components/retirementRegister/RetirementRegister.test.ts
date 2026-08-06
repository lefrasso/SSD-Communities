import { describe, expect, it } from '@jest/globals';
import { IForumRetirementItem } from '../../models';
import { sortRetirementItems } from './RetirementRegister';

const items: IForumRetirementItem[] = [
  { Id: 1, Title: 'Zulu', Disposition: 'Close', TargetCommunityId: 2 },
  { Id: 2, Title: 'Alpha', Disposition: 'Merge', TargetCommunityId: 1, CompletionDate: '2026-08-01' }
];

describe('sortRetirementItems', () => {
  it('sorts by title and completion state', () => {
    const names = new Map([[1, 'Azure'], [2, 'Security']]);
    expect(sortRetirementItems(items, 'Title', false, names).map((item) => item.Id)).toEqual([2, 1]);
    expect(sortRetirementItems(items, 'State', false, names).map((item) => item.Id)).toEqual([2, 1]);
  });
});
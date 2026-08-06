import { IPersonRef } from '../models';

export interface IGraphGroup {
  id: string;
  displayName: string;
  description?: string;
}

/**
 * Microsoft Graph access (MSGraphClientV3 implementation).
 * Read-mostly; the only write is the consented join (add to backing group).
 */
export interface IGraphService {
  readonly membershipEnabled: boolean;

  getMe(): Promise<IPersonRef>;
  getUserProfile(userId: string): Promise<IPersonRef | undefined>;
  searchPeople(query: string): Promise<IPersonRef[]>;
  getGroup(groupId: string): Promise<IGraphGroup | undefined>;

  /** True if the current user belongs to the backing Microsoft 365 group. */
  getMembershipState(groupId: string): Promise<boolean>;

  /** Adds the current user to the backing group (the join action). */
  joinGroup(groupId: string): Promise<void>;
}

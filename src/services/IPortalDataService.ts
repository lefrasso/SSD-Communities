import {
  ICommunity,
  ICommunityRole,
  ICharter,
  IIPCatalogItem,
  IHealthMetric,
  IForumRetirementItem,
  CommunityStatus,
  CharterStatus
} from '../models';

/** Filters for the community directory (mapped to indexed columns). */
export interface ICommunityQuery {
  serviceFamily?: string;
  status?: CommunityStatus;
  role?: string;
  searchText?: string;
}

export interface ICommunityDetailData {
  community: ICommunity;
  roles: ICommunityRole[];
  ipCatalog: IIPCatalogItem[];
}

/** Error kinds the services layer surfaces (never a silent catch). */
export type PortalErrorKind =
  | 'Timeout'
  | 'PermissionDenied'
  | 'NotConfigured'
  | 'NotFound'
  | 'Conflict'
  | 'Unknown';

/** A user-safe error: a message for the UI plus optional technical detail for logs. */
export interface IPortalError {
  kind: PortalErrorKind;
  userMessage: string;
  technical?: string;
}

/**
 * All SharePoint list access lives behind this contract (PnPjs implementation).
 * Components never call SharePoint REST directly.
 */
export interface IPortalDataService {
  getCommunities(query?: ICommunityQuery): Promise<ICommunity[]>;
  getCommunity(id: number): Promise<ICommunity | undefined>;
  getCommunityDetail(id: number): Promise<ICommunityDetailData | undefined>;
  getRoles(communityId?: number): Promise<ICommunityRole[]>;
  getCharter(communityId: number): Promise<ICharter | undefined>;
  getIPCatalog(communityId?: number): Promise<IIPCatalogItem[]>;
  getHealthMetrics(communityId?: number): Promise<IHealthMetric[]>;
  getForumRetirement(): Promise<IForumRetirementItem[]>;

  saveCharter(charter: ICharter): Promise<ICharter>;
  setCharterStatus(communityId: number, status: CharterStatus): Promise<void>;
  upsertRole(role: ICommunityRole): Promise<ICommunityRole>;
  upsertHealthMetric(metric: IHealthMetric): Promise<IHealthMetric>;
  upsertForumRetirement(item: IForumRetirementItem): Promise<IForumRetirementItem>;
}

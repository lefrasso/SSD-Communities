import { SPFI } from '@pnp/sp';
import '@pnp/sp/site-groups/web';
import '@pnp/sp/site-users/web';
import { ICommunityRole, IPersonRef } from '../models';
import { CacheService, CACHE_TTL } from './CacheService';
import { IPortalDataService } from './IPortalDataService';
import { toPortalError } from './PortalError';
import { SERVICE_STRINGS } from './ServiceStrings';

export interface ICurrentPortalUser {
  email?: string;
  loginName?: string;
}

export interface IPermissionGroupNames {
  programManagers: string;
  executiveSponsors: string;
}

export interface IPortalCapabilities {
  canEditCommunity: boolean;
  canEditRoles: boolean;
  canEditCharter: boolean;
  canSignAsLead: boolean;
  canSignAsProgramManager: boolean;
  canSignAsFamilyOwner: boolean;
  canEditMetrics: boolean;
  canViewDashboard: boolean;
  canManageRetirement: boolean;
}

export interface IPermissionService {
  getCapabilities(communityId?: number): Promise<IPortalCapabilities>;
}

interface ISharePointGroup {
  Title: string;
}

export const DEFAULT_PERMISSION_GROUPS: Readonly<IPermissionGroupNames> = {
  programManagers: 'SSD Community Program Managers',
  executiveSponsors: 'SSD Executive Sponsors'
};

function normalize(value: string | undefined): string {
  return (value || '').trim().toLowerCase();
}

export function personMatchesUser(person: IPersonRef, user: ICurrentPortalUser): boolean {
  const personKeys = [person.email, person.loginName].map(normalize).filter(Boolean);
  const userKeys = [user.email, user.loginName].map(normalize).filter(Boolean);
  return personKeys.some((key) => userKeys.indexOf(key) >= 0);
}

export function deriveCapabilities(
  groupTitles: string[],
  roles: ICommunityRole[],
  user: ICurrentPortalUser,
  communityId: number | undefined,
  groupNames: IPermissionGroupNames = DEFAULT_PERMISSION_GROUPS
): IPortalCapabilities {
  const normalizedGroups = groupTitles.map(normalize);
  const isProgramManager = normalizedGroups.indexOf(normalize(groupNames.programManagers)) >= 0;
  const isExecutiveSponsor = normalizedGroups.indexOf(normalize(groupNames.executiveSponsors)) >= 0;
  const relevantRoles = roles.filter((role) =>
    role.Active &&
    (communityId === undefined || role.CommunityId === communityId) &&
    personMatchesUser(role.Person, user)
  );
  const isLead = relevantRoles.some((role) => role.Role === 'Community Lead');
  const isFamilyOwner = relevantRoles.some((role) => role.Role === 'Family Owner (SME)');

  return {
    canEditCommunity: isProgramManager || isLead,
    canEditRoles: isProgramManager || isLead,
    canEditCharter: isProgramManager || isLead,
    canSignAsLead: isLead,
    canSignAsProgramManager: isProgramManager,
    canSignAsFamilyOwner: isFamilyOwner,
    canEditMetrics: isProgramManager || isLead,
    canViewDashboard: isProgramManager || isExecutiveSponsor,
    canManageRetirement: isProgramManager
  };
}

export class PermissionService implements IPermissionService {
  public constructor(
    private readonly sp: SPFI,
    private readonly data: IPortalDataService,
    private readonly user: ICurrentPortalUser,
    private readonly cache = new CacheService(),
    private readonly groupNames: IPermissionGroupNames = DEFAULT_PERMISSION_GROUPS
  ) {}

  public async getCapabilities(communityId?: number): Promise<IPortalCapabilities> {
    try {
      const [groups, roles] = await Promise.all([
        this.cache.getOrCreate('current-user-groups', CACHE_TTL.communities, async () => {
          const values = await this.sp.web.currentUser.groups.select('Title')() as ISharePointGroup[];
          return values.map((group) => group.Title);
        }),
        this.data.getRoles(communityId)
      ]);
      return deriveCapabilities(groups, roles, this.user, communityId, this.groupNames);
    } catch (error: unknown) {
      throw toPortalError(error, SERVICE_STRINGS.permissionsLoad);
    }
  }
}
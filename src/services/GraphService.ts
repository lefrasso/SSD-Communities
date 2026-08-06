import { MSGraphClientFactory, MSGraphClientV3 } from '@microsoft/sp-http';
import { IPersonRef } from '../models';
import { CacheService, CACHE_TTL } from './CacheService';
import { IGraphGroup, IGraphService } from './IGraphService';
import { PortalError, toPortalError } from './PortalError';
import { SERVICE_STRINGS } from './ServiceStrings';
import { ITelemetryService, TelemetryService } from './TelemetryService';

interface IGraphUserResponse {
  id: string;
  displayName: string;
  mail?: string;
  userPrincipalName?: string;
  jobTitle?: string;
}

interface IGraphUsersResponse {
  value?: IGraphUserResponse[];
}

interface IGraphGroupResponse {
  id: string;
  displayName: string;
  description?: string;
}

interface ICheckMemberGroupsResponse {
  value?: string[];
}

function mapPerson(user: IGraphUserResponse): IPersonRef {
  return {
    id: user.id,
    displayName: user.displayName,
    email: user.mail || user.userPrincipalName,
    loginName: user.userPrincipalName,
    jobTitle: user.jobTitle
  };
}

function escapeODataValue(value: string): string {
  return value.replace(/'/g, "''");
}

export class GraphService implements IGraphService {
  public constructor(
    private readonly clientFactory: MSGraphClientFactory,
    public readonly membershipEnabled: boolean,
    private readonly telemetry: ITelemetryService = new TelemetryService(),
    private readonly cache = new CacheService()
  ) {}

  public async getMe(): Promise<IPersonRef> {
    try {
      const client = await this.getClient();
      const user = await client.api('/me')
        .select('id,displayName,mail,userPrincipalName,jobTitle')
        .get() as IGraphUserResponse;
      return mapPerson(user);
    } catch (error: unknown) {
      throw toPortalError(error, SERVICE_STRINGS.profileLoad);
    }
  }

  public async getUserProfile(userId: string): Promise<IPersonRef | undefined> {
    try {
      const client = await this.getClient();
      const user = await client.api(`/users/${encodeURIComponent(userId)}`)
        .select('id,displayName,mail,userPrincipalName,jobTitle')
        .get() as IGraphUserResponse;
      return user?.id ? mapPerson(user) : undefined;
    } catch (error: unknown) {
      const portalError = toPortalError(error, SERVICE_STRINGS.otherProfileLoad);
      if (portalError.kind === 'NotFound') {
        return undefined;
      }
      throw portalError;
    }
  }

  public async searchPeople(query: string): Promise<IPersonRef[]> {
    const normalized = query.trim();
    if (normalized.length < 2) {
      return [];
    }
    try {
      const client = await this.getClient();
      const response = await client.api('/users')
        .filter(`startswith(displayName,'${escapeODataValue(normalized)}')`)
        .select('id,displayName,mail,userPrincipalName,jobTitle')
        .top(10)
        .get() as IGraphUsersResponse;
      return (response.value || []).map(mapPerson);
    } catch (error: unknown) {
      throw toPortalError(error, SERVICE_STRINGS.peopleSearch);
    }
  }

  public async getGroup(groupId: string): Promise<IGraphGroup | undefined> {
    try {
      const client = await this.getClient();
      const group = await client.api(`/groups/${encodeURIComponent(groupId)}`)
        .select('id,displayName,description')
        .get() as IGraphGroupResponse;
      return group?.id ? {
        id: group.id,
        displayName: group.displayName,
        description: group.description
      } : undefined;
    } catch (error: unknown) {
      const portalError = toPortalError(error, SERVICE_STRINGS.groupLoad);
      if (portalError.kind === 'NotFound') {
        return undefined;
      }
      throw portalError;
    }
  }

  public async getMembershipState(groupId: string): Promise<boolean> {
    if (!this.membershipEnabled) {
      return false;
    }
    try {
      return await this.cache.getOrCreate(`membership:${groupId}`, CACHE_TTL.membership, async () => {
        const client = await this.getClient();
        const response = await client.api('/me/checkMemberGroups')
          .post({ groupIds: [groupId] }) as ICheckMemberGroupsResponse;
        return (response.value || []).indexOf(groupId) >= 0;
      });
    } catch (error: unknown) {
      throw toPortalError(error, SERVICE_STRINGS.membershipCheck);
    }
  }

  public async joinGroup(groupId: string): Promise<void> {
    if (!this.membershipEnabled) {
      throw new PortalError(
        'NotConfigured',
        SERVICE_STRINGS.membershipDisabled
      );
    }
    try {
      const me = await this.getMe();
      const client = await this.getClient();
      await client.api(`/groups/${encodeURIComponent(groupId)}/members/$ref`).post({
        '@odata.id': `https://graph.microsoft.com/v1.0/directoryObjects/${encodeURIComponent(String(me.id))}`
      });
      this.cache.set(`membership:${groupId}`, true, CACHE_TTL.membership);
      this.telemetry.track('Join', 'Success');
    } catch (error: unknown) {
      const portalError = toPortalError(error, SERVICE_STRINGS.joinFailed);
      this.telemetry.track('Join', 'Failure', undefined, portalError.kind);
      throw portalError;
    }
  }

  private getClient(): Promise<MSGraphClientV3> {
    return this.clientFactory.getClient('3');
  }
}
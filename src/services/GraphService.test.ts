import { describe, expect, it, jest } from '@jest/globals';
import { MSGraphClientFactory, MSGraphClientV3 } from '@microsoft/sp-http';
import { GraphService } from './GraphService';
import { PortalError } from './PortalError';

interface IRequestStub {
  select(_fields: string): IRequestStub;
  filter(_value: string): IRequestStub;
  top(_value: number): IRequestStub;
  get(): Promise<unknown>;
  post(body: unknown): Promise<unknown>;
}

function createFactory(
  getResult: unknown,
  postResult: unknown = {},
  onPost?: (path: string, body: unknown) => void
): MSGraphClientFactory {
  const client = {
    api: (path: string): IRequestStub => {
      const request: IRequestStub = {
        select: () => request,
        filter: () => request,
        top: () => request,
        get: async () => getResult,
        post: async (body: unknown) => {
          onPost?.(path, body);
          return postResult;
        }
      };
      return request;
    }
  } as unknown as MSGraphClientV3;
  return {
    getClient: async () => client
  } as unknown as MSGraphClientFactory;
}

describe('GraphService', () => {
  it('maps the current Graph user', async () => {
    const service = new GraphService(createFactory({
      id: 'user-id',
      displayName: 'Ada Lovelace',
      mail: 'ada@example.com',
      jobTitle: 'CSA'
    }), true);
    await expect(service.getMe()).resolves.toEqual({
      id: 'user-id',
      displayName: 'Ada Lovelace',
      email: 'ada@example.com',
      loginName: undefined,
      jobTitle: 'CSA'
    });
  });

  it('uses link-only behavior when membership is disabled', async () => {
    const getClient = jest.fn(async () => ({} as MSGraphClientV3));
    const service = new GraphService({ getClient } as unknown as MSGraphClientFactory, false);
    await expect(service.getMembershipState('group-id')).resolves.toBe(false);
    await expect(service.joinGroup('group-id')).rejects.toEqual(expect.objectContaining<Partial<PortalError>>({
      kind: 'NotConfigured'
    }));
    expect(getClient).not.toHaveBeenCalled();
  });

  it('posts the current user reference when joining', async () => {
    const posts: Array<{ path: string; body: unknown }> = [];
    const service = new GraphService(createFactory({
      id: 'user-id',
      displayName: 'Ada Lovelace',
      userPrincipalName: 'ada@example.com'
    }, {}, (path, body) => posts.push({ path, body })), true);
    await service.joinGroup('group-id');
    expect(posts).toContainEqual({
      path: '/groups/group-id/members/$ref',
      body: {
        '@odata.id': 'https://graph.microsoft.com/v1.0/directoryObjects/user-id'
      }
    });
  });
});
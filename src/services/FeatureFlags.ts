export interface IPortalFeatureFlags {
  membershipEnabled: boolean;
}

export const DEFAULT_FEATURE_FLAGS: Readonly<IPortalFeatureFlags> = {
  membershipEnabled: false
};
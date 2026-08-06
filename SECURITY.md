# Security

## Authorization

SharePoint list and item permissions are the enforcement boundary. Client capability checks only hide or expose appropriate controls. [scripts/Set-PortalPermissions.ps1](scripts/Set-PortalPermissions.ps1) creates the role groups, assigns list permissions, and synchronizes community-scoped item grants from active `CommunityRoles` rows.

Run the permission synchronization after community role changes or new scoped records are created. Before production, verify restricted writes with direct SharePoint REST calls using test accounts for every role.

## Microsoft Graph

The package requests delegated `User.Read.All`, `GroupMember.ReadWrite.All`, `Group.Read.All`, `Sites.Read.All`, and `People.Read`. Graph writes are limited to adding the current user to a configured backing group. Membership features default off and degrade to direct Viva Engage links.

## Secrets and telemetry

- Store deployment certificates and passwords only in protected environment secrets.
- Never commit `.npmrc` authentication blocks or generated tokens.
- Portal telemetry records action, result, timestamp, community ID, and non-PII detail only.

Report suspected vulnerabilities privately to the repository owners rather than opening a public issue.
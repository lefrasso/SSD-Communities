# SSD Communities Portal

SharePoint Framework governance portal for SSD Technical Communities. The solution ships six React web parts over SharePoint lists and Microsoft Graph:

- Community Directory
- Community Detail and join
- My Communities
- Charter Editor
- Community Health Dashboard
- Forum Retirement Register

The functional and delivery specifications are indexed in [docs/README.md](docs/README.md).

## Zero-install preview

The canonical static entry point is [index.html](index.html). Open it directly in a browser when local package installation is blocked by device policy. It uses only local HTML, CSS, JavaScript, FY27 tokens, and representative data; no npm, server, admin rights, or network access is required.

[index.html](index.html) remains the canonical root entry point on `main`. GitHub Pages serves a minimal `gh-pages` branch containing that root file plus the local preview and token assets, so [https://lefrasso.github.io/SSD-Communities/](https://lefrasso.github.io/SSD-Communities/) runs without npm, Jekyll, or the SPFx build toolchain.

The preview includes the complete **SSD Technical Communities Playbook** plus all six operational portal views. [preview/playbook.js](preview/playbook.js) is the structured content source for:

- Purpose, vision, objectives and delivery mechanics
- The six domain communities, Cross-Training, the internal AI readiness community, and complete IP alignment
- Roles, accountabilities, channel governance and the single-community principle
- Four-stage activation, launch readiness, critical mass and rhythm of business
- Six health measures, overload reduction, risks, roadmap and definitions

Interactive join, charter, health, and retirement workflows remain available. SharePoint persistence, Microsoft Graph, permissions, and deployment are simulated; use the SPFx build in a policy-approved CI runner or Dev Box for tenant integration. The deployable provisioning schema and Dev seed use the same eight-community model, target audiences and launch gate, including the internal-only AI readiness community with no aligned offerings.

## Toolchain

The specification requires the gulp-based SPFx toolchain. SPFx **1.21.1** is therefore pinned because it is the newest supported gulp release; SPFx 1.22 and later scaffold new projects with Heft. The compatibility pairing is:

- Node `22.23.2` (`.nvmrc`)
- SPFx `1.21.1`
- React `17.0.1`
- TypeScript `5.3.3`
- PnPjs `4.14.0`
- Fluent UI React v8

## Prerequisites

1. Use Node 22: `nvm use`, or invoke the staged runtime under `%LOCALAPPDATA%\node-v22-spfx`.
2. Point npm to the approved internal registry. The public npm registry is filtered on the current corporate network; see [config/npmrc.example](config/npmrc.example).
3. Install dependencies with `npm install` and commit the resulting lockfile before the first release.
4. Configure a SharePoint Online communication site and app catalog.
5. Obtain tenant approval for the Graph scopes declared in [config/package-solution.json](config/package-solution.json).

## Commands

```powershell
npm install
npm run provision:generate
npm test
npm run lint
npm run bundle:ship
npm run package:ship
```

`npm run validate` executes the complete local quality gate. The package is emitted to `sharepoint/solution/ssd-communities-portal.sppkg`.

## Provisioning

[src/provisioning/listSchema.ts](src/provisioning/listSchema.ts) is the schema source of truth. `npm run provision:generate` combines it with environment choices and emits:

- `provisioning/generated/portal-template.xml`
- `provisioning/generated/list-schema.json`

Replace the sample service-family and time-zone values through `PROVISIONING_CONFIG_JSON` in each GitHub environment. Development can seed [provisioning/sample-data.json](provisioning/sample-data.json); Test and Production reject sample seeding in the release workflow.

## Deployment

[.github/workflows/build.yml](.github/workflows/build.yml) runs schema verification, lint, tests including axe, production bundle, and packaging. [.github/workflows/release.yml](.github/workflows/release.yml) publishes the package and applies the PnP template with certificate authentication.

Each GitHub environment needs:

- Variables: `SITE_URL`, `APP_CATALOG_URL`, `APP_CATALOG_SCOPE`
- Secrets: `PROVISIONING_CONFIG_JSON`, `M365_TENANT_ID`, `M365_CLIENT_ID`, `M365_CERTIFICATE_BASE64`, `M365_CERTIFICATE_PASSWORD`

Graph membership stays disabled in the Detail and My Communities web-part properties until `GroupMember.ReadWrite.All` is approved. The UI then uses link-only access without exposing a misleading membership state.

## Current external gates

Repository implementation is present, but dependency restore, a real SPFx build, tenant permission verification, performance measurement, and deployment require the internal npm feed and Microsoft 365 tenant resources.
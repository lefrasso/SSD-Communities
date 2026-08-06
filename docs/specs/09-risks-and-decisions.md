# 09 · Risks, Assumptions & Open Decisions

> **Spec suite:** Community Governance Portal (SSD Technical Communities · FY27 · v1.0)
> **Source:** `SSD_Communities_Portal_Technical_Specification.docx` §13 (+ delivery-environment additions) · **Status:** Draft
> **Related:** [Spec index](../README.md) · [Implementation Plan](../implementation-plan.md) · [Graph Integration](04-graph-integration.md)

## Assumptions to confirm before build

Three assumptions underpin the design and should be confirmed in **Sprint 0**:

1. **Tenant administrators will approve** the requested Graph permissions.
2. **Viva Engage communities can be created as private communities** backed by Microsoft 365 groups that the portal may read and write membership for.
3. The **portal site can be provisioned with the v-team as site owners**.

## Risks & open decisions

| Risk / open decision | Response | Owner · timing |
|---|---|---|
| **Graph permission approval not granted in time** | Raise the request in Sprint 0. The portal **degrades to link-only join** without membership state, so it still ships | PM · Sprint 0 |
| **Portal slips past the community launch dates** | Communities launch on Viva Engage and chat regardless; the portal is the **register, not the dependency** | PM |
| **Metric capture stays manual** | **Accepted for v1.0.** Automated collection needs a scheduled service, deferred with the Azure Function decision | PM |
| **Viva Engage analytics access** *(open)* | Confirm which engagement figures are available via Graph **before** committing to automated participation metrics | PM + Dev |

## Delivery-environment additions (from Sprint 0 readiness)

These are not in the source spec but are hard prerequisites discovered during setup:

| Item | Response | Owner · timing |
|---|---|---|
| **npm registry is network-filtered** — public registry TLS handshake refused for all clients | Point npm at the **approved internal / Azure Artifacts registry** (`.npmrc` or session), or build from a reachable network/VPN. **Blocks any `npm install`** | Dev lead · Sprint 0 |
| **Node / SPFx version pairing** — machine default is Node 24 | Resolved in repo: SPFx 1.21.1 + React 17.0.1 + Node 22.23.2. Portable Node 22 is staged at `%LOCALAPPDATA%\node-v22-spfx` | Dev lead · Sprint 0 |
| **Design system vs "inherit SharePoint theme"** | Theme Fluent with FY27 tokens; brand portal surfaces only; **do not fork** components (see [Design System](06-design-system.md)) | UX + Dev |

## Deferred to a future version

- **Azure Function proxy** for elevated Graph operations and **scheduled metric collection** — deliberately excluded from v1.0 to avoid hosting, secrets and monitoring obligations before adoption is proven (see [Architecture](01-architecture.md)).

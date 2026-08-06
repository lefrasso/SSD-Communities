# Community Governance Portal — Implementation Plan (v1.0)

> **Source:** `SSD_Communities_Portal_Technical_Specification.docx` (SSD Technical Communities · FY27 · v1.0 · Draft for technical review).
> **Scope of this plan:** how we build, sequence, secure, test and ship the portal described in that spec.
> **Reference design:** the [specification suite](README.md) (`docs/specs/`) is the **what**; this plan is the **how & when**. Start at the [docs index](README.md).
> **Companion assets already in this repo:** the FY27 design language in [`design-system/`](../design-system/) (tokens + Fluent theme) is the portal's visual layer.

---

## 1. Analysis summary

The spec describes a **SharePoint-native, list-backed** SPFx solution — the single source of truth (directory / register / record) for SSD Technical Communities. It deliberately avoids a custom middle tier in v1.0: web parts run client-side, persist governance data in **SharePoint lists**, and reach outside SharePoint only through **Microsoft Graph** (profiles, Entra group membership, Viva Engage/Teams links). It is **not** a conversation surface — it points at Viva Engage and chat, it does not replace them.

**What makes the design sound**
- **Schema-as-code**: lists provisioned from the solution package, versioned with the code — reproducible environments, built-in audit via Created/Modified/Author/Editor.
- **Composable web parts** over a **shared `Portal Services`** library — list access, Graph, caching, permission checks and telemetry written once.
- **Security enforced at the list level**, not just in the client — the API surface stays safe regardless of UI.
- **Graceful degradation**: if Graph approval slips, the portal ships with link-only join (no membership state) rather than blocking release.
- **Data-driven detail pages**: adding a community is a list entry, not a page build.

**Decisions / tensions to resolve early** (details in §3 and §14)
1. **Toolchain**: the spec mandates **gulp + npm**. Because SPFx 1.22+ scaffolds new projects with Heft, the implementation pins **SPFx 1.21.1**, the newest supported gulp line, with React 17.0.1.
2. **Node/SPFx pairing + registry access**: SPFx 1.21.1 requires Node 22; the repo pins 22.23.2. The public npm registry is still **network-filtered** (see §3.1) and must be replaced with the approved internal feed before `npm install`.
3. **Design system vs "inherit the SharePoint theme"**: the spec says use Fluent UI unmodified and inherit the site theme. Reconciliation in §10 — brand the portal's **own surfaces** (directory cards, KPI tiles, dashboards, section dividers) with FY27 tokens while keeping **Fluent controls unmodified** for accessibility.
4. **Open item**: Viva Engage engagement figures available via Graph (affects automated participation metrics) — confirm before committing to automation.

---

## 2. Solution at a glance

| Area | Decision (from spec) |
|---|---|
| Host | Single SharePoint **communication site** (read-mostly, no new M365 group) |
| Framework | SPFx 1.21.1 (gulp) · React 17 + TypeScript 5.3 (strict, function components + hooks) |
| UI | Fluent UI React (theme-inherited) + FY27 design tokens for portal surfaces |
| Data access | **PnPjs** (batched, paged list reads/writes) |
| Cross-service | **Microsoft Graph** via `MSGraphClientV3` |
| Data store | **6 SharePoint lists** provisioned from the package (versioning on) |
| Security | SharePoint groups + **list-level** permissions; client checks are UX only |
| Build/Release | gulp bundle/package → app catalogue → apply provisioning template (CI/CD as code) |
| Environments | Development → Test → Production (see §13) |

**Components (one package):** Community Directory · Community Detail · My Community · Charter Editor · Health Dashboard · Retirement Register · **Portal Services** (shared library).

---

## 3. Sprint 0 — prerequisites, approvals & environment

Nothing below is feature work, but the build cannot start (or ship) without it. Front-load the long-lead items.

### 3.1 Developer environment (known blockers from prior session)
- [x] **Pin the gulp-compatible SPFx line and matching Node LTS:** SPFx 1.21.1 + React 17.0.1 + Node 22.23.2 (`.nvmrc`). SharePoint Online supports this SPFx version; the staged runtime is under `%LOCALAPPDATA%\node-v22-spfx`.
- [ ] **Resolve npm registry access — hard blocker.** The public npm registry (`registry.npmjs.org`, `registry.yarnpkg.com`) is **SNI-filtered on this network** (TLS handshake refused for all clients). Point npm at the **approved internal/Azure Artifacts registry** (session or `.npmrc`) before any install, or install from a machine/VPN that can reach it.
- [x] Create the generator-compatible SPFx solution shell (six React web parts, strict TypeScript, gulp configuration, manifests, packaging).
- [ ] Set **PowerShell execution policy** for the session if scripts are blocked (`Set-ExecutionPolicy -Scope Process Bypass`) or use `npm.cmd`/`gulp.cmd`.

### 3.2 Tenant & approvals (long lead — raise on day one)
- [ ] **Submit the Graph API permission request** for tenant-admin approval in the SharePoint admin centre → API access (see §8). This is a **release dependency**; the portal degrades to link-only join without it.
- [ ] **Provision the portal communication site** with the **v-team as site owners**.
- [ ] **Create the app catalogues**: isolated site-collection catalogue for Dev, site-collection catalogue for Test, tenant catalogue for Prod (§13).
- [ ] Confirm the three underpinning assumptions: admins will approve Graph perms; Viva Engage communities are **private, M365-group-backed** and membership is readable/writable; the site can be provisioned with the v-team as owners.

### 3.3 Repo & CI/CD skeleton
- [x] Repository holds **web part source + list schema + generated provisioning template + pipeline definition** (everything as code).
- [x] Add GitHub Actions **build pipeline** (schema → lint → tests → bundle → package) and **release pipeline** (catalogue → deploy → provisioning → permissions).
- [ ] Enable **Office 365 CDN** (fallback to a SharePoint library).

**Exit criteria:** a clean `gulp bundle --ship` runs on pinned Node against the internal registry; empty package deploys to the Dev catalogue; Graph approval request is submitted; portal site exists with v-team ownership.

---

## 4. Data model → implementation

All six lists are provisioned from the package (schema versioned with code). Every list inherits Created/Modified/Author/Editor for audit.

| List | Cardinality | Key columns (from spec) | Lookups | Index (threshold safety) |
|---|---|---|---|---|
| **Communities** (spine) | 1 / community | Title, ServiceFamily (choice), ScopeInScope, ScopeOutOfScope, VivaEngageGroupId, VivaEngageUrl, ChatGroupUrl, TargetRoles (multi-choice), IsCrossCommunity (Y/N), Status (Proposed→Retired), LaunchDate | — | ServiceFamily, Status, Title |
| **CommunityRoles** | many / community | Community, Person (Person), Role (Lead/Family Owner/Invited Expert), TimeZone, SourceOrg, Active (Y/N) | → Communities | Community, Role, TimeZone |
| **Charters** | 1 / community | Community, InteractionModel, Cadence, ReadinessPlan, LaunchReadiness (multi-choice ×6), Status (Draft/In review/Signed off), SignOffLead/PM/FamilyOwner (Person+Date), CharterVersion | → Communities | Community, Status |
| **IPCatalog** | many / community | IP fields + owning community (build-once/share-everywhere visibility) | → Communities | Community |
| **HealthMetrics** | community × measure × period | Community, Measure (6 measures), Period (Baseline/Q2/Q3/Year-end FY27), Value, Unit, IsBaseline (Y/N), Commentary | → Communities | Community, Period, Measure |
| **ForumRetirement** | 1 / legacy forum | Forum ref, Disposition (Migrate/Merge/Close), TargetCommunity, CompletionDate | → Communities | Disposition |

**Build tasks**
- [x] Author list definitions + generated site provisioning template (fields, choices, lookups, **indexed columns on every lookup/filter field**).
- [x] Encode **validation rules**: unique Charter lookup; **charter `Status = Signed off` gates directory publication**; `TimeZone` required for Family Owners.
- [x] Add idempotent representative sample data seeding for Dev.
- [x] Add **TypeScript models** mirroring each list.

---

## 5. `Portal Services` shared library (build before the web parts)

Everything the six web parts depend on. Written once, tested once.

- [x] **List access (PnPjs)**: typed CRUD, batched detail read, paging, indexed `$select`/`$filter`, cache invalidation and typed errors.
- [x] **Graph access (`MSGraphClientV3`)**: profiles, membership, join, group properties and people search.
- [x] **Caching**: session cache with TTL, invalidation, and in-flight request de-duplication.
- [x] **Permission checks**: role/group capability map for UX; PnP scripts enforce list/item permissions.
- [x] **Telemetry**: PII-free page view, join, charter, metric and retirement events.
- [x] **Localization**: SPFx localized resource with English launch strings.

**Exit criteria:** services unit-tested with mocked SharePoint/Graph and consumed by the six production web parts. Executing the full Jest/gulp gate awaits dependency restore.

---

## 6. Web part build matrix

| # | Component | Reads | Writes | Graph | Notable logic |
|---|---|---|---|---|---|
| 1 | **Community Directory** | Communities | — | photos (optional) | Card grid; filter by family/topic/role; discovery surface; **warm-cache < 2s** |
| 2 | **Community Detail** | Communities, CommunityRoles, IPCatalog | group membership (join) | User.Read.All, GroupMember.ReadWrite.All | Scope, roles **by time zone**, owned IPs, channel links, **join action**; single-community confirm on 2nd join |
| 3 | **My Community** | CommunityRoles, Communities | — | membership state | User's membership + quick links; reinforces single-community focus |
| 4 | **Charter Editor** | Charters, Communities | Charters | People.Read | Nine-section form, six-item readiness checklist, **three-way sign-off** (Lead/PM/Family Owner); Draft→In review→Signed off; PM signature records overlap review |
| 5 | **Health Dashboard** | HealthMetrics, Communities | — | — | Portfolio view of **six measures vs baseline**, by community & period; Program Manager + Exec Sponsor |
| 6 | **Retirement Register** | ForumRetirement | ForumRetirement | — | Forum inventory, disposition tracking, **progress vs reduction target** |

**Recommended build order (dependency-driven):** Directory (1) → Detail + join (2) → My Community (3) → Charter Editor + sign-off (4) → Health Dashboard (5) → Retirement Register (6). Directory + Detail form the discovery/join MVP; charter gates publication; dashboard/retirement are portfolio/admin surfaces.

---

## 7. Phased delivery (increment-ordered, dependency-driven)

> Sequencing, not schedule. Each increment ships something demonstrable.

- **Increment 0 — Foundation:** Sprint-0 prerequisites (§3), data model provisioned (§4), `Portal Services` core (§5), CI/CD green.
- **Increment 1 — Discovery MVP:** Community Directory (read-only) + Community Detail (read-only) themed with FY27 tokens; directory performance NFR met.
- **Increment 2 — Join & identity:** Graph membership state + **join flow**, My Community, single-community confirmation. (Falls back to link-only if Graph approval is pending.)
- **Increment 3 — Governance:** Charter Editor + three-way sign-off workflow; **publication gate** wired to charter status; list-level security scoping (§9).
- **Increment 4 — Insight & consolidation:** Health Dashboard (six measures vs baseline) + Retirement Register (reduction-target progress) + telemetry feeding participation.
- **Increment 5 — Hardening:** accessibility (WCAG 2.1 AA), performance/threshold pass, responsive/mobile, localization audit; **UAT with Family Owners in Test**.
- **Increment 6 — Production:** Graph permission grant confirmed, tenant-catalogue release scoped to the portal site, provisioning applied, handover to the v-team.

---

## 8. Microsoft Graph integration plan

Called through `MSGraphClientV3` against the tenant-wide **SharePoint Online Client Extensibility Web Application Principal**. Permissions declared in the solution manifest; **tenant-admin approval in the SharePoint admin centre is a deployment dependency**, not runtime.

| Permission | Type | Used for | Degradation if withheld |
|---|---|---|---|
| `User.Read.All` | Delegated | Resolve role holders; photos/titles on pages | Show names only |
| `GroupMember.ReadWrite.All` | Delegated | Read membership state + **join** | **Link-only join**, no membership state |
| `Group.Read.All` | Delegated | Read Viva Engage backing-group properties | Hide derived group info |
| `Sites.Read.All` | Delegated | Future cross-site reads | No impact in v1.0 |
| `People.Read` | Delegated | People pickers when assigning roles | Fallback to basic search |

- [x] Declare `webApiPermissionRequests`; **tenant submission remains a Sprint 0 environment action**.
- [x] Implement the **degradation path** (web-part feature setting off → link-only).
- [x] Limit Graph writes to **consented membership operations**.

---

## 9. Security & permissions plan

Authorisation layered on **SharePoint groups**; every restriction enforced by **list-level permissions**. Discovery is universal (everyone sees directory entries); conversation content stays in the private Viva Engage communities (the portal never renders it).

| Role | Capability | SharePoint enforcement |
|---|---|---|
| Member (all SSD) | Browse directory, view any community, join | **Read** on all lists |
| Community Lead | Edit own community, charter, roles, IPs, metrics | **Contribute**, item-level scoped to their community |
| Family Owner (SME) | Contribute IP alignment; sign off charter | **Contribute** on IPCatalog + Charters |
| Community Program Manager | Full portfolio, overlap review, retirement | **Full Control** on portal lists |
| Executive Sponsor | Read dashboard + every record | **Read** across all lists |

- [x] Define SharePoint groups + list/item permission synchronization as PnP PowerShell.
- [ ] Verify **API surface is safe with the client bypassed** in the tenant using each role test account.
- [x] Client-side permission checks drive UI affordances only (never the sole gate).

---

## 10. Design system integration (FY27)

Reconciling the FY27 brand ([`design-system/`](../design-system/)) with the spec's "Fluent UI unmodified, inherit the SharePoint theme":

- **Keep Fluent controls unmodified** (buttons, pickers, dialogs, form fields) for built-in contrast/focus/accessibility.
- **Apply FY27 tokens** ([`tokens.scss`](../design-system/tokens.scss) / [`theme.ts`](../design-system/theme.ts)) as the **Fluent theme** (`ssdFluentPalette` + `ssdFonts`) and via CSS variables on the portal's **own surfaces**: directory cards, KPI tiles, section dividers, dashboard, timeline.
- **Theme, don't fork**: no bespoke component library — tokens + theme only, so the portal still reads as native SharePoint while carrying the SSD FY27 identity.
- Respect brand rules: Segoe Sans Display (host the webfont), approved palette only, light-gray/white surfaces, **visuals over tables**, WCAG AA.

---

## 11. Non-functional requirements → implementation

| NFR (spec) | How the plan meets it |
|---|---|
| Directory < 2s warm cache | PnPjs **batching + paging**, `Portal Services` cache, `$select` on indexed columns |
| List thresholds | **Indexed columns** on all lookup/filter fields; no query exceeds the view threshold |
| Accessibility WCAG 2.1 AA | Fluent unmodified; keyboard nav; automated **axe** checks in CI; contrast from design tokens |
| Responsive | Mobile + SharePoint mobile app; directory + join are priority paths |
| Localization | Strings externalised from first commit; English at launch |
| Telemetry | Page views, joins, charter transitions logged → participation measure |
| Browser support | Current Edge + Chrome (M365 supported browsers) |

---

## 12. Testing & quality gates

- [x] Add **unit tests** for `Portal Services` (mock SharePoint/Graph) and component logic; strict core validation passes. Full Jest/lint execution awaits dependency restore.
- [x] Add automated **axe** coverage in CI; manual keyboard/screen-reader pass on priority paths remains an environment/UAT action.
- [ ] **Performance**: directory warm-cache budget verified against seeded data at realistic volume; threshold queries validated.
- [ ] **UAT** with Family Owners in the Test environment (charter authoring + sign-off, join flow).
- [ ] **Definition of Done** per component: reads/writes correct, permissions enforced at list level, NFRs met, telemetry emitting, localized strings, a11y pass.

---

## 13. Deployment & environments

| Environment | Purpose | Deployment target |
|---|---|---|
| Development | Feature work, local debug | Dev tenant **or** isolated site-collection app catalogue |
| Test | Integration + Family Owner UAT | Site-collection app catalogue in prod tenant, scoped to test site |
| Production | Live portal | **Tenant app catalogue**, scoped to the portal site |

- **Build pipeline:** lint → unit tests → production bundle → package.
- **Release pipeline:** upload to catalogue → deploy → **apply provisioning template** (create/update lists). No environment configured by hand, including Dev.
- Assets from **O365 CDN** (SharePoint-library fallback). v1.0 targets a **single site** — scope accordingly (avoid tenant-wide deploy unless multi-site).

---

## 14. Risks, assumptions & open decisions

| Item | Response / mitigation | Owner |
|---|---|---|
| **npm registry filtered** (current blocker) | Point npm at internal/Azure Artifacts registry before install; or build from a reachable network | Dev lead · Sprint 0 |
| **Node/SPFx version pairing** | Confirm SPFx vs tenant build; pin matching Node (22.x); document in repo | Dev lead · Sprint 0 |
| **Graph approval not granted in time** | Requested in Sprint 0; ship **link-only join** degradation; enable membership on grant | PM · Sprint 0 |
| **Design system vs SP theme** | Theme + tokens over unmodified Fluent (§10); no forked components | UX + Dev |
| Portal slips past community launch dates | Communities launch on Viva Engage/chat regardless; portal is the register, not a dependency | PM |
| Metric capture stays manual | Accepted for v1.0; automation waits on the Azure Function decision | PM |
| **Viva Engage analytics via Graph** (open) | Confirm which engagement figures are available **before** committing to automated participation metrics | PM + Dev |
| Assumptions to confirm | Admins approve Graph perms; Viva Engage private, M365-group-backed, membership read/write; site provisioned with v-team as owners | PM · Sprint 0 |

---

## 15. Immediate next actions

1. **Unblock the registry** (internal npm feed), run `npm install`, commit the lockfile, then run `npm run validate`.
2. **Submit the Graph permission request** for tenant-admin approval (longest lead).
3. **Provision the portal communication site** (v-team owners) + the three app catalogues.
4. Configure protected GitHub environment variables/secrets and run the Development release (with sample data only in Dev).
5. Verify direct REST authorization with each role account; rerun permission synchronization after role/item changes.
6. Measure warm-cache performance, complete manual accessibility checks, and run Family Owner UAT in Test.

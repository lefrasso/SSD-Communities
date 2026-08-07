# 07 · Non-Functional Requirements & Quality

> **Spec suite:** Community Governance Portal (SSD Technical Communities · FY27 · v1.0)
> **Source:** `SSD_Communities_Portal_Technical_Specification.docx` §10 · **Status:** Draft
> **Related:** [Spec index](../README.md) · [Data Model](02-data-model.md) · [Components](03-components.md)

## Non-functional requirements

| Requirement | Target | How the design meets it |
|---|---|---|
| **Performance** | Directory renders within **two seconds on a warm cache** | PnPjs **batching + paging**; Portal Services cache; `$select` on indexed columns |
| **List thresholds** | Indexed columns on all lookup/filter fields; **no query exceeds the list view threshold** | Index plan in [Data Model](02-data-model.md); server-side filter/paging only |
| **Accessibility** | **WCAG 2.1 AA**; keyboard navigable | Fluent UI components used **unmodified** for contrast and focus; automated + manual checks |
| **Responsive** | Usable on mobile and in the SharePoint mobile app | Directory and **join flow are the priority paths** |
| **Localization** | Strings externalised from first commit; **English only at launch** | i18n scaffolding in Portal Services |
| **Telemetry** | Page views, joins and charter transitions logged | Feeds the **Participation** health measure |
| **Browser support** | Current **Edge and Chrome** | Matches Microsoft 365 supported browsers |

## Quality gates

- **Static:** strict TypeScript, lint clean, no `any` in service contracts.
- **Unit tests:** `Portal Services` (mock SharePoint + Graph) and component logic.
- **Accessibility:** automated (e.g. axe) in CI **plus** manual keyboard/screen-reader passes on priority paths (directory, detail, join, charter).
- **Performance:** verify the directory warm-cache budget against seeded data at realistic volume; confirm no threshold breaches.
- **UAT:** Subject Matter Expert review in the **Test** environment (charter authoring + sign-off, join flow) — see [Build & Deployment](08-build-deploy-environments.md).

## Definition of Done (per component)

A component is done when:

1. Reads/writes are correct and **batched/paged** where applicable.
2. Restrictions are **enforced at the list level**, not just the client (see [Security](05-security-permissions.md)).
3. NFR targets for that surface are met (notably the directory performance budget).
4. **Telemetry** events emit for the relevant interactions.
5. All strings are **localized/externalised**.
6. **Accessibility** pass (keyboard + contrast + focus) is green.
7. Themed with FY27 tokens using **unmodified Fluent controls** (see [Design System](06-design-system.md)).
# Community Governance Portal — Documentation

**SSD Technical Communities · FY27 · Version 1.0 · Draft for technical review**

This folder is the design-and-delivery documentation for the Community Governance Portal — the SharePoint-native SPFx solution that is the single source of truth (directory / register / record) for the SSD Technical Communities initiative.

## How the docs fit together

| Document | Answers | Use it for |
|---|---|---|
| [Implementation Plan](implementation-plan.md) | **How & when** | Roadmap, Sprint 0 prerequisites, sequencing, delivery increments |
| [Spec suite](#specification-suite) (`specs/`) | **What** | The reference design each increment is built against |

The plan is the execution roadmap; the specs are the reference design. Build tasks in the plan point at the specs below.

## Specification suite

| # | Spec | Covers | Source §* |
|---|---|---|---|
| 01 | [Architecture & Information Architecture](specs/01-architecture.md) | Purpose, scope, principles, tech stack, IA | §1–4 |
| 02 | [Data Model](specs/02-data-model.md) | The six SharePoint lists, relationships, validation, indexing | §5 |
| 03 | [Components & User Journeys](specs/03-components.md) | Six web parts + Portal Services; key journeys | §6, §9 |
| 04 | [Microsoft Graph Integration](specs/04-graph-integration.md) | Permissions, join flow, degradation path | §7 |
| 05 | [Security & Permissions](specs/05-security-permissions.md) | Roles, SharePoint groups, list-level enforcement | §8 |
| 06 | [Design System Integration](specs/06-design-system.md) | FY27 tokens over Fluent; branded surfaces | — |
| 07 | [Non-Functional Requirements & Quality](specs/07-nfr-and-quality.md) | Performance, a11y, testing, quality gates | §10 |
| 08 | [Build, Deployment & Environments](specs/08-build-deploy-environments.md) | Toolchain, pipelines, Dev/Test/Prod | §11–12 |
| 09 | [Risks, Assumptions & Open Decisions](specs/09-risks-and-decisions.md) | What must be confirmed before build | §13 |

*\*Section numbers refer to `SSD_Communities_Portal_Technical_Specification.docx`.*

## Related assets

- [`design-system/`](../design-system/) — the FY27 visual language (living style guide + CSS/SCSS/TS tokens) that themes the portal.

## Status legend

`Draft` — under technical review · `Confirmed` — assumption validated · `Blocked` — waiting on a dependency (see spec 09).

> **Current build gate:** Node 22 is pinned; the public **npm registry is network-filtered** here, so dependency restore requires the approved internal feed.

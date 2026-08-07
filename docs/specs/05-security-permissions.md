# 05 · Security & Permissions

> **Spec suite:** Community Governance Portal (SSD Technical Communities · FY27 · v1.0)
> **Source:** `SSD_Communities_Portal_Technical_Specification.docx` §8 · **Status:** Draft
> **Related:** [Spec index](../README.md) · [Data Model](02-data-model.md) · [Graph Integration](04-graph-integration.md)

## Model

Portal authorisation is layered on **SharePoint groups**, not implemented in code. Client-side permission checks control what the interface *offers*, but **every restriction is enforced by list-level permissions** so the API surface is safe regardless of what the client does.

> **Principle:** client-side checks are UX only. If the client is bypassed, list-level permissions must still make every restricted operation fail.

## Roles → capability → enforcement

| Role | Portal capability | SharePoint enforcement |
|---|---|---|
| **Member** (all SSD) | Browse the directory, view any community page, join a community | **Read** on all lists; no write |
| **Community Lead** | Edit their own community, its charter, roles, IPs and metrics | **Contribute** with **item-level scoping** to their community |
| **Subject Matter Expert** | Contribute specialist guidance and consolidated feedback; sign off the community charter | **Contribute** on `IPCatalog` and `Charters` |
| **Community Program Manager** | Full portfolio management, overlap review, retirement register | **Full Control** on all portal lists |
| **Executive Sponsor** | Read the dashboard and every community record | **Read** across all lists |

## Discovery vs. conversation

- Users see the **directory entry for every community**, including ones they have not joined — **discovery is the point of a directory**.
- Viva Engage communities are **private**, so the portal **never renders their content**. It renders **membership state** and a **join link**; the join operation adds the user to the backing Microsoft 365 group (see [Graph Integration](04-graph-integration.md)).
- Users **see no conversation content until they are members** — and that content lives in Viva Engage, not the portal.

## Implementation tasks

- [ ] Create the SharePoint groups mapped to the five roles.
- [ ] Apply **list-level permissions**; add **item-level scoping** so a Community Lead can only edit their own community's rows.
- [ ] Wire `Portal Services` permission checks to drive UI affordances (never the sole gate).
- [ ] Verify the model by exercising restricted operations **with the client bypassed** (direct REST) — every restricted call must fail.

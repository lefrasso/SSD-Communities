# Contributing

## Local setup

Use Node 22 from `.nvmrc` and the approved internal npm feed. Then run:

```powershell
npm install
npm run validate
```

## Change rules

- Keep SharePoint access behind `IPortalDataService` and Graph access behind `IGraphService`.
- Update `listSchema.ts`, regenerate provisioning assets, and commit both generated files for schema changes.
- Keep UI strings in `src/loc/en-us.js` and its declaration file.
- Treat client permission checks as presentation logic only; update the PnP permission script for authorization changes.
- Add focused unit tests for business rules and axe coverage for new priority UI states.
- Do not enable membership web-part properties before Graph approval is granted.

## Pull request gate

The build workflow must pass schema generation, strict lint, unit/accessibility tests, production bundling, and `.sppkg` packaging.
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const output = path.join(os.tmpdir(), 'ssd-communities-core-validation');
const files = [
  'src/models/enums.ts',
  'src/models/entities.ts',
  'src/models/index.ts',
  'src/services/IPortalDataService.ts',
  'src/services/IGraphService.ts',
  'src/services/portalLogic.ts',
  'src/services/CacheService.ts',
  'src/services/FeatureFlags.ts',
  'src/services/PortalError.ts',
  'src/services/TelemetryService.ts',
  'src/services/sharePointMappers.ts',
  'src/provisioning/listSchema.ts'
].map((file) => path.join(root, file));

fs.rmSync(output, { recursive: true, force: true });
const options = {
  target: ts.ScriptTarget.ES2019,
  module: ts.ModuleKind.Node16,
  moduleResolution: ts.ModuleResolutionKind.Node16,
  strict: true,
  skipLibCheck: true,
  noEmitOnError: true,
  outDir: output,
  rootDir: path.join(root, 'src'),
  lib: ['lib.es2019.d.ts', 'lib.dom.d.ts']
};
const program = ts.createProgram(files, options);
const emit = program.emit();
const diagnostics = ts.getPreEmitDiagnostics(program).concat(emit.diagnostics);
if (diagnostics.length > 0) {
  const host = {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => root,
    getNewLine: () => os.EOL
  };
  process.stderr.write(ts.formatDiagnosticsWithColorAndContext(diagnostics, host));
  process.exitCode = 1;
} else {
  const logic = require(path.join(output, 'services', 'portalLogic.js'));
  const mappers = require(path.join(output, 'services', 'sharePointMappers.js'));
  const schema = require(path.join(output, 'provisioning', 'listSchema.js'));
  const { CacheService } = require(path.join(output, 'services', 'CacheService.js'));

  if (!logic.canTransitionCharter('Draft', 'In review') || logic.canTransitionCharter('Signed off', 'Draft')) {
    throw new Error('Charter transition validation failed.');
  }
  const community = mappers.mapCommunity({
    Id: 1,
    Title: 'Azure',
    Status: 'Active',
    TargetRoles: { results: ['Community Lead'] }
  });
  if (community.TargetRoles[0] !== 'Community Lead') {
    throw new Error('SharePoint mapper validation failed.');
  }
  if (schema.COMMUNITY_LISTS.length !== 6) {
    throw new Error('Provisioning schema validation failed.');
  }
  let now = 0;
  const cache = new CacheService('validation', undefined, () => now);
  cache.set('value', 42, 10);
  if (cache.get('value') !== 42) {
    throw new Error('Cache read validation failed.');
  }
  now = 11;
  if (cache.get('value') !== undefined) {
    throw new Error('Cache expiry validation failed.');
  }
  process.stdout.write('Strict core compile and behavior validation passed.\n');
}

fs.rmSync(output, { recursive: true, force: true });
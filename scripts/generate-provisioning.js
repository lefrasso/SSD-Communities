'use strict';

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const argumentsList = process.argv.slice(2);

function argumentValue(name, fallback) {
  const index = argumentsList.indexOf(name);
  return index >= 0 && argumentsList[index + 1] ? argumentsList[index + 1] : fallback;
}

function readSchema() {
  const filePath = path.join(root, 'src', 'provisioning', 'listSchema.ts');
  const source = fs.readFileSync(filePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 }
  });
  const moduleValue = { exports: {} };
  const evaluate = new Function('module', 'exports', 'require', transpiled.outputText);
  evaluate(moduleValue, moduleValue.exports, require);
  return moduleValue.exports.COMMUNITY_LISTS;
}

function xml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function displayName(internalName) {
  return internalName.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function resolveChoices(field, configuration) {
  if (field.choices && field.choices.length > 0) return field.choices;
  if (field.internalName === 'ServiceFamily') return configuration.serviceFamilies;
  if (field.internalName === 'TimeZone') return configuration.timeZones;
  if (field.internalName === 'LaunchReadiness') return configuration.launchReadiness;
  return [];
}

function fieldXml(field, configuration) {
  const attributes = [
    `Type="${field.type}"`,
    `Name="${xml(field.internalName)}"`,
    `StaticName="${xml(field.internalName)}"`,
    `DisplayName="${xml(displayName(field.internalName))}"`,
    `Required="${field.required ? 'TRUE' : 'FALSE'}"`,
    `Indexed="${field.indexed || field.unique ? 'TRUE' : 'FALSE'}"`
  ];
  if (field.unique) attributes.push('EnforceUniqueValues="TRUE"');
  if (field.type === 'Lookup') {
    attributes.push(`List="{listid:${xml(field.lookupList)}}"`, 'ShowField="Title"');
  }
  if (field.type === 'DateTime') attributes.push('Format="DateOnly"');
  if (field.type === 'User') attributes.push('UserSelectionMode="PeopleOnly"', 'UserSelectionScope="0"');
  if (field.type === 'Note') attributes.push('NumLines="6"', 'RichText="FALSE"');
  if (field.type === 'URL') attributes.push('Format="Hyperlink"');

  const description = field.description ? `<Description>${xml(field.description)}</Description>` : '';
  const choices = resolveChoices(field, configuration);
  const choiceXml = field.type === 'Choice' || field.type === 'MultiChoice'
    ? `<CHOICES>${choices.map((choice) => `<CHOICE>${xml(choice)}</CHOICE>`).join('')}</CHOICES>`
    : '';
  return `            <Field ${attributes.join(' ')}>${description}${choiceXml}</Field>`;
}

function validateConfiguration(configuration) {
  if (!configuration.serviceFamilies || configuration.serviceFamilies.length === 0) {
    throw new Error('Provisioning requires at least one service family.');
  }
  if (!configuration.timeZones || configuration.timeZones.length === 0) {
    throw new Error('Provisioning requires at least one time zone.');
  }
  if (!configuration.launchReadiness || configuration.launchReadiness.length !== 6) {
    throw new Error('Provisioning requires exactly six launch-readiness choices.');
  }
}

function buildTemplate(definitions, configuration) {
  const listXml = definitions.map((definition) => {
    const fields = definition.fields
      .filter((field) => field.internalName !== 'Title')
      .map((field) => fieldXml(field, configuration))
      .join('\n');
    return [
      `        <pnp:ListInstance Title="${xml(definition.title)}" Description="${xml(definition.description)}" TemplateType="100" Url="Lists/${xml(definition.internalName)}" EnableVersioning="true" EnableAttachments="false">`,
      '          <pnp:Fields>',
      fields,
      '          </pnp:Fields>',
      '        </pnp:ListInstance>'
    ].join('\n');
  }).join('\n');

  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<pnp:Provisioning xmlns:pnp="http://schemas.dev.office.com/PnP/2022/09/ProvisioningSchema">',
    '  <pnp:Preferences Generator="SSD Communities schema generator" />',
    '  <pnp:Templates ID="SSD-COMMUNITIES-TEMPLATES">',
    '    <pnp:ProvisioningTemplate ID="SSD-COMMUNITIES-V1" Version="1">',
    '      <pnp:Lists>',
    listXml,
    '      </pnp:Lists>',
    '    </pnp:ProvisioningTemplate>',
    '  </pnp:Templates>',
    '</pnp:Provisioning>',
    ''
  ].join('\n');
}

const configPath = path.resolve(root, argumentValue('--config', 'provisioning/config.sample.json'));
const outputPath = path.resolve(root, argumentValue('--output', 'provisioning/generated/portal-template.xml'));
const snapshotPath = path.resolve(root, argumentValue('--snapshot', 'provisioning/generated/list-schema.json'));
const configuration = process.env.PROVISIONING_CONFIG_JSON
  ? JSON.parse(process.env.PROVISIONING_CONFIG_JSON)
  : JSON.parse(fs.readFileSync(configPath, 'utf8'));
validateConfiguration(configuration);
const definitions = readSchema();
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, buildTemplate(definitions, configuration));
fs.writeFileSync(snapshotPath, `${JSON.stringify({ choices: configuration, lists: definitions }, null, 2)}\n`);
console.log(`Generated ${path.relative(root, outputPath)} and ${path.relative(root, snapshotPath)}.`);
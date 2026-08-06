import { SPFI } from '@pnp/sp';
import '@pnp/sp/fields';
import '@pnp/sp/lists';
import '@pnp/sp/webs';
import { PortalError, SERVICE_STRINGS, toPortalError } from '../services';
import { COMMUNITY_LISTS, IFieldDef, IListDef } from './listSchema';

export interface IPortalProvisioningChoices {
  serviceFamilies: string[];
  timeZones: string[];
  launchReadiness: string[];
}

export const DEFAULT_LAUNCH_READINESS: string[] = [
  'Scope approved',
  'Community roles assigned',
  'Viva Engage and chat channels ready',
  'Interaction model and cadence agreed',
  'Readiness plan agreed',
  'Health baseline captured'
];

interface IListIdentity {
  Id: string;
}

interface IFieldIdentity {
  InternalName: string;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function displayName(internalName: string): string {
  return internalName.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function fieldType(field: IFieldDef): string {
  const types: Record<IFieldDef['type'], string> = {
    Text: 'Text',
    Note: 'Note',
    Choice: 'Choice',
    MultiChoice: 'MultiChoice',
    Boolean: 'Boolean',
    DateTime: 'DateTime',
    Number: 'Number',
    URL: 'URL',
    User: 'User',
    Lookup: 'Lookup'
  };
  return types[field.type];
}

export function buildFieldXml(
  field: IFieldDef,
  choices: string[] = field.choices || [],
  lookupListId?: string
): string {
  const attributes = [
    `Type="${fieldType(field)}"`,
    `Name="${escapeXml(field.internalName)}"`,
    `StaticName="${escapeXml(field.internalName)}"`,
    `DisplayName="${escapeXml(displayName(field.internalName))}"`,
    `Required="${field.required ? 'TRUE' : 'FALSE'}"`,
    `Indexed="${field.indexed || field.unique ? 'TRUE' : 'FALSE'}"`
  ];
  if (field.unique) {
    attributes.push('EnforceUniqueValues="TRUE"');
  }
  if (field.type === 'Lookup') {
    if (!lookupListId) {
      throw new PortalError('NotConfigured', `Lookup target is missing for ${field.internalName}.`);
    }
    attributes.push(`List="{${escapeXml(lookupListId)}}"`, 'ShowField="Title"');
  }
  if (field.type === 'DateTime') {
    attributes.push('Format="DateOnly"');
  }
  if (field.type === 'User') {
    attributes.push('UserSelectionMode="PeopleOnly"', 'UserSelectionScope="0"');
  }
  if (field.type === 'Note') {
    attributes.push('NumLines="6"', 'RichText="FALSE"');
  }
  if (field.type === 'URL') {
    attributes.push('Format="Hyperlink"');
  }

  const description = field.description
    ? `<Description>${escapeXml(field.description)}</Description>`
    : '';
  const choiceXml = field.type === 'Choice' || field.type === 'MultiChoice'
    ? `<CHOICES>${choices.map((choice) => `<CHOICE>${escapeXml(choice)}</CHOICE>`).join('')}</CHOICES>`
    : '';
  return `<Field ${attributes.join(' ')}>${description}${choiceXml}</Field>`;
}

export class PortalProvisioner {
  public constructor(private readonly sp: SPFI) {}

  public async provision(choices: IPortalProvisioningChoices): Promise<void> {
    this.validateChoices(choices);
    try {
      const listIds = await this.ensureLists(COMMUNITY_LISTS);
      for (const definition of COMMUNITY_LISTS) {
        await this.ensureFields(definition, choices, listIds);
        if (definition.validationFormula) {
          await this.sp.web.lists.getByTitle(definition.title).update({
            ValidationFormula: definition.validationFormula,
            ValidationMessage: definition.validationMessage || ''
          });
        }
      }
    } catch (error: unknown) {
      throw toPortalError(error, SERVICE_STRINGS.provisioningFailed);
    }
  }

  private async ensureLists(definitions: IListDef[]): Promise<Map<string, string>> {
    const listIds = new Map<string, string>();
    for (const definition of definitions) {
      await this.sp.web.lists.ensure(
        definition.title,
        definition.description,
        100,
        false,
        { EnableVersioning: true }
      );
      const list = await this.sp.web.lists.getByTitle(definition.title).select('Id')() as IListIdentity;
      listIds.set(definition.internalName, list.Id.replace(/[{}]/g, ''));
    }
    return listIds;
  }

  private async ensureFields(
    definition: IListDef,
    provisioningChoices: IPortalProvisioningChoices,
    listIds: Map<string, string>
  ): Promise<void> {
    const list = this.sp.web.lists.getByTitle(definition.title);
    for (const field of definition.fields) {
      const choices = this.resolveChoices(field, provisioningChoices);
      const lookupListId = field.lookupList ? listIds.get(field.lookupList) : undefined;
      const existing = await this.tryGetField(definition.title, field.internalName);
      if (!existing) {
        await list.fields.createFieldAsXml(buildFieldXml(field, choices, lookupListId));
        continue;
      }
      const update: Record<string, unknown> = {
        Required: !!field.required,
        Indexed: !!field.indexed || !!field.unique,
        EnforceUniqueValues: !!field.unique
      };
      if (field.type === 'Choice' || field.type === 'MultiChoice') {
        update.Choices = choices;
      }
      await list.fields.getByInternalNameOrTitle(field.internalName).update(update);
    }
  }

  private resolveChoices(field: IFieldDef, choices: IPortalProvisioningChoices): string[] {
    if ((field.choices || []).length > 0) {
      return field.choices || [];
    }
    if (field.internalName === 'ServiceFamily') {
      return choices.serviceFamilies;
    }
    if (field.internalName === 'TimeZone') {
      return choices.timeZones;
    }
    if (field.internalName === 'LaunchReadiness') {
      return choices.launchReadiness;
    }
    return [];
  }

  private async tryGetField(listTitle: string, fieldName: string): Promise<IFieldIdentity | undefined> {
    try {
      return await this.sp.web.lists.getByTitle(listTitle).fields
        .getByInternalNameOrTitle(fieldName)
        .select('InternalName')() as IFieldIdentity;
    } catch (error: unknown) {
      const portalError = toPortalError(error);
      if (portalError.kind === 'NotFound') {
        return undefined;
      }
      throw portalError;
    }
  }

  private validateChoices(choices: IPortalProvisioningChoices): void {
    if (choices.serviceFamilies.length === 0) {
      throw new PortalError('NotConfigured', 'At least one service family must be configured.');
    }
    if (choices.timeZones.length === 0) {
      throw new PortalError('NotConfigured', 'At least one Family Owner time zone must be configured.');
    }
    if (choices.launchReadiness.length !== 6) {
      throw new PortalError('NotConfigured', 'Exactly six launch-readiness choices must be configured.');
    }
  }
}
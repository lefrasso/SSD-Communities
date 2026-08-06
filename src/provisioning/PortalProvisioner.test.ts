import { describe, expect, it } from '@jest/globals';
import { PortalError } from '../services';
import { buildFieldXml } from './PortalProvisioner';

describe('buildFieldXml', () => {
  it('builds indexed unique lookup fields', () => {
    expect(buildFieldXml({
      internalName: 'Community',
      type: 'Lookup',
      required: true,
      indexed: true,
      unique: true,
      lookupList: 'Communities'
    }, [], '11111111-1111-1111-1111-111111111111')).toContain(
      'Type="Lookup" Name="Community"'
    );
    expect(buildFieldXml({
      internalName: 'Community',
      type: 'Lookup',
      unique: true
    }, [], '11111111-1111-1111-1111-111111111111')).toContain(
      'EnforceUniqueValues="TRUE"'
    );
  });

  it('escapes choice values', () => {
    const xml = buildFieldXml({ internalName: 'Choice', type: 'Choice' }, ['Cloud & AI']);
    expect(xml).toContain('<CHOICE>Cloud &amp; AI</CHOICE>');
  });

  it('rejects a lookup without its target id', () => {
    expect(() => buildFieldXml({ internalName: 'Community', type: 'Lookup' })).toThrow(PortalError);
  });
});
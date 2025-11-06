/**
 * Contract test - Verify ESM imports work
 */

import { describe, expect, it } from '@jest/globals';

describe('ESM imports', () => {
  it('should import version from main export', async () => {
    const { version } = await import('../../dist/esm/index.js');
    expect(version).toBe('0.1.0');
  });
});

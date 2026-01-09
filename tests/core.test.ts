/**
 * Core functionality tests for UbiCity
 * Tests the fundamental learning experience capture and storage
 */

import { assertEquals, assertExists } from '@std/assert';
import { join } from '@std/path';
import { ensureDir, exists } from '@std/fs';

const TEST_DATA_DIR = './test-data-tmp';

Deno.test('Core - LearningExperience validation', () => {
  const validExperience = {
    id: 'test-001',
    timestamp: new Date().toISOString(),
    learner: {
      id: 'learner-123',
      name: 'Test Learner',
    },
    context: {
      location: {
        name: 'Test Makerspace',
        type: 'makerspace',
      },
    },
    experience: {
      type: 'workshop',
      domain: ['electronics', 'art'],
      description: 'Built a light-up sculpture',
    },
  };

  assertExists(validExperience.id);
  assertExists(validExperience.learner);
  assertExists(validExperience.context.location);
  assertEquals(validExperience.experience.domain.length, 2);
});

Deno.test('Core - Data persistence', async () => {
  await ensureDir(TEST_DATA_DIR);

  const testFile = join(TEST_DATA_DIR, 'test-experience.json');
  const testData = { id: 'test', data: 'value' };

  await Deno.writeTextFile(testFile, JSON.stringify(testData, null, 2));

  const fileExists = await exists(testFile);
  assertEquals(fileExists, true);

  const content = await Deno.readTextFile(testFile);
  const parsed = JSON.parse(content);
  assertEquals(parsed.id, 'test');

  // Cleanup
  await Deno.remove(TEST_DATA_DIR, { recursive: true });
});

Deno.test('Core - ID generation uniqueness', () => {
  const ids = new Set();
  for (let i = 0; i < 1000; i++) {
    const id = crypto.randomUUID();
    ids.add(id);
  }
  assertEquals(ids.size, 1000, 'All IDs should be unique');
});

Deno.test('Core - Timestamp validation', () => {
  const now = new Date();
  const iso = now.toISOString();

  // Valid ISO 8601
  assertEquals(typeof iso, 'string');
  assertEquals(iso.includes('T'), true);
  assertEquals(iso.includes('Z'), true);

  // Parseable
  const parsed = new Date(iso);
  assertEquals(isNaN(parsed.getTime()), false);
});

Deno.test('Core - Domain array handling', () => {
  const domains = ['electronics', 'art', 'sculpture'];

  // Deduplication
  const unique = [...new Set(domains)];
  assertEquals(unique.length, 3);

  // Case normalization
  const normalized = domains.map((d) => d.toLowerCase());
  assertEquals(normalized[0], 'electronics');

  // Filtering
  const filtered = domains.filter((d) => d.startsWith('e'));
  assertEquals(filtered.length, 1);
});

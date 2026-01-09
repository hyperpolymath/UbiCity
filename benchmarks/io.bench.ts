/**
 * I/O performance benchmarks
 * SLO: < 50ms for 1000 experience read/write
 */

import { ensureDir } from '@std/fs';
import { join } from '@std/path';

const BENCH_DATA_DIR = './bench-data-tmp';

Deno.bench('I/O - Write single experience', async () => {
  await ensureDir(BENCH_DATA_DIR);

  const exp = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    data: 'test',
  };

  const file = join(BENCH_DATA_DIR, `${exp.id}.json`);
  await Deno.writeTextFile(file, JSON.stringify(exp));

  // Cleanup
  await Deno.remove(file);
});

Deno.bench(
  'I/O - Read single experience',
  { group: 'io', baseline: true },
  async () => {
    await ensureDir(BENCH_DATA_DIR);

    const file = join(BENCH_DATA_DIR, 'test.json');
    await Deno.writeTextFile(file, JSON.stringify({ id: 'test' }));

    const content = await Deno.readTextFile(file);
    JSON.parse(content);

    await Deno.remove(file);
  },
);

Deno.bench('I/O - Batch write 10 experiences', async () => {
  await ensureDir(BENCH_DATA_DIR);

  const experiences = Array.from({ length: 10 }, (_, i) => ({
    id: `exp-${i}`,
    data: 'test',
  }));

  await Promise.all(
    experiences.map((exp) =>
      Deno.writeTextFile(
        join(BENCH_DATA_DIR, `${exp.id}.json`),
        JSON.stringify(exp),
      )
    ),
  );

  // Cleanup
  await Deno.remove(BENCH_DATA_DIR, { recursive: true });
});

/**
 * Performance SLOs
 *
 * - Single write: < 5ms
 * - Single read: < 5ms
 * - Batch 10 write: < 50ms
 * - Batch 100 read: < 200ms
 */

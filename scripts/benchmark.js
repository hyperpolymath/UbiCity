#!/usr/bin/env node

/**
 * Performance benchmarking tool
 * Tests UbiCity performance with various dataset sizes
 */

import { UrbanKnowledgeMapper } from '../src/mapper.js';
import { PerformanceMonitor, benchmark } from '../src/performance.js';
import { randomUUID, randomBytes } from 'crypto';

const DATASET_SIZES = [10, 50, 100, 500, 1000];

/**
 * Generate a cryptographically secure random float between 0 and 1
 * @returns {number} Random float in range [0, 1)
 */
function secureRandomFloat() {
  // Use 4 bytes to create a 32-bit unsigned integer, then normalize to [0, 1)
  const bytes = randomBytes(4);
  const uint32 = bytes.readUInt32BE(0);
  return uint32 / 0x100000000;
}

async function generateTestData(count) {
  const mapper = new UrbanKnowledgeMapper('/tmp/benchmark-ubicity');
  await mapper.initialize();

  const locations = ['Library', 'Makerspace', 'Park', 'Coffee Shop', 'Museum'];
  const domains = ['electronics', 'art', 'programming', 'biology', 'history'];
  const types = ['experiment', 'reading', 'conversation', 'workshop', 'observation'];

  for (let i = 0; i < count; i++) {
    await mapper.captureExperience({
      learner: { id: `learner-${i % 10}` },
      context: {
        location: {
          name: locations[i % locations.length],
          coordinates: {
            latitude: 37.7749 + (secureRandomFloat() - 0.5) * 0.1,
            longitude: -122.4194 + (secureRandomFloat() - 0.5) * 0.1,
          },
        },
      },
      experience: {
        type: types[i % types.length],
        description: `Test experience ${i}`,
        domains: [
          domains[i % domains.length],
          domains[(i + 1) % domains.length],
        ],
      },
    });
  }

  return mapper;
}

async function benchmarkOperations(mapper) {
  const monitor = new PerformanceMonitor();

  console.log(`\n  Testing with ${mapper.experiences.size} experiences...\n`);

  // Load all
  monitor.start('loadAll');
  await mapper.loadAll();
  const loadTime = monitor.end('loadAll');

  // Find hotspots
  monitor.start('hotspots');
  const hotspots = mapper.findLearningHotspots();
  const hotspotsTime = monitor.end('hotspots');

  // Generate network
  monitor.start('network');
  const network = mapper.generateDomainNetwork();
  const networkTime = monitor.end('network');

  // Generate report
  monitor.start('report');
  await mapper.generateReport();
  const reportTime = monitor.end('report');

  return {
    size: mapper.experiences.size,
    loadTime,
    hotspotsTime,
    networkTime,
    reportTime,
    hotspots: hotspots.length,
    networkNodes: network.nodes.length,
    networkEdges: network.edges.length,
  };
}

async function runBenchmarks() {
  console.log('\n🔬 UbiCity Performance Benchmark\n');
  console.log('='.repeat(70));

  const results = [];

  for (const size of DATASET_SIZES) {
    console.log(`\n📊 Dataset size: ${size} experiences`);

    const mapper = await generateTestData(size);
    const result = await benchmarkOperations(mapper);
    results.push(result);

    console.log(`  Load:     ${result.loadTime.toFixed(2)}ms`);
    console.log(`  Hotspots: ${result.hotspotsTime.toFixed(2)}ms → ${result.hotspots} found`);
    console.log(`  Network:  ${result.networkTime.toFixed(2)}ms → ${result.networkNodes} nodes, ${result.networkEdges} edges`);
    console.log(`  Report:   ${result.reportTime.toFixed(2)}ms`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n📈 Summary\n');
  console.log('Size\tLoad\tHotspots\tNetwork\tReport');
  console.log('-'.repeat(70));

  results.forEach(r => {
    console.log(
      `${r.size}\t${r.loadTime.toFixed(1)}ms\t${r.hotspotsTime.toFixed(1)}ms\t\t${r.networkTime.toFixed(1)}ms\t${r.reportTime.toFixed(1)}ms`
    );
  });

  // Calculate scaling
  console.log('\n📊 Scaling Analysis\n');

  const first = results[0];
  const last = results[results.length - 1];
  const sizeRatio = last.size / first.size;

  console.log(`Dataset size increased ${sizeRatio}x`);
  console.log(
    `Load time increased ${(last.loadTime / first.loadTime).toFixed(2)}x`
  );
  console.log(
    `Hotspots time increased ${(last.hotspotsTime / first.hotspotsTime).toFixed(2)}x`
  );
  console.log(
    `Network time increased ${(last.networkTime / first.networkTime).toFixed(2)}x`
  );
  console.log(
    `Report time increased ${(last.reportTime / first.reportTime).toFixed(2)}x`
  );

  console.log('\n' + '='.repeat(70) + '\n');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runBenchmarks().catch(error => {
    console.error('Benchmark failed:', error);
    process.exit(1);
  });
}

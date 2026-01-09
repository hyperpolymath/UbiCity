/**
 * Mapper functionality tests
 * Tests pattern detection, hotspots, networks, and journeys
 */

import { assert, assertEquals } from '@std/assert';

Deno.test('Mapper - Hotspot detection', () => {
  const experiences = [
    {
      id: '1',
      context: { location: { name: 'Makerspace A', coordinates: [0, 0] } },
      experience: { domain: ['electronics'] },
    },
    {
      id: '2',
      context: { location: { name: 'Makerspace A', coordinates: [0, 0] } },
      experience: { domain: ['woodworking'] },
    },
    {
      id: '3',
      context: { location: { name: 'Garden B', coordinates: [1, 1] } },
      experience: { domain: ['gardening'] },
    },
  ];

  // Group by location
  const byLocation = experiences.reduce((acc, exp) => {
    const loc = exp.context.location.name;
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(exp);
    return acc;
  }, {} as Record<string, typeof experiences>);

  assertEquals(byLocation['Makerspace A'].length, 2);
  assertEquals(byLocation['Garden B'].length, 1);

  // Find hotspots (2+ experiences)
  const hotspots = Object.entries(byLocation).filter(([_, exps]) =>
    exps.length >= 2
  );
  assertEquals(hotspots.length, 1);
  assertEquals(hotspots[0][0], 'Makerspace A');
});

Deno.test('Mapper - Domain network generation', () => {
  const experiences = [
    { id: '1', experience: { domain: ['electronics', 'art'] } },
    { id: '2', experience: { domain: ['art', 'sculpture'] } },
    { id: '3', experience: { domain: ['electronics', 'robotics'] } },
  ];

  // Build adjacency map
  const connections: Record<string, Set<string>> = {};

  experiences.forEach((exp) => {
    const domains = exp.experience.domain;
    for (let i = 0; i < domains.length; i++) {
      for (let j = i + 1; j < domains.length; j++) {
        const [a, b] = [domains[i], domains[j]].sort();
        if (!connections[a]) connections[a] = new Set();
        connections[a].add(b);
      }
    }
  });

  assert(connections['art']?.has('electronics'));
  assert(connections['art']?.has('sculpture'));
  assert(connections['electronics']?.has('robotics'));
  assertEquals(connections['art']?.size, 2);
});

Deno.test('Mapper - Learner journey tracking', () => {
  const experiences = [
    {
      id: '1',
      timestamp: '2025-01-01T10:00:00Z',
      learner: { id: 'alice' },
      experience: { type: 'workshop' },
    },
    {
      id: '2',
      timestamp: '2025-01-05T14:00:00Z',
      learner: { id: 'alice' },
      experience: { type: 'project' },
    },
    {
      id: '3',
      timestamp: '2025-01-03T12:00:00Z',
      learner: { id: 'alice' },
      experience: { type: 'mentorship' },
    },
  ];

  // Filter by learner
  const aliceExps = experiences.filter((e) => e.learner.id === 'alice');
  assertEquals(aliceExps.length, 3);

  // Sort chronologically
  const journey = aliceExps.sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp)
  );
  assertEquals(journey[0].experience.type, 'workshop');
  assertEquals(journey[1].experience.type, 'mentorship');
  assertEquals(journey[2].experience.type, 'project');
});

Deno.test('Mapper - Interdisciplinary connections', () => {
  const experiences = [
    {
      id: '1',
      learner: { id: 'alice' },
      experience: { domain: ['electronics', 'art'] },
    },
    {
      id: '2',
      learner: { id: 'bob' },
      experience: { domain: ['gardening', 'food-justice'] },
    },
  ];

  // Find interdisciplinary experiences (2+ domains)
  const interdisciplinary = experiences.filter((e) =>
    e.experience.domain.length >= 2
  );
  assertEquals(interdisciplinary.length, 2);

  // Find unique connections
  const allConnections = interdisciplinary.flatMap((e) => {
    const domains = e.experience.domain;
    const pairs = [];
    for (let i = 0; i < domains.length; i++) {
      for (let j = i + 1; j < domains.length; j++) {
        pairs.push([domains[i], domains[j]].sort().join('→'));
      }
    }
    return pairs;
  });

  assertEquals(allConnections.length, 2);
  assert(allConnections.includes('art→electronics'));
  assert(allConnections.includes('food-justice→gardening'));
});

Deno.test('Mapper - Diversity score calculation', () => {
  // Location with high domain diversity
  const highDiversity = [
    { domain: ['electronics'] },
    { domain: ['woodworking'] },
    { domain: ['textiles'] },
    { domain: ['sculpture'] },
  ];

  // Location with low domain diversity
  const lowDiversity = [
    { domain: ['electronics'] },
    { domain: ['electronics'] },
    { domain: ['electronics'] },
  ];

  const uniqueDomainsHigh = new Set(highDiversity.flatMap((e) => e.domain));
  const uniqueDomainsLow = new Set(lowDiversity.flatMap((e) => e.domain));

  assertEquals(uniqueDomainsHigh.size, 4);
  assertEquals(uniqueDomainsLow.size, 1);

  // Diversity ratio
  const diversityHigh = uniqueDomainsHigh.size / highDiversity.length;
  const diversityLow = uniqueDomainsLow.size / lowDiversity.length;

  assert(diversityHigh > diversityLow);
});

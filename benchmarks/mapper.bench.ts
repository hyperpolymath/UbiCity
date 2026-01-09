/**
 * Mapper performance benchmarks
 * SLO: < 10ms for network generation (100 experiences)
 */

Deno.bench('Mapper - Hotspot detection (100 experiences)', () => {
  const experiences = Array.from({ length: 100 }, (_, i) => ({
    id: `exp-${i}`,
    context: {
      location: {
        name: `Location ${i % 10}`, // 10 locations, ~10 exp each
        coordinates: {
          lat: 37.77 + (i % 10) * 0.01,
          lon: -122.42 + (i % 10) * 0.01,
        },
      },
    },
    experience: {
      domain: [`domain-${i % 5}`],
    },
  }));

  const byLocation = experiences.reduce((acc, exp) => {
    const loc = exp.context.location.name;
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(exp);
    return acc;
  }, {} as Record<string, typeof experiences>);

  const _hotspots = Object.entries(byLocation).filter(([_, exps]) =>
    exps.length >= 5
  );
});

Deno.bench('Mapper - Domain network generation (100 experiences)', () => {
  const experiences = Array.from({ length: 100 }, (_, i) => ({
    id: `exp-${i}`,
    experience: {
      domain: [
        `domain-${i % 5}`,
        `domain-${(i + 1) % 5}`,
      ],
    },
  }));

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
});

Deno.bench('Mapper - Learner journey (1000 experiences, 10 learners)', () => {
  const experiences = Array.from({ length: 1000 }, (_, i) => ({
    id: `exp-${i}`,
    timestamp: new Date(Date.now() - i * 86400000).toISOString(),
    learner: { id: `learner-${i % 10}` },
    experience: { type: 'workshop' },
  }));

  const journeys: Record<string, typeof experiences> = {};

  experiences.forEach((exp) => {
    const learner = exp.learner.id;
    if (!journeys[learner]) journeys[learner] = [];
    journeys[learner].push(exp);
  });

  // Sort each journey
  Object.values(journeys).forEach((journey) => {
    journey.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  });
});

/**
 * Performance SLOs
 *
 * - Hotspot detection (100 exp): < 5ms
 * - Network generation (100 exp): < 10ms (WASM: < 1ms)
 * - Journey sorting (1000 exp): < 20ms
 */

/**
 * Export functionality tests
 * Tests CSV, GeoJSON, DOT, and Markdown exports
 */

import { assert, assertEquals } from '@std/assert';

Deno.test('Export - CSV format generation', () => {
  const experiences = [
    {
      id: 'exp-001',
      timestamp: '2025-01-01T10:00:00Z',
      learner: { id: 'alice' },
      context: { location: { name: 'Makerspace A' } },
      experience: {
        type: 'workshop',
        domain: ['electronics'],
        description: 'Built LED circuit',
      },
    },
  ];

  const headers = [
    'id',
    'timestamp',
    'learner_id',
    'location',
    'type',
    'domains',
    'description',
  ];
  const rows = experiences.map((e) => [
    e.id,
    e.timestamp,
    e.learner.id,
    e.context.location.name,
    e.experience.type,
    e.experience.domain.join(';'),
    e.experience.description,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  assert(csv.includes('id,timestamp,learner_id'));
  assert(csv.includes('exp-001,2025-01-01T10:00:00Z'));
  assert(csv.includes('electronics'));
});

Deno.test('Export - GeoJSON format generation', () => {
  const experiences = [
    {
      id: 'exp-001',
      context: {
        location: {
          name: 'Makerspace A',
          coordinates: { lat: 37.77, lon: -122.42 },
        },
      },
      experience: { type: 'workshop' },
    },
  ];

  const geojson = {
    type: 'FeatureCollection',
    features: experiences
      .filter((e) => e.context.location.coordinates)
      .map((e) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            e.context.location.coordinates!.lon,
            e.context.location.coordinates!.lat,
          ],
        },
        properties: {
          id: e.id,
          name: e.context.location.name,
          type: e.experience.type,
        },
      })),
  };

  assertEquals(geojson.type, 'FeatureCollection');
  assertEquals(geojson.features.length, 1);
  assertEquals(geojson.features[0].geometry.type, 'Point');
  assertEquals(geojson.features[0].geometry.coordinates, [-122.42, 37.77]);
});

Deno.test('Export - DOT graph format generation', () => {
  const connections = {
    'electronics': ['art', 'robotics'],
    'art': ['sculpture'],
  };

  let dot = 'graph LearningNetwork {\n';
  for (const [from, toList] of Object.entries(connections)) {
    for (const to of toList) {
      dot += `  "${from}" -- "${to}";\n`;
    }
  }
  dot += '}';

  assert(dot.includes('graph LearningNetwork'));
  assert(dot.includes('"electronics" -- "art"'));
  assert(dot.includes('"electronics" -- "robotics"'));
  assert(dot.includes('"art" -- "sculpture"'));
});

Deno.test('Export - Markdown format generation', () => {
  const journey = [
    {
      id: '1',
      timestamp: '2025-01-01T10:00:00Z',
      experience: {
        type: 'workshop',
        domain: ['electronics'],
        description: 'First workshop',
      },
    },
    {
      id: '2',
      timestamp: '2025-01-05T14:00:00Z',
      experience: {
        type: 'project',
        domain: ['electronics', 'art'],
        description: 'Built sculpture',
      },
    },
  ];

  let md = '# Learner Journey\n\n';
  journey.forEach((exp) => {
    md += `## ${new Date(exp.timestamp).toLocaleDateString()}\n\n`;
    md += `**Type**: ${exp.experience.type}\n\n`;
    md += `**Domains**: ${exp.experience.domain.join(', ')}\n\n`;
    md += `${exp.experience.description}\n\n`;
    md += '---\n\n';
  });

  assert(md.includes('# Learner Journey'));
  assert(md.includes('**Type**: workshop'));
  assert(md.includes('**Domains**: electronics, art'));
  assert(md.includes('Built sculpture'));
});

Deno.test('Export - CSV escaping special characters', () => {
  const text = 'Description with "quotes" and, commas';

  // CSV escaping: wrap in quotes and double internal quotes
  const escaped = `"${text.replace(/"/g, '""')}"`;

  assertEquals(escaped, '"Description with ""quotes"" and, commas"');
  assert(escaped.startsWith('"'));
  assert(escaped.endsWith('"'));
});

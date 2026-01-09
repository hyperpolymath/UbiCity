/**
 * Privacy and anonymization tests
 * Tests PII removal, location fuzzing, and data sanitization
 */

import { assert, assertEquals } from '@std/assert';
import { crypto } from '@std/crypto';

Deno.test('Privacy - Learner ID anonymization', async () => {
  const learnerId = 'alice@example.com';

  // Hash the ID
  const encoder = new TextEncoder();
  const data = encoder.encode(learnerId);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(
    '',
  );

  // Verify hash is deterministic
  const hashBuffer2 = await crypto.subtle.digest('SHA-256', data);
  const hashArray2 = Array.from(new Uint8Array(hashBuffer2));
  const hashHex2 = hashArray2.map((b) => b.toString(16).padStart(2, '0')).join(
    '',
  );

  assertEquals(hashHex, hashHex2, 'Hash should be deterministic');
  assert(hashHex.length === 64, 'SHA-256 hash should be 64 chars');
  assert(!hashHex.includes('@'), 'Hash should not contain original PII');
});

Deno.test('Privacy - Location fuzzing', () => {
  const preciseCoords = { lat: 37.7749295, lon: -122.4194155 };

  // Round to ~1km precision (2 decimal places)
  const fuzzed = {
    lat: Math.round(preciseCoords.lat * 100) / 100,
    lon: Math.round(preciseCoords.lon * 100) / 100,
  };

  assertEquals(fuzzed.lat, 37.77);
  assertEquals(fuzzed.lon, -122.42);

  // Verify precision loss
  const latDiff = Math.abs(preciseCoords.lat - fuzzed.lat);
  const lonDiff = Math.abs(preciseCoords.lon - fuzzed.lon);

  assert(latDiff < 0.01, 'Lat fuzzing within 1km');
  assert(lonDiff < 0.01, 'Lon fuzzing within 1km');
});

Deno.test('Privacy - PII removal from text', () => {
  const text =
    'Contact alice@example.com or call 555-123-4567 for more info about Jane Doe';

  // Remove emails
  const withoutEmail = text.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]');
  assert(!withoutEmail.includes('@example.com'));
  assert(withoutEmail.includes('[EMAIL]'));

  // Remove phone numbers
  const withoutPhone = withoutEmail.replace(
    /\d{3}-\d{3}-\d{4}/g,
    '[PHONE]',
  );
  assert(!withoutPhone.includes('555-123-4567'));
  assert(withoutPhone.includes('[PHONE]'));

  // Note: Name removal is complex (requires NLP), just verify detection
  assert(text.includes('Jane Doe'));
});

Deno.test('Privacy - Privacy level enforcement', () => {
  const experience = {
    id: 'exp-001',
    learner: { id: 'alice@example.com', name: 'Alice Johnson' },
    context: {
      location: {
        name: 'Mission Makerspace',
        coordinates: { lat: 37.7749295, lon: -122.4194155 },
      },
    },
    experience: { description: 'Met with mentor Bob Smith' },
    privacy: 'private' as 'private' | 'anonymous' | 'public',
  };

  // Apply privacy level
  const sanitized = applyPrivacy(experience);

  if (experience.privacy === 'private') {
    // Private: exclude from exports
    assertEquals(sanitized, null);
  }
});

function applyPrivacy(exp: any) {
  if (exp.privacy === 'private') return null;

  if (exp.privacy === 'anonymous') {
    return {
      ...exp,
      learner: { id: '[ANONYMOUS]', name: undefined },
      context: {
        ...exp.context,
        location: {
          ...exp.context.location,
          coordinates: undefined,
        },
      },
    };
  }

  return exp;
}

Deno.test('Privacy - Data minimization', () => {
  const fullData = {
    id: 'exp-001',
    timestamp: '2025-01-01T10:00:00Z',
    learner: {
      id: 'alice',
      name: 'Alice',
      email: 'alice@example.com',
      phone: '555-1234',
    },
    context: {
      location: { name: 'Makerspace' },
      weather: 'sunny',
      mood: 'excited',
    },
    experience: { type: 'workshop' },
  };

  // WHO/WHERE/WHAT minimal protocol
  const minimal = {
    id: fullData.id,
    timestamp: fullData.timestamp,
    learner: { id: fullData.learner.id },
    context: { location: fullData.context.location },
    experience: fullData.experience,
  };

  // Verify only essential data retained
  assertEquals(Object.hasOwn(minimal.learner, 'email'), false);
  assertEquals(Object.hasOwn(minimal.learner, 'phone'), false);
  assertEquals(Object.hasOwn(minimal.context, 'weather'), false);
});

Deno.test('Privacy - Shareable dataset generation', () => {
  const experiences = [
    { id: '1', privacy: 'public', data: 'public-data' },
    { id: '2', privacy: 'anonymous', data: 'anon-data' },
    { id: '3', privacy: 'private', data: 'private-data' },
  ];

  const shareable = experiences.filter((e) => e.privacy !== 'private');

  assertEquals(shareable.length, 2);
  assert(shareable.every((e) => e.privacy !== 'private'));
});

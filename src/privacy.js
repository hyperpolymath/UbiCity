/**
 * Privacy and anonymization utilities for UbiCity
 * Respects learner privacy while maintaining analytical value
 */

import { randomUUID } from 'crypto';
import { ExperienceStorage } from './storage.js';

/**
 * Anonymize learner data
 * @param {object} experience - Learning experience
 * @param {object} options - Anonymization options
 * @returns {object} Anonymized experience
 */
export function anonymizeLearner(experience, options = {}) {
  const {
    preserveIds = false,
    hashIds = true,
    removeName = true,
    removeInterests = false,
  } = options;

  const anonymized = JSON.parse(JSON.stringify(experience));

  if (!preserveIds) {
    if (hashIds) {
      anonymized.learner.id = `anon-${hashString(experience.learner.id)}`;
    } else {
      anonymized.learner.id = `anon-${randomUUID().slice(0, 8)}`;
    }
  }

  if (removeName && anonymized.learner.name) {
    delete anonymized.learner.name;
  }

  if (removeInterests && anonymized.learner.interests) {
    delete anonymized.learner.interests;
  }

  return anonymized;
}

/**
 * Anonymize location data
 * @param {object} experience - Learning experience
 * @param {object} options - Anonymization options
 * @returns {object} Anonymized experience
 */
export function anonymizeLocation(experience, options = {}) {
  const {
    fuzzyCoordinates = true,
    fuzzRadius = 0.01, // ~1km
    removeAddress = true,
    generalizeType = false,
  } = options;

  const anonymized = JSON.parse(JSON.stringify(experience));
  const location = anonymized.context.location;

  if (fuzzyCoordinates && location.coordinates) {
    const { latitude, longitude } = location.coordinates;
    location.coordinates = {
      latitude: Math.round(latitude / fuzzRadius) * fuzzRadius,
      longitude: Math.round(longitude / fuzzRadius) * fuzzRadius,
    };
  }

  if (removeAddress && location.address) {
    delete location.address;
  }

  if (generalizeType && location.type) {
    const generalizations = {
      'coffee shop': 'cafe',
      'starbucks': 'cafe',
      'library branch': 'library',
      'community college': 'educational institution',
      'university': 'educational institution',
    };

    const lower = location.type.toLowerCase();
    location.type = generalizations[lower] || location.type;
  }

  return anonymized;
}

/**
 * Remove personally identifiable information
 * @param {object} experience - Learning experience
 * @returns {object} Sanitized experience
 */
export function removePII(experience) {
  const sanitized = JSON.parse(JSON.stringify(experience));

  // Remove names from connections
  if (sanitized.context.connections) {
    sanitized.context.connections = sanitized.context.connections.map(
      (_name, i) => `person-${i + 1}`
    );
  }

  // Sanitize description
  if (sanitized.experience.description) {
    sanitized.experience.description = sanitizeText(
      sanitized.experience.description
    );
  }

  // Sanitize outcome text
  if (sanitized.experience.outcome) {
    if (sanitized.experience.outcome.connections_made) {
      sanitized.experience.outcome.connections_made =
        sanitized.experience.outcome.connections_made.map(sanitizeText);
    }

    if (sanitized.experience.outcome.next_questions) {
      sanitized.experience.outcome.next_questions =
        sanitized.experience.outcome.next_questions.map(sanitizeText);
    }
  }

  return sanitized;
}

/**
 * Full anonymization pipeline
 * @param {object} experience - Learning experience
 * @param {object} options - Anonymization options
 * @returns {object} Fully anonymized experience
 */
export function fullyAnonymize(experience, options = {}) {
  let result = experience;

  result = anonymizeLearner(result, options.learner);
  result = anonymizeLocation(result, options.location);
  result = removePII(result);

  // Set privacy level
  result.privacy = {
    level: 'anonymous',
    anonymized: true,
    timestamp: new Date().toISOString(),
  };

  return result;
}

/**
 * Generate shareable dataset
 * @param {string} storageDir - Storage directory
 * @param {object} options - Export options
 * @returns {Promise<object[]>} Anonymized experiences
 */
export async function generateShareableDataset(storageDir, options = {}) {
  const {
    includePrivate = false,
    anonymizationLevel = 'full',
  } = options;

  const storage = new ExperienceStorage(storageDir);
  const experiences = await storage.loadAllExperiences();

  const shareable = experiences
    .filter(exp => {
      const privacyLevel = exp.privacy?.level || 'anonymous';

      if (!includePrivate && privacyLevel === 'private') {
        return false;
      }

      return true;
    })
    .map(exp => {
      if (anonymizationLevel === 'full') {
        return fullyAnonymize(exp);
      } else if (anonymizationLevel === 'partial') {
        return anonymizeLearner(exp);
      }

      return exp;
    });

  return shareable;
}

/**
 * Hash string to consistent identifier
 * @param {string} str - String to hash
 * @returns {string} Hashed string (first 8 chars of hex)
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return Math.abs(hash).toString(16).slice(0, 8);
}

/**
 * Sanitize text to remove common PII patterns
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
function sanitizeText(text) {
  // Limit input length to prevent ReDoS attacks
  const MAX_TEXT_LENGTH = 10000;
  let sanitized = text.length > MAX_TEXT_LENGTH
    ? text.slice(0, MAX_TEXT_LENGTH)
    : text;

  // Email addresses - use possessive-like matching to prevent backtracking
  // Pattern: local part (alphanumeric, limited special chars) @ domain
  sanitized = sanitized.replace(
    /[a-zA-Z0-9](?:[a-zA-Z0-9._-]{0,62}[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9.-]{0,252}[a-zA-Z0-9])?\.[a-zA-Z]{2,63}/g,
    '[email]'
  );

  // Phone numbers (simple patterns)
  sanitized = sanitized.replace(
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
    '[phone]'
  );

  // URLs - use non-greedy matching with explicit character class
  sanitized = sanitized.replace(
    /https?:\/\/[^\s]{1,2000}/g,
    '[url]'
  );

  // Common name patterns (very conservative)
  // This is tricky - you may want to customize based on your data
  // For now, just removing anything that looks like "I met [Name]"
  sanitized = sanitized.replace(
    /\b(I met|met with|talked to|spoke with)\s+([A-Z][a-z]+)\b/g,
    '$1 [person]'
  );

  return sanitized;
}

/**
 * CLI tool for generating anonymous export
 */
export async function exportAnonymousData(storageDir, outputPath, options = {}) {
  const dataset = await generateShareableDataset(storageDir, options);

  const exportData = {
    generated: new Date().toISOString(),
    version: '0.2.0',
    anonymized: true,
    count: dataset.length,
    experiences: dataset,
  };

  if (outputPath) {
    const { promises: fs } = await import('fs');
    await fs.writeFile(
      outputPath,
      JSON.stringify(exportData, null, 2),
      'utf8'
    );
    console.log(`Exported ${dataset.length} anonymized experiences to: ${outputPath}`);
  } else {
    console.log(JSON.stringify(exportData, null, 2));
  }

  return dataset;
}

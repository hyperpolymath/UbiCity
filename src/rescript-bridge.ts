/**
 * Bridge to ReScript-compiled modules
 * Imports the optimized JavaScript generated from ReScript
 */

// ReScript compiles to ES6 modules with .res.js extension
// Import the compiled UbiCity module
import * as UbiCity from '../src-rescript/UbiCity.res.js';

export type {
  Context,
  Coordinates,
  Learner,
  LearningExperience,
  Location,
} from '../src-rescript/UbiCity.res.js';

/**
 * Create a validated learning experience using ReScript's type system
 */
export function createLearningExperience(data: {
  id?: string;
  timestamp?: string;
  learner: { id: string; name?: string; interests?: string[] };
  context: {
    location: {
      name: string;
      coordinates?: { latitude: number; longitude: number };
    };
    situation?: string;
    connections?: string[];
  };
  experience: {
    type: string;
    description: string;
    domains?: string[];
  };
  privacy?: { level: 'private' | 'anonymous' | 'public' };
  tags?: string[];
}): any {
  // Use ReScript's make functions with strong typing
  const learner = UbiCity.Learner.make(
    data.learner.id,
    data.learner.name,
    data.learner.interests,
  );

  if (learner.TAG === 'Error') {
    throw new Error(learner._0);
  }

  const location = UbiCity.Location.make(
    data.context.location.name,
    data.context.location.coordinates,
  );

  if (location.TAG === 'Error') {
    throw new Error(location._0);
  }

  const context = UbiCity.Context.make(
    location._0,
    data.context.situation,
    data.context.connections,
  );

  const experience = UbiCity.ExperienceData.make(
    data.experience.type,
    data.experience.description,
    data.experience.domains,
  );

  if (experience.TAG === 'Error') {
    throw new Error(experience._0);
  }

  return UbiCity.LearningExperience.make(
    data.id,
    data.timestamp,
    learner._0,
    context,
    experience._0,
    data.privacy,
    data.tags,
  );
}

/**
 * Functional analysis using ReScript
 */
export const Analysis = {
  findInterdisciplinary: UbiCity.Analysis.findInterdisciplinary,
  groupByLocation: UbiCity.Analysis.groupByLocation,
  groupByLearner: UbiCity.Analysis.groupByLearner,
  calculateDiversity: UbiCity.Analysis.calculateDiversity,
};

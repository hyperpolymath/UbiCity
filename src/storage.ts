/**
 * Storage layer using Deno's native file system APIs
 * No Node.js dependencies - pure Deno
 */

import { join } from '@std/path';
import { ensureDir } from '@std/fs';

export interface StorageOptions {
  readonly storageDir: string;
}

export class ExperienceStorage {
  private readonly storageDir: string;
  private readonly experiencesDir: string;
  private readonly mapsDir: string;
  private readonly analysesDir: string;

  constructor(storageDir = './ubicity-data') {
    this.storageDir = storageDir;
    this.experiencesDir = join(storageDir, 'experiences');
    this.mapsDir = join(storageDir, 'maps');
    this.analysesDir = join(storageDir, 'analyses');
  }

  async ensureDirectories(): Promise<void> {
    await ensureDir(this.storageDir);
    await ensureDir(this.experiencesDir);
    await ensureDir(this.mapsDir);
    await ensureDir(this.analysesDir);
  }

  async saveExperience(experience: unknown): Promise<string> {
    await this.ensureDirectories();

    const data = experience as { id: string };
    const filename = `${data.id}.json`;
    const filepath = join(this.experiencesDir, filename);

    await Deno.writeTextFile(
      filepath,
      JSON.stringify(experience, null, 2),
    );

    return filepath;
  }

  async loadExperience(id: string): Promise<unknown | null> {
    const filename = `${id}.json`;
    const filepath = join(this.experiencesDir, filename);

    try {
      const content = await Deno.readTextFile(filepath);
      return JSON.parse(content);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return null;
      }
      throw error;
    }
  }

  async loadAllExperiences(): Promise<unknown[]> {
    try {
      await this.ensureDirectories();
      const experiences: unknown[] = [];

      for await (const entry of Deno.readDir(this.experiencesDir)) {
        if (entry.isFile && entry.name.endsWith('.json')) {
          const filepath = join(this.experiencesDir, entry.name);
          const content = await Deno.readTextFile(filepath);
          experiences.push(JSON.parse(content));
        }
      }

      return experiences;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return [];
      }
      throw error;
    }
  }

  async deleteExperience(id: string): Promise<boolean> {
    const filename = `${id}.json`;
    const filepath = join(this.experiencesDir, filename);

    try {
      await Deno.remove(filepath);
      return true;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return false;
      }
      throw error;
    }
  }

  async saveReport(report: unknown, name?: string): Promise<string> {
    await this.ensureDirectories();

    const filename = name || `report-${Date.now()}.json`;
    const filepath = join(this.analysesDir, filename);

    await Deno.writeTextFile(
      filepath,
      JSON.stringify(report, null, 2),
    );

    return filepath;
  }

  async saveVisualization(
    html: string,
    name = 'ubicity-map.html',
  ): Promise<string> {
    await this.ensureDirectories();

    const filepath = join(this.storageDir, name);
    await Deno.writeTextFile(filepath, html);

    return filepath;
  }

  async listExperienceIds(): Promise<string[]> {
    try {
      const ids: string[] = [];

      for await (const entry of Deno.readDir(this.experiencesDir)) {
        if (entry.isFile && entry.name.endsWith('.json')) {
          ids.push(entry.name.replace('.json', ''));
        }
      }

      return ids;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return [];
      }
      throw error;
    }
  }

  async getStats(): Promise<{
    totalExperiences: number;
    totalSizeBytes: number;
    totalSizeKB: string;
    storageDir: string;
  }> {
    const ids = await this.listExperienceIds();
    let totalSize = 0;

    for (const id of ids) {
      const filepath = join(this.experiencesDir, `${id}.json`);
      const fileInfo = await Deno.stat(filepath);
      totalSize += fileInfo.size;
    }

    return {
      totalExperiences: ids.length,
      totalSizeBytes: totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      storageDir: this.storageDir,
    };
  }
}

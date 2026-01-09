/**
 * Observability Framework for UbiCity
 * Privacy-first metrics and logging (local only, no telemetry)
 *
 * Platinum RSR Requirement: Observability for performance monitoring
 */

export interface Metric {
  name: string;
  value: number;
  timestamp: string;
  labels?: Record<string, string>;
}

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

/**
 * Local metrics collector (no remote telemetry)
 */
export class MetricsCollector {
  private metrics: Metric[] = [];
  private readonly maxMetrics = 1000; // Circular buffer

  record(name: string, value: number, labels?: Record<string, string>): void {
    this.metrics.push({
      name,
      value,
      timestamp: new Date().toISOString(),
      labels,
    });

    // Circular buffer: keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  get(name: string): Metric[] {
    return this.metrics.filter((m) => m.name === name);
  }

  summary(name: string): {
    count: number;
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  } | null {
    const values = this.get(name).map((m) => m.value).sort((a, b) => a - b);
    if (values.length === 0) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    const p = (pct: number) =>
      values[Math.floor(values.length * pct / 100)] || 0;

    return {
      count: values.length,
      min: values[0],
      max: values[values.length - 1],
      avg: sum / values.length,
      p50: p(50),
      p95: p(95),
      p99: p(99),
    };
  }

  clear(): void {
    this.metrics = [];
  }

  export(): Metric[] {
    return [...this.metrics];
  }
}

/**
 * Structured logger (local only, no remote logging)
 */
export class Logger {
  private logs: LogEntry[] = [];
  private readonly maxLogs = 500;
  private minLevel: LogEntry['level'] = 'info';

  constructor(minLevel: LogEntry['level'] = 'info') {
    this.minLevel = minLevel;
  }

  private log(
    level: LogEntry['level'],
    message: string,
    context?: Record<string, unknown>,
  ): void {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    if (levels[level] < levels[this.minLevel]) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    this.logs.push(entry);

    // Circular buffer
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output
    const emoji = { debug: '🔍', info: 'ℹ️ ', warn: '⚠️ ', error: '❌' };
    console.log(
      `${emoji[level]} [${entry.timestamp}] ${message}`,
      context || '',
    );
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }

  export(): LogEntry[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}

/**
 * Performance timer
 */
export class Timer {
  private start: number;

  constructor() {
    this.start = performance.now();
  }

  elapsed(): number {
    return performance.now() - this.start;
  }

  stop(): number {
    const elapsed = this.elapsed();
    return elapsed;
  }
}

/**
 * Global observability instance (singleton)
 */
export const metrics = new MetricsCollector();
export const logger = new Logger(
  Deno.env.get('UBICITY_LOG_LEVEL') as LogEntry['level'] || 'info',
);

/**
 * Measure function execution time
 */
export async function measure<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<T> {
  const timer = new Timer();
  try {
    const result = await fn();
    const elapsed = timer.stop();
    metrics.record(name, elapsed, { status: 'success' });
    logger.debug(`${name} completed`, { duration_ms: elapsed });
    return result;
  } catch (error) {
    const elapsed = timer.stop();
    metrics.record(name, elapsed, { status: 'error' });
    logger.error(`${name} failed`, { duration_ms: elapsed, error });
    throw error;
  }
}

/**
 * Example usage:
 *
 * import { measure, metrics, logger } from './observability.ts';
 *
 * // Measure operation
 * const result = await measure('validation', async () => {
 *   return await validator.validate(data);
 * });
 *
 * // Check performance
 * const summary = metrics.summary('validation');
 * console.log(`Avg validation time: ${summary.avg}ms`);
 *
 * // View logs
 * const errors = logger.export().filter(l => l.level === 'error');
 * console.log(`Errors: ${errors.length}`);
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from "fs";
import { join } from "path";

export interface JobConfig {
  /** Unique name, used as the key in persisted state. */
  name: string;
  /** How often the job should run, in milliseconds. */
  intervalMs: number;
  /** The work to perform. May be async. Errors are caught and logged. */
  run: () => void | Promise<void>;
}

type JobState = Record<string, string>; // name → last-run ISO string

/**
 * Persisted scheduler.
 *
 * On start(), any job that is overdue (last run more than intervalMs ago, or
 * never run) fires immediately, then on every subsequent tick. A tick runs
 * every tickMs (default: 1 hour) and fires any jobs whose interval has elapsed.
 *
 * Last-run timestamps are written to disk after every successful run, so a
 * reboot will never silently skip a job that was due during the outage.
 */
export class Scheduler {
  private readonly stateFile: string;
  private readonly tickMs: number;
  private jobs: Map<string, JobConfig> = new Map();
  private state: JobState = {};
  private ticker: ReturnType<typeof setInterval> | null = null;

  constructor(stateDir: string, tickMs: number = 60 * 60 * 1_000) {
    if (!existsSync(stateDir)) mkdirSync(stateDir, { recursive: true });
    this.stateFile = join(stateDir, "scheduler.json");
    this.tickMs = tickMs;
    this.state = existsSync(this.stateFile)
      ? JSON.parse(readFileSync(this.stateFile, "utf-8")) as JobState
      : {};
  }

  register(job: JobConfig): void {
    this.jobs.set(job.name, job);
  }

  /**
   * Run all overdue jobs immediately, then start the recurring tick.
   */
  async start(): Promise<void> {
    await this.tick();
    this.ticker = setInterval(() => { void this.tick(); }, this.tickMs);
  }

  stop(): void {
    if (this.ticker !== null) {
      clearInterval(this.ticker);
      this.ticker = null;
    }
  }

  private async tick(): Promise<void> {
    const now = Date.now();
    for (const job of this.jobs.values()) {
      const lastRun = this.state[job.name] ? new Date(this.state[job.name]).getTime() : 0;
      if (now - lastRun >= job.intervalMs) {
        await this.runJob(job);
      }
    }
  }

  private async runJob(job: JobConfig): Promise<void> {
    try {
      await job.run();
      this.state[job.name] = new Date().toISOString();
      this.saveState();
      console.log(`[scheduler] ran "${job.name}" at ${this.state[job.name]}`);
    } catch (err) {
      console.error(`[scheduler] job "${job.name}" failed:`, err);
    }
  }

  private saveState(): void {
    const tmp = `${this.stateFile}.tmp`;
    writeFileSync(tmp, JSON.stringify(this.state, null, 2), "utf-8");
    renameSync(tmp, this.stateFile);
  }
}

// Convenience helpers so callers don't do the arithmetic.
export const every = {
  hours:  (n: number) => n * 60 * 60 * 1_000,
  days:   (n: number) => n * 24 * 60 * 60 * 1_000,
  weeks:  (n: number) => n * 7 * 24 * 60 * 60 * 1_000,
  months: (n: number) => n * 30 * 24 * 60 * 60 * 1_000,
};

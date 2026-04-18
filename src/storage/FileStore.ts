import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, renameSync, unlinkSync } from "fs";
import { join } from "path";

/**
 * Atomic JSON file store backed by the local filesystem.
 *
 * All writes go to a .tmp file first, then are renamed over the target.
 * Rename is atomic on Linux/macOS — a crash mid-write leaves the original intact.
 */
export class FileStore {
  constructor(private readonly dir: string) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  /** Write an object to {id}.json atomically. */
  write<T>(id: string, data: T): void {
    const target = join(this.dir, `${id}.json`);
    const tmp = `${target}.tmp`;
    writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
    renameSync(tmp, target);
  }

  /** Read and parse {id}.json. Returns undefined if the file does not exist. */
  read<T>(id: string): T | undefined {
    const path = join(this.dir, `${id}.json`);
    if (!existsSync(path)) return undefined;
    return JSON.parse(readFileSync(path, "utf-8")) as T;
  }

  /** Read and parse all *.json files in the directory. */
  readAll<T>(): T[] {
    return readdirSync(this.dir)
      .filter(f => f.endsWith(".json"))
      .map(f => JSON.parse(readFileSync(join(this.dir, f), "utf-8")) as T);
  }

  /** Delete {id}.json. Returns true if the file existed. */
  delete(id: string): boolean {
    const path = join(this.dir, `${id}.json`);
    if (!existsSync(path)) return false;
    unlinkSync(path);
    return true;
  }

  exists(id: string): boolean {
    return existsSync(join(this.dir, `${id}.json`));
  }
}

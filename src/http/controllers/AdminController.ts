import { Request, Response } from "express";
import { readdirSync, unlinkSync, existsSync } from "fs";
import { join } from "path";

/**
 * Directories whose *.json files are deleted on a "clear all" reset.
 * data/network/ is intentionally excluded — it holds node identity and keys.
 */
const DATA_DIRS = [
    "data/accounts",
    "data/endowment-profiles",
    "data/food",
    "data/food/kitchens",
    "data/food/mills",
    "data/education/schools",
    "data/education/libraries",
    "data/groups",
    "data/healthcare/clinics",
    "data/healthcare/dental-clinics",
    "data/housing",
    "data/members",
    "data/posts",
    "data/scheduler",
    "data/trader-profiles",
    "data/transactions",
];

function clearDir(dir: string): number {
    if (!existsSync(dir)) return 0;
    const files = readdirSync(dir).filter(f => f.endsWith(".json"));
    for (const f of files) {
        unlinkSync(join(dir, f));
    }
    return files.length;
}

/**
 * DELETE /api/admin/clear-all
 *
 * Wipes all persisted data files (except network identity) and exits the process
 * so the server restarts with a completely clean in-memory state.
 * Intended for development / testing only.
 */
export function clearAll(_req: Request, res: Response): void {
    let total = 0;
    const detail: { dir: string; deleted: number }[] = [];

    for (const dir of DATA_DIRS) {
        const deleted = clearDir(dir);
        total += deleted;
        detail.push({ dir, deleted });
    }

    res.json({ ok: true, filesDeleted: total, detail });

    // Give the response time to flush before exiting.
    setTimeout(() => process.exit(0), 150);
}

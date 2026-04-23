import { Request, Response } from "express";
import { readdirSync, unlinkSync, existsSync, statSync } from "fs";
import { join, resolve } from "path";
import { Commonwealth } from "../../commons/Commonwealth.js";
import { DomainSettings } from "../../settings/DomainSettings.js";
import { DataManifest } from "../../storage/DataManifest.js";

// ── Per-domain data directories cleared when a domain is disabled ─────────────
// Keyed by stable domain ID. Only domains with persisted data need entries.
const DOMAIN_DATA_DIRS: Record<string, string[]> = {
    "00000000-0000-0000-0000-000000000001": ["data/housing"],
    "00000000-0000-0000-0000-000000000003": ["data/food", "data/food/kitchens", "data/food/mills", "data/food/purchasing"],
    "00000000-0000-0000-0000-000000000004": ["data/healthcare/clinics", "data/healthcare/dental-clinics"],
    "00000000-0000-0000-0000-000000000005": ["data/education/schools", "data/education/libraries"],
    "00000000-0000-0000-0000-000000000010": ["data/courier/requests"],
    "00000000-0000-0000-0000-000000000011": ["data/dependency-care/households", "data/dependency-care/medical-care-units", "data/dependency-care/home-caregiving"],
    "00000000-0000-0000-0000-000000000012": ["data/child-care/home-childcare"],
    "00000000-0000-0000-0000-000000000013": ["data/fire/companies"],
};

/**
 * Directories whose *.json files are deleted on a "clear all" reset.
 * data/network/ is intentionally excluded — it holds node identity and keys.
 * data/settings/ is intentionally excluded — it holds domain enable/disable config.
 */
const DATA_DIRS = [
    "data/accounts",
    "data/assembly",
    "data/calendar",
    "data/child-care",
    "data/constitution",
    "data/councils",
    "data/courier",
    "data/dependency-care",
    "data/education",
    "data/endowment-profiles",
    "data/food",
    "data/groups",
    "data/healthcare",
    "data/housing",
    "data/locations",
    "data/members",
    "data/messages",
    "data/posts",
    "data/referenda",
    "data/scheduler",
    "data/social-insurance",
    "data/sortition",
    "data/trader-profiles",
    "data/transactions",
];

function clearDir(dir: string): number {
    if (!existsSync(dir)) return 0;
    let count = 0;
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            count += clearDir(full);
        } else if (entry.endsWith(".json")) {
            unlinkSync(full);
            DataManifest.getInstance().remove(resolve(full));
            count++;
        }
    }
    return count;
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

// ── Domain management ─────────────────────────────────────────────────────────

/** GET /api/admin/domains — list all registered domains with enabled state. */
export function listDomains(_req: Request, res: Response): void {
    const settings = DomainSettings.getInstance();
    const domains = Commonwealth.getInstance().getDomains().map(d => ({
        id:          d.id,
        name:        d.name,
        description: d.description,
        enabled:     settings.isEnabled(d.id),
        dataDirs:    DOMAIN_DATA_DIRS[d.id] ?? [],
    }));
    res.json(domains);
}

/** POST /api/admin/domains/:id/enable — mark a domain enabled (no restart). */
export function enableDomain(req: Request, res: Response): void {
    const id = String(req.params.id);
    const domain = Commonwealth.getInstance().getDomains().find(d => d.id === id);
    if (!domain) { res.status(404).json({ error: "Domain not found" }); return; }
    DomainSettings.getInstance().setEnabled(id, true);
    res.json({ ok: true });
}

/** DELETE /api/admin/domains/:id — disable a domain and clear its data files (no restart). */
export function disableDomain(req: Request, res: Response): void {
    const id = String(req.params.id);
    const domain = Commonwealth.getInstance().getDomains().find(d => d.id === id);
    if (!domain) { res.status(404).json({ error: "Domain not found" }); return; }
    DomainSettings.getInstance().setEnabled(id, false);
    let filesDeleted = 0;
    for (const dir of DOMAIN_DATA_DIRS[id] ?? []) {
        filesDeleted += clearDir(dir);
    }
    res.json({ ok: true, filesDeleted });
}

/**
 * POST /api/admin/domains/batch
 * Body: { changes: { id: string; enabled: boolean }[] }
 * Applies all changes in one shot, then restarts the server once.
 */
export function batchUpdateDomains(req: Request, res: Response): void {
    const changes: { id: string; enabled: boolean }[] = req.body?.changes ?? [];
    if (!Array.isArray(changes)) { res.status(400).json({ error: "changes must be an array" }); return; }

    const settings = DomainSettings.getInstance();
    const knownIds = new Set(Commonwealth.getInstance().getDomains().map(d => d.id));
    let filesDeleted = 0;

    for (const { id, enabled } of changes) {
        if (typeof id !== "string" || !knownIds.has(id)) continue;
        settings.setEnabled(id, enabled);
        if (!enabled) {
            for (const dir of DOMAIN_DATA_DIRS[id] ?? []) {
                filesDeleted += clearDir(dir);
            }
        }
    }

    res.json({ ok: true, filesDeleted });
    setTimeout(() => process.exit(0), 150);
}

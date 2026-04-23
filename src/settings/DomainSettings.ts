import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname } from "path";

/**
 * Persists the enabled/disabled state of each functional domain to
 * data/settings/domains.json.
 *
 * Domains are enabled by default — an absent entry is the same as true.
 * Disabling a domain clears its data files and restarts the server so
 * in-memory state is also cleared.
 */
export class DomainSettings {
    private static instance: DomainSettings;
    private readonly filePath: string;
    private map: Record<string, boolean> = {};

    private constructor(filePath: string = "data/settings/domains.json") {
        this.filePath = filePath;
        if (existsSync(filePath)) {
            this.map = JSON.parse(readFileSync(filePath, "utf-8"));
        }
    }

    static getInstance(): DomainSettings {
        if (!DomainSettings.instance) {
            DomainSettings.instance = new DomainSettings();
        }
        return DomainSettings.instance;
    }

    /** Returns true if the domain is enabled (missing entry defaults to true). */
    isEnabled(domainId: string): boolean {
        return this.map[domainId] !== false;
    }

    /** Persist the enabled state for a domain. */
    setEnabled(domainId: string, value: boolean): void {
        this.map[domainId] = value;
        mkdirSync(dirname(this.filePath), { recursive: true });
        writeFileSync(this.filePath, JSON.stringify(this.map, null, 2));
    }

    /** Returns the full map for serialization. */
    getAll(): Record<string, boolean> {
        return { ...this.map };
    }
}

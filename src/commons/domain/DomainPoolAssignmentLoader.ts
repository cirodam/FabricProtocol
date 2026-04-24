import { FileStore } from "../../storage/FileStore.js";

/** Maps domainId → poolId for all domains that have a leader pool assigned. */
type Assignments = Record<string, string>;

const KEY = "assignments";

export class DomainPoolAssignmentLoader {
    private readonly store: FileStore;

    constructor(dataDir: string) {
        this.store = new FileStore(dataDir);
    }

    load(): Assignments {
        return this.store.read<Assignments>(KEY) ?? {};
    }

    save(assignments: Assignments): void {
        this.store.write(KEY, assignments);
    }
}

import { FileStore } from "../storage/FileStore.js";
import { Constitution, ConstitutionDocument } from "./Constitution.js";

const FILE_KEY = "constitution";

export class ConstitutionLoader {
    private readonly store: FileStore;

    constructor(dataDir: string) {
        this.store = new FileStore(dataDir);
    }

    /** Load the persisted document into the Constitution singleton, or seed defaults. */
    load(): void {
        const existing = this.store.read<ConstitutionDocument>(FILE_KEY);
        if (existing) {
            Constitution.getInstance().load(existing);
        } else {
            // First boot — persist the defaults
            this.save();
        }
    }

    /** Write the current constitution document to disk. */
    save(): void {
        this.store.write(FILE_KEY, Constitution.getInstance().toDocument());
    }
}

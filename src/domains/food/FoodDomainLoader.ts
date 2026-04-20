import { FileStore } from "../../storage/FileStore.js";

export interface FoodDomainSettings {
    monthlyFoodAllowance: number;
}

const SETTINGS_KEY = "settings";

const DEFAULTS: FoodDomainSettings = {
    monthlyFoodAllowance: 0,
};

export class FoodDomainLoader {
    private readonly store: FileStore;

    constructor(dataDir: string) {
        this.store = new FileStore(dataDir);
    }

    load(): FoodDomainSettings {
        return this.store.read<FoodDomainSettings>(SETTINGS_KEY) ?? { ...DEFAULTS };
    }

    save(settings: FoodDomainSettings): void {
        this.store.write(SETTINGS_KEY, settings);
    }
}

import { Guild } from "./Guild.js";
import { FileStore } from "../../storage/FileStore.js";

interface GuildRecord {
    id: string;
    name: string;
    description: string;
    memberIds: string[];
    createdAt: string;
}

export class GuildLoader {
    private readonly store: FileStore;

    constructor(dataDir: string) {
        this.store = new FileStore(dataDir);
    }

    save(guild: Guild): void {
        const record: GuildRecord = {
            id:          guild.id,
            name:        guild.name,
            description: guild.description,
            memberIds:   guild.getMembers(),
            createdAt:   guild.createdAt.toISOString(),
        };
        this.store.write(guild.id, record);
    }

    loadAll(): Guild[] {
        return this.store.readAll<GuildRecord>().map(r => this.fromRecord(r));
    }

    delete(id: string): boolean {
        return this.store.delete(id);
    }

    private fromRecord(r: GuildRecord): Guild {
        const guild = new Guild(r.name, r.description);
        (guild as unknown as Record<string, unknown>)["id"]        = r.id;
        (guild as unknown as Record<string, unknown>)["createdAt"] = new Date(r.createdAt);
        for (const memberId of r.memberIds ?? []) {
            guild.addMember(memberId);
        }
        return guild;
    }
}

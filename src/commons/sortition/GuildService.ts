import { Guild } from "./Guild.js";
import { GuildLoader } from "./GuildLoader.js";

/**
 * Singleton service that manages the community's collection of guilds.
 */
export class GuildService {
    private static instance: GuildService;

    private guilds: Map<string, Guild> = new Map();
    private loader: GuildLoader | null = null;

    private constructor() {}

    static getInstance(): GuildService {
        if (!GuildService.instance) {
            GuildService.instance = new GuildService();
        }
        return GuildService.instance;
    }

    init(loader: GuildLoader): void {
        this.loader = loader;
        for (const guild of loader.loadAll()) {
            this.guilds.set(guild.id, guild);
        }
    }

    addGuild(guild: Guild): void {
        this.guilds.set(guild.id, guild);
        this.loader?.save(guild);
    }

    saveGuild(guild: Guild): void {
        this.loader?.save(guild);
    }

    getGuild(id: string): Guild | undefined {
        return this.guilds.get(id);
    }

    getAllGuilds(): Guild[] {
        return Array.from(this.guilds.values());
    }

    removeGuild(id: string): boolean {
        const existed = this.guilds.delete(id);
        if (existed) this.loader?.delete(id);
        return existed;
    }
}

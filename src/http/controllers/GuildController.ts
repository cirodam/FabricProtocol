import { Request, Response } from "express";
import { GuildService } from "../../commons/sortition/GuildService.js";
import { Guild } from "../../commons/sortition/Guild.js";
import { MemberService } from "../../member/MemberService.js";

function guildToDto(guild: Guild) {
    return {
        id:          guild.id,
        name:        guild.name,
        description: guild.description,
        memberCount: guild.memberCount,
        createdAt:   guild.createdAt.toISOString(),
    };
}

// GET /guilds
export function listGuilds(_req: Request, res: Response): void {
    const guilds = GuildService.getInstance().getAllGuilds().map(guildToDto);
    res.json({ total: guilds.length, guilds });
}

// GET /guilds/:id
export function getGuild(req: Request, res: Response): void {
    const guild = GuildService.getInstance().getGuild(req.params.id as string);
    if (!guild) { res.status(404).json({ error: "Guild not found" }); return; }
    const memberService = MemberService.getInstance();
    const members = guild.getMembers().map(id => {
        const m = memberService.get(id);
        return {
            id,
            firstName: m?.firstName ?? "Unknown",
            lastName:  m?.lastName ?? "",
            handle:    m?.handle ?? "",
        };
    });
    res.json({ ...guildToDto(guild), members });
}

// POST /guilds  — body: { name, description? }
export function createGuild(req: Request, res: Response): void {
    const { name, description } = req.body ?? {};
    if (typeof name !== "string" || !name.trim()) {
        res.status(400).json({ error: "name is required" }); return;
    }
    const guild = new Guild(
        name.trim(),
        typeof description === "string" ? description.trim() : "",
    );
    GuildService.getInstance().addGuild(guild);
    res.status(201).json(guildToDto(guild));
}

// DELETE /guilds/:id
export function deleteGuild(req: Request, res: Response): void {
    const removed = GuildService.getInstance().removeGuild(req.params.id as string);
    if (!removed) { res.status(404).json({ error: "Guild not found" }); return; }
    res.status(204).send();
}

// POST /guilds/:id/members  — body: { memberId }
export function addMember(req: Request, res: Response): void {
    const svc   = GuildService.getInstance();
    const guild = svc.getGuild(req.params.id as string);
    if (!guild) { res.status(404).json({ error: "Guild not found" }); return; }

    const { memberId } = req.body ?? {};
    if (typeof memberId !== "string" || !memberId.trim()) {
        res.status(400).json({ error: "memberId is required" }); return;
    }
    if (!MemberService.getInstance().get(memberId)) {
        res.status(404).json({ error: "Member not found" }); return;
    }
    if (guild.hasMember(memberId)) {
        res.status(409).json({ error: "Member already in guild" }); return;
    }
    guild.addMember(memberId);
    svc.saveGuild(guild);
    res.status(201).json(guildToDto(guild));
}

// DELETE /guilds/:id/members/:memberId
export function removeMember(req: Request, res: Response): void {
    const svc   = GuildService.getInstance();
    const guild = svc.getGuild(req.params.id as string);
    if (!guild) { res.status(404).json({ error: "Guild not found" }); return; }

    const removed = guild.removeMember(req.params.memberId as string);
    if (!removed) { res.status(404).json({ error: "Member not in guild" }); return; }
    svc.saveGuild(guild);
    res.status(204).send();
}

// POST /guilds/:id/draw  — body: { count }
export function drawMembers(req: Request, res: Response): void {
    const guild = GuildService.getInstance().getGuild(req.params.id as string);
    if (!guild) { res.status(404).json({ error: "Guild not found" }); return; }

    const count = parseInt(String((req.body ?? {}).count ?? "1"), 10);
    if (isNaN(count) || count < 1) {
        res.status(400).json({ error: "count must be a positive integer" }); return;
    }
    const memberService = MemberService.getInstance();
    const drawn = guild.draw(count).map(id => {
        const m = memberService.get(id);
        return {
            id,
            firstName: m?.firstName ?? "Unknown",
            lastName:  m?.lastName ?? "",
            handle:    m?.handle ?? "",
        };
    });
    res.json({ guildId: guild.id, requested: count, drawn });
}

import { Group } from "./Group.js";
import { GroupLoader } from "./GroupLoader.js";
import { Bank } from "../bank/Bank.js";

export class GroupService {
  private static instance: GroupService;

  private groups: Map<string, Group> = new Map();
  private loader: GroupLoader | null = null;

  private constructor() {}

  static getInstance(): GroupService {
    if (!GroupService.instance) GroupService.instance = new GroupService();
    return GroupService.instance;
  }

  init(loader: GroupLoader): void {
    this.loader = loader;
    for (const group of loader.loadAll()) {
      this.groups.set(group.id, group);
    }
  }

  create(name: string, description: string = ""): Group {
    const group = new Group(name, description);
    Bank.getInstance().openAccount(group, "primary");
    this.groups.set(group.id, group);
    this.loader?.save(group);
    return group;
  }

  get(id: string): Group | undefined {
    return this.groups.get(id);
  }

  getAll(): Group[] {
    return Array.from(this.groups.values());
  }

  delete(id: string): void {
    this.groups.delete(id);
    this.loader?.delete(id);
  }
}

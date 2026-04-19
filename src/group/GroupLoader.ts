import { Group } from "./Group.js";
import { FileStore } from "../storage/FileStore.js";

interface GroupRecord {
  id: string;
  name: string;
  description: string;
}

export class GroupLoader {
  private readonly store: FileStore;

  constructor(dataDir: string) {
    this.store = new FileStore(dataDir);
  }

  save(group: Group): void {
    const record: GroupRecord = {
      id: group.id,
      name: group.name,
      description: group.description,
    };
    this.store.write(group.id, record);
  }

  loadAll(): Group[] {
    return this.store.readAll<GroupRecord>().map(r => new Group(r.name, r.description, r.id));
  }

  delete(id: string): boolean {
    return this.store.delete(id);
  }
}

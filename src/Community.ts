import { randomUUID } from "crypto";
import { Constitution } from "./commons/Constitution.js";

export class Community {
  private static instance: Community;

  readonly id: string;
  get name(): string { return Constitution.getInstance().communityName; }
  readonly currencyName = "Kin";
  readonly latitude: number = 0;
  readonly longitude: number = 0;

  private constructor() {
    this.id = randomUUID();
  }

  static getInstance(): Community {
    if (!Community.instance) {
      Community.instance = new Community();
    }
    return Community.instance;
  }
}

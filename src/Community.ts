import { randomUUID } from "crypto";

export class Community {
  private static instance: Community;

  readonly id: string;
  readonly name = "Community";
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

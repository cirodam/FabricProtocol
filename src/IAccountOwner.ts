export type OwnerType = "member" | "commons" | "domain" | "unit" | "central_bank";

export interface IAccountOwner {
    getId(): string;
    readonly ownerType: OwnerType;
}

/**
 * Any entity that can participate in the marketplace as a buyer or seller.
 * Implemented by Member today; Enterprise and other actors in the future.
 *
 * The handle is a short unique tag used in SMS commands:
 *   SEND 50 john groceries
 * It must be lowercase alphanumeric + underscores, unique within the community.
 */
export interface IEconomicActor {
    getId(): string;
    getDisplayName(): string;
    getHandle(): string;
}

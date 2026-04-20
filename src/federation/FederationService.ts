import { Commonwealth } from "../commons/Commonwealth.js";
import { CommunityLink } from "./CommunityLink.js";
import { FECTransaction } from "./FECTransaction.js";

// FederationService manages all inter-community relationships and trade.
// It owns the CommunityLinks and records FECTransactions — IOUs between communities
// that accumulate until cleared via ClearingProposal.
export class FederationService {
    private static instance: FederationService;

    private links: Map<string, CommunityLink> = new Map(); // keyed by remoteCommunityId
    private transactions: FECTransaction[] = [];

    private constructor() {}

    static getInstance(): FederationService {
        if (!FederationService.instance) {
            FederationService.instance = new FederationService();
        }
        return FederationService.instance;
    }

    // --- Link management ---

    addLink(link: CommunityLink): void {
        this.links.set(link.remoteCommunityId, link);
    }

    getLink(remoteCommunityId: string): CommunityLink | undefined {
        return this.links.get(remoteCommunityId);
    }

    getLinks(): CommunityLink[] {
        return Array.from(this.links.values());
    }

    // --- Inter-community trade ---

    // Record a purchase by a local member from a remote community's seller.
    // This community becomes the debtor: balanceFEC decreases (we owe them more).
    recordOutboundPurchase(remoteCommunityId: string, amount: number, memo: string = ""): FECTransaction {
        const link = this.requireActiveLink(remoteCommunityId);

        const newBalance = link.balanceFEC - amount;
        if (newBalance < -link.creditLimitFEC) {
            throw new Error(
                `Credit limit exceeded for community ${remoteCommunityId}. ` +
                `Limit: ${link.creditLimitFEC}, current balance: ${link.balanceFEC}, purchase: ${amount}`
            );
        }

        link.balanceFEC = newBalance;

        const localId = Commonwealth.getInstance().id;
        const tx = new FECTransaction(localId, remoteCommunityId, amount, memo);
        this.transactions.push(tx);
        return tx;
    }

    // Record a sale to a remote community's buyer.
    // This community becomes the creditor: balanceFEC increases (they owe us more).
    recordInboundSale(remoteCommunityId: string, amount: number, memo: string = ""): FECTransaction {
        const link = this.requireActiveLink(remoteCommunityId);

        link.balanceFEC += amount;

        const localId = Commonwealth.getInstance().id;
        const tx = new FECTransaction(remoteCommunityId, localId, amount, memo);
        this.transactions.push(tx);
        return tx;
    }

    // --- Transaction history ---

    getTransactions(remoteCommunityId?: string): FECTransaction[] {
        if (!remoteCommunityId) return [...this.transactions];
        const localId = Commonwealth.getInstance().id;
        return this.transactions.filter(
            (tx) => tx.fromCommunityId === remoteCommunityId || tx.toCommunityId === remoteCommunityId
                 || tx.fromCommunityId === localId || tx.toCommunityId === localId
        ).filter(
            (tx) => tx.fromCommunityId === remoteCommunityId || tx.toCommunityId === remoteCommunityId
        );
    }

    // --- Helpers ---

    private requireActiveLink(remoteCommunityId: string): CommunityLink {
        const link = this.links.get(remoteCommunityId);
        if (!link) throw new Error(`No link found for community ${remoteCommunityId}`);
        if (link.status !== "ACTIVE") throw new Error(`Link to ${remoteCommunityId} is not active (status: ${link.status})`);
        return link;
    }
}

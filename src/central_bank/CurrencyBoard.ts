import { FileStore } from "../storage/FileStore.js";

export interface SettlementRecord {
    /** ISO timestamp of the settlement. */
    at: string;
    /** Positive = inbound (we received kithe). Negative = outbound (we sent kithe). */
    kithe: number;
    /** ID or name of the partner community. */
    partnerId: string;
    memo: string;
}

interface CurrencyBoardState {
    /** Kithe held in reserve, received from the federation as community endowment. */
    kitheReserve: number;
    /** Kin issued against the kithe reserve. Always equal to kitheReserve * KIN_PER_KITHE. */
    kinIssued: number;
    /** Running log of inter-community kithe settlements. */
    settlements: SettlementRecord[];
}

/**
 * The CurrencyBoard is the controlled crossing point between kin and kithe.
 *
 * It holds the community's kithe reserve (received from the federation when the
 * community joins and as the population grows) and issues kin against it at a
 * fixed 1:1 ratio. Kithe never enters local circulation. Kin never leaves the
 * community as kithe. The board is the membrane between the two currencies.
 *
 * Responsibilities:
 *   - Receive kithe from the federation on membership growth
 *   - Issue kin to the local central bank backed by that kithe
 *   - Retire kin and release kithe back to the federation when members depart
 *   - Settle inter-community transactions in kithe without exposing kin
 *
 * The board has no monetary policy discretion. It maintains the backing ratio
 * mechanically. Policy (demurrage, endowment scheduling) belongs to CentralBank.
 * Insurance pool management is a federation-level concern, not handled here.
 */
export class CurrencyBoard {
    private static instance: CurrencyBoard;

    /** Kin issued per kithe held in reserve. Fixed at 1:1. */
    static readonly KIN_PER_KITHE = 1;

    private state: CurrencyBoardState;
    private store: FileStore | null = null;

    private constructor() {
        this.state = {
            kitheReserve: 0,
            kinIssued: 0,
            settlements: [],
        };
    }

    static getInstance(): CurrencyBoard {
        if (!CurrencyBoard.instance) {
            CurrencyBoard.instance = new CurrencyBoard();
        }
        return CurrencyBoard.instance;
    }

    init(store: FileStore): void {
        this.store = store;
        const saved = store.read<CurrencyBoardState>("currency-board");
        if (saved) {
            this.state = saved;
            this.state.settlements ??= [];
        }
    }

    /** Kithe currently held in reserve. */
    get kitheReserve(): number { return this.state.kitheReserve; }

    /** Kin currently issued against the reserve. */
    get kinIssued(): number { return this.state.kinIssued; }

    /** Full settlement history, newest first. */
    get settlements(): SettlementRecord[] { return [...this.state.settlements].reverse(); }

    /**
     * Called when a new member joins or a member's annual endowment is issued.
     * Receives kithe from the federation and issues an equivalent amount of kin
     * to the local central bank at the fixed exchange rate.
     *
     * Returns the amount of kin issued.
     */
    receiveEndowment(kitheReceived: number): number {
        const kinToIssue = kitheReceived * CurrencyBoard.KIN_PER_KITHE;

        this.state.kitheReserve += kitheReceived;
        this.state.kinIssued += kinToIssue;

        this.persist();

        return kinToIssue;
    }

    /**
     * Called when a member departs. Retires kin and releases the corresponding
     * kithe back to the federation. If the member's remaining kin balance is less
     * than their endowment, only the available kin is retired.
     *
     * Returns the kithe released back to the federation.
     */
    retireEndowment(kinToRetire: number): number {
        const kinRetirable = Math.min(kinToRetire, this.state.kinIssued);
        const kitheToRelease = kinRetirable / CurrencyBoard.KIN_PER_KITHE;

        this.state.kinIssued -= kinRetirable;
        this.state.kitheReserve -= kitheToRelease;

        this.persist();

        return kitheToRelease;
    }

    /**
     * Settle an inter-community transaction in kithe.
     * Kithe flows out to the federation for payment to another community.
     * Returns false if reserves are insufficient.
     */
    settleOutbound(kithe: number, partnerId: string, memo: string = ""): boolean {
        if (kithe > this.state.kitheReserve) return false;
        this.state.kitheReserve -= kithe;
        this.state.settlements.push({ at: new Date().toISOString(), kithe: -kithe, partnerId, memo });
        this.persist();
        return true;
    }

    /**
     * Receive kithe from the federation as payment for goods delivered to
     * another community. Adds to the reserve without issuing new kin.
     */
    settleInbound(kithe: number, partnerId: string, memo: string = ""): void {
        this.state.kitheReserve += kithe;
        this.state.settlements.push({ at: new Date().toISOString(), kithe, partnerId, memo });
        this.persist();
    }

    /** Backing ratio — should always be 1.0 under normal operation. */
    get backingRatio(): number {
        if (this.state.kinIssued === 0) return 1;
        return this.state.kitheReserve / (this.state.kinIssued / CurrencyBoard.KIN_PER_KITHE);
    }

    private persist(): void {
        this.store?.write("currency-board", this.state);
    }
}

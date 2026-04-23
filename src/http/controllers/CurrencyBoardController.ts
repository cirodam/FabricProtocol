import { Request, Response } from "express";
import { CurrencyBoard } from "../../central_bank/CurrencyBoard.js";

const cb = () => CurrencyBoard.getInstance();

// GET /api/currency-board
export function getCurrencyBoardStatus(_req: Request, res: Response): void {
    const board = cb();
    const settlements = board.settlements;

    const inbound = settlements
        .filter(s => s.kithe > 0)
        .reduce((sum, s) => sum + s.kithe, 0);
    const outbound = settlements
        .filter(s => s.kithe < 0)
        .reduce((sum, s) => sum + Math.abs(s.kithe), 0);

    res.json({
        kitheReserve: board.kitheReserve,
        kinIssued:    board.kinIssued,
        backingRatio: board.backingRatio,
        netPosition:  inbound - outbound,
        inboundTotal: inbound,
        outboundTotal: outbound,
        settlements,
    });
}

import { Request, Response, NextFunction } from "express";

/**
 * Middleware that requires an authenticated session.
 * Returns 401 if the request has no valid session.
 *
 * Usage — protect a single route:
 *   router.get("/secret", requireAuth, handler);
 *
 * Usage — protect all routes in a router:
 *   router.use(requireAuth);
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
    if (!req.session.memberId) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }
    next();
}

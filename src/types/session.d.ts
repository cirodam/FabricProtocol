import "express-session";

declare module "express-session" {
    interface SessionData {
        /** The authenticated member's ID, set on login and cleared on logout. */
        memberId: string;
    }
}

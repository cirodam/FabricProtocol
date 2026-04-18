const SESSION_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * In-memory session store for SMS authentication.
 * After a member verifies their PIN, their phone is considered authenticated
 * for SESSION_TTL_MS. Sessions are not persisted — a server restart requires
 * re-authentication.
 */
export class SessionStore {
    private static instance: SessionStore;
    private sessions: Map<string, Date> = new Map();

    private constructor() {}

    static getInstance(): SessionStore {
        if (!SessionStore.instance) {
            SessionStore.instance = new SessionStore();
        }
        return SessionStore.instance;
    }

    authenticate(phone: string): void {
        this.sessions.set(phone, new Date(Date.now() + SESSION_TTL_MS));
    }

    isAuthenticated(phone: string): boolean {
        const expiry = this.sessions.get(phone);
        if (!expiry) return false;
        if (Date.now() > expiry.getTime()) {
            this.sessions.delete(phone);
            return false;
        }
        return true;
    }

    revoke(phone: string): void {
        this.sessions.delete(phone);
    }
}

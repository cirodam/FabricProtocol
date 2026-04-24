import { MemberService } from "../member/MemberService.js";

/**
 * Authentication service for web session login.
 *
 * Delegates all credential storage and verification to MemberService.
 * Does not manage sessions — that is the controller's responsibility.
 */
export class AuthService {
    private static instance: AuthService;

    private constructor() {}

    static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    /**
     * Set a web password for a member identified by handle.
     * Returns false if no member with that handle exists.
     */
    setPassword(handle: string, password: string): boolean {
        return MemberService.getInstance().setPassword(handle, password);
    }

    /**
     * Verify a handle + password pair.
     * Returns the member's ID on success, or null on failure.
     */
    verify(handle: string, password: string): string | null {
        return MemberService.getInstance().verifyPassword(handle, password);
    }
}

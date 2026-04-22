import { createHash } from "crypto";
import { MemberService } from "../member/MemberService.js";

/**
 * Authentication service for web session login.
 *
 * Handles password verification. Password storage (hashing) is intentionally
 * kept simple for now using SHA-256. Migrate to argon2 before production use.
 *
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
        const member = MemberService.getInstance().getByHandle(handle);
        if (!member) return false;
        member.passwordHash = createHash("sha256").update(password).digest("hex");
        MemberService.getInstance().save(member);
        return true;
    }

    /**
     * Verify a handle + password pair.
     * Returns the member's ID on success, or null on failure.
     */
    verify(handle: string, password: string): string | null {
        const member = MemberService.getInstance().getByHandle(handle);
        if (!member?.passwordHash) return null;
        const hash = createHash("sha256").update(password).digest("hex");
        if (hash !== member.passwordHash) return null;
        return member.id;
    }
}

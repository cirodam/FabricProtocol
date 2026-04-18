import { randomUUID } from "crypto";
import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";
import { MemberService } from "../../member/MemberService.js";
import { Announcement } from "./Announcement.js";
import { OutgoingMessage } from "../../sms/SmsMessage.js";

// The Communications domain manages the community's internal and external communications:
//   - Bulletin board: persistent announcements visible to all members
//   - Broadcast: sends an SMS to every member who has a phone number on file
//   - Infrastructure: radio stations, internet access points, postal service
//     are modelled as FunctionalUnits within this domain
export class CommunicationsDomain extends FunctionalDomain {
    private announcements: Announcement[] = [];

    constructor() {
        super("Communications", "Manages internal announcements, broadcast messaging, and communications infrastructure.");
    }

    // Post a new announcement to the bulletin board.
    post(title: string, body: string, authorId: string, expiresAt: string | null = null): Announcement {
        const announcement: Announcement = {
            id: randomUUID(),
            title,
            body,
            authorId,
            createdAt: new Date().toISOString(),
            expiresAt,
        };
        this.announcements.push(announcement);
        return announcement;
    }

    // Return all announcements that have not yet expired.
    getAnnouncements(): Announcement[] {
        const now = new Date().toISOString();
        return this.announcements.filter(
            (a) => a.expiresAt === null || a.expiresAt > now
        );
    }

    removeAnnouncement(id: string): void {
        this.announcements = this.announcements.filter((a) => a.id !== id);
    }

    // Prepare outgoing SMS messages for every member who has a phone number.
    // Returns the list — the caller (ModemInterface or TwilioInterface) is responsible
    // for actually sending them.
    broadcast(body: string): OutgoingMessage[] {
        const messages: OutgoingMessage[] = [];
        for (const member of MemberService.getInstance().getAll()) {
            if (member.phone) {
                messages.push({ to: member.phone, body });
            }
        }
        return messages;
    }
}

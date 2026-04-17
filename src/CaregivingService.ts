import { CareAssignment } from "./CareAssignment.js";

export class CaregivingService {
    private static instance: CaregivingService;

    private assignments: Map<string, CareAssignment> = new Map();

    private constructor() {}

    static getInstance(): CaregivingService {
        if (!CaregivingService.instance) {
            CaregivingService.instance = new CaregivingService();
        }
        return CaregivingService.instance;
    }

    assign(caregiverId: string, recipientId: string): CareAssignment {
        const assignment = new CareAssignment(caregiverId, recipientId);
        this.assignments.set(assignment.id, assignment);
        return assignment;
    }

    unassign(assignmentId: string): void {
        this.assignments.delete(assignmentId);
    }

    // All recipients a caregiver is responsible for
    getRecipients(caregiverId: string): CareAssignment[] {
        return Array.from(this.assignments.values()).filter(
            (a) => a.caregiverId === caregiverId
        );
    }

    // All caregivers assigned to a recipient
    getCaregivers(recipientId: string): CareAssignment[] {
        return Array.from(this.assignments.values()).filter(
            (a) => a.recipientId === recipientId
        );
    }

    getAll(): CareAssignment[] {
        return Array.from(this.assignments.values());
    }
}

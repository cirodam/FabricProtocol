import { Proposal, ProposalStatus, VoteThreshold } from "./Proposal.js";
import { Constitution } from "./Constitution.js";
import { ConstitutionLoader } from "./ConstitutionLoader.js";
import { Commonwealth } from "./Commonwealth.js";
import { CommunityRole } from "./CommunityRole.js";
import { MemberService } from "../member/MemberService.js";

export class GovernanceService {
    private static instance: GovernanceService;

    private proposals: Map<string, Proposal> = new Map();
    private constitutionLoader: ConstitutionLoader | null = null;

    private constructor() {}

    initConstitution(loader: ConstitutionLoader): void {
        this.constitutionLoader = loader;
        loader.load();
    }

    static getInstance(): GovernanceService {
        if (!GovernanceService.instance) {
            GovernanceService.instance = new GovernanceService();
        }
        return GovernanceService.instance;
    }

    submitProposal(
        proposerId: string,
        title: string,
        description: string,
        threshold: VoteThreshold = VoteThreshold.SIMPLE_MAJORITY
    ): Proposal {
        const proposal = new Proposal(
            proposerId,
            title,
            description,
            threshold,
            Constitution.getInstance().deliberationPeriodDays
        );
        this.proposals.set(proposal.id, proposal);
        return proposal;
    }

    vote(proposalId: string, memberId: string, inFavor: boolean): void {
        const proposal = this.proposals.get(proposalId);
        if (!proposal) throw new Error(`Proposal ${proposalId} not found`);
        if (proposal.status !== ProposalStatus.OPEN) throw new Error(`Proposal is no longer open`);
        proposal.vote(memberId, inFavor);
    }

    // Tallies votes and closes the proposal if the deliberation period has ended
    closeProposal(proposalId: string): ProposalStatus {
        const proposal = this.proposals.get(proposalId);
        if (!proposal) throw new Error(`Proposal ${proposalId} not found`);
        if (proposal.status !== ProposalStatus.OPEN) return proposal.status;
        if (new Date() < proposal.closesAt) throw new Error(`Deliberation period has not ended`);

        const requiredFraction = Constitution.getInstance().thresholds[proposal.threshold];
        const totalMembers = MemberService.getInstance().count();
        const approvalFraction = totalMembers > 0 ? proposal.yesCount / totalMembers : 0;

        proposal.status = approvalFraction >= requiredFraction
            ? ProposalStatus.PASSED
            : ProposalStatus.FAILED;

        return proposal.status;
    }

    // Elect a member to a position — requires a passed proposal
    electToPosition(position: CommunityRole, memberId: string, proposalId: string): void {
        const proposal = this.proposals.get(proposalId);
        if (!proposal || proposal.status !== ProposalStatus.PASSED) {
            throw new Error(`A passed proposal is required to elect a member to a position`);
        }
        position.memberId = memberId;
        position.termStartDate = new Date();
    }

    // Fund a position at a given monthly rate — requires a passed proposal
    fundPosition(position: CommunityRole, kinPerMonth: number, proposalId: string): void {
        const proposal = this.proposals.get(proposalId);
        if (!proposal || proposal.status !== ProposalStatus.PASSED) {
            throw new Error(`A passed proposal is required to fund a position`);
        }
        position.kinPerMonth = kinPerMonth;
        position.funded = true;
    }

    // Defund a position — requires a passed proposal
    defundPosition(position: CommunityRole, proposalId: string): void {
        const proposal = this.proposals.get(proposalId);
        if (!proposal || proposal.status !== ProposalStatus.PASSED) {
            throw new Error(`A passed proposal is required to defund a position`);
        }
        position.funded = false;
    }

    getProposal(id: string): Proposal | undefined {
        return this.proposals.get(id);
    }

    getAll(): Proposal[] {
        return Array.from(this.proposals.values());
    }

    getOpen(): Proposal[] {
        return this.getAll().filter((p) => p.status === ProposalStatus.OPEN);
    }

    /**
     * Amend a constitutional parameter. The proposal must have already passed.
     * Persists the updated constitution to disk.
     */
    amendParameter(proposalId: string, key: string, newValue: number | boolean): void {
        const proposal = this.proposals.get(proposalId);
        if (!proposal || proposal.status !== ProposalStatus.PASSED) {
            throw new Error(`A passed proposal is required to amend a constitutional parameter`);
        }
        Constitution.getInstance().amend(key, newValue, proposalId);
        this.constitutionLoader?.save();
    }
}

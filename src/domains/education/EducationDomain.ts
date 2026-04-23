import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";
import { CommunityRole } from "../../commons/CommunityRole.js";
import { School } from "./School.js";
import { SchoolLoader } from "./SchoolLoader.js";
import { Library } from "./Library.js";
import { LibraryLoader } from "./LibraryLoader.js";

/**
 * The Education domain organizes learning and knowledge transfer within the community.
 *
 * The goal is not to prepare children for employment — the community's three-layer
 * income model (food voucher floor, commons dividend, wages for work) means survival
 * is not contingent on holding a job. The goal is to produce capable, engaged members
 * who can participate in governance, contribute when the community needs them, and
 * live well.
 *
 * Education is organized in three phases:
 *
 *   Foundational (ages 5–12): Structured instruction in literacy, numeracy, and
 *   basic science. Taught by paid community members in small groups.
 *
 *   Applied (ages 12–16): Apprenticeships within functional domains. The student
 *   contributes real labor at reduced capacity while learning domain skills from
 *   working members.
 *
 *   Self-directed (16+): Philosophy, science, advanced skills, or deeper domain
 *   specialization — whatever the member chooses to pursue. The community provides
 *   access to knowledge and knowledgeable members; direction is the member's own.
 *
 * Teachers and mentors hold funded positions and are compensated as community workers.
 * Knowledge transfer is community infrastructure, not a volunteer activity.
 */
export class EducationDomain extends FunctionalDomain {
    private static instance: EducationDomain;
    private schoolLoader: SchoolLoader | null = null;
    private libraryLoader: LibraryLoader | null = null;

    constructor() {
        super("Education", "Organizes learning, skill transfer, and knowledge infrastructure for the community.",
            "00000000-0000-0000-0000-000000000005");
        this.addRole(new CommunityRole(
            "Education Coordinator",
            "Coordinates community schools, libraries, and learning programs; ensures members have access to education at all life stages.",
            700,
        ));
    }

    static getInstance(): EducationDomain {
        if (!EducationDomain.instance) {
            EducationDomain.instance = new EducationDomain();
        }
        return EducationDomain.instance;
    }

    initSchools(loader: SchoolLoader): void {
        this.schoolLoader = loader;
        for (const school of loader.loadAll()) {
            this.addUnit(school);
        }
    }

    addSchool(school: School): void {
        this.addUnit(school);
        this.schoolLoader?.save(school);
    }

    saveSchool(school: School): void {
        this.schoolLoader?.save(school);
    }

    getSchool(id: string): School | undefined {
        return this.getUnitsByType<School>("school").find(u => u.id === id);
    }

    getAllSchools(): School[] {
        return this.getUnitsByType<School>("school");
    }

    removeSchool(id: string): void {
        this.removeUnit(id);
        this.schoolLoader?.delete(id);
    }

    // ── Libraries ────────────────────────────────────────────────────────────

    initLibraries(loader: LibraryLoader): void {
        this.libraryLoader = loader;
        for (const library of loader.loadAll()) {
            this.addUnit(library);
        }
    }

    addLibrary(library: Library): void {
        this.addUnit(library);
        this.libraryLoader?.save(library);
    }

    saveLibrary(library: Library): void {
        this.libraryLoader?.save(library);
    }

    getLibrary(id: string): Library | undefined {
        return this.getUnitsByType<Library>("library").find(u => u.id === id);
    }

    getAllLibraries(): Library[] {
        return this.getUnitsByType<Library>("library");
    }

    removeLibrary(id: string): void {
        this.removeUnit(id);
        this.libraryLoader?.delete(id);
    }
}


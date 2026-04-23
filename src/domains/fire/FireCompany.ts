import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * A FireCompany is a fire station and its crew — the operational unit that responds to
 * alarms, maintains apparatus, and provides first-response medical support.
 *
 * A community large enough to span several neighbourhoods or geographic areas will
 * operate more than one company. Each company covers a response zone and is staffed
 * with a mix of full-time and on-call firefighters. In a community economy, core crew
 * are compensated through community positions; on-call members may hold partial positions
 * or be covered by an on-call stipend.
 *
 * A FireCompany typically operates:
 * - One or more engine companies (structure fire suppression, hose lines)
 * - A tanker where municipal water supply is limited (common in rural communities)
 * - A rescue unit for vehicle extrication and technical rescue
 * - Basic life support capability as first medical responders
 *
 * Fire companies train together and maintain their own apparatus. Inter-company mutual
 * aid is standard — when a working structure fire exceeds one company's capacity,
 * neighbouring companies respond automatically.
 *
 * Staffing: 4–6 FTEs per company for a career core, supplemented by on-call members.
 * On-call response depends heavily on community geography and member availability.
 */
export class FireCompany extends FunctionalUnit {
    readonly createdAt: Date;

    constructor(name: string, id?: string) {
        super(name, "A fire station and crew providing fire suppression, rescue, and first-response services.", undefined, id);
        this.createdAt = new Date();
    }

    getType(): string { return "fire-company"; }
}

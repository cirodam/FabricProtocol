import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

// Physical mail and courier service within and between communities.
// Handles packages, letters, and inter-community document transfer.
// In a federation context, porters may carry physical records or goods
// between communities on regular routes.
export class PostalService extends FunctionalUnit {
    constructor(name: string = "Postal Service") {
        super(name, "Physical mail, courier, and inter-community document transfer.");
    }

    getType(): string { return "postal-service"; }

}

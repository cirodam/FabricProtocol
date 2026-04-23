import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";

// The Communications domain manages the community's physical and digital communications
// infrastructure: radio stations, internet access points, postal/courier hubs, notice
// boards, and similar shared facilities are modelled as FunctionalUnits within this domain.
export class CommunicationsDomain extends FunctionalDomain {
    private static instance: CommunicationsDomain;

    private constructor() {
        super("Communications", "Manages community communications infrastructure: radio stations, internet access points, postal hubs, and similar facilities.", "00000000-0000-0000-0000-000000000006");
    }

    static getInstance(): CommunicationsDomain {
        if (!CommunicationsDomain.instance) {
            CommunicationsDomain.instance = new CommunicationsDomain();
        }
        return CommunicationsDomain.instance;
    }
}

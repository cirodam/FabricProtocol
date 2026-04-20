import { FileStore } from "../../storage/FileStore.js";
import { DeliveryRequest, DeliveryPriority, DeliveryStatus } from "./DeliveryRequest.js";

interface DeliveryRequestRecord {
    id:                    string;
    requesterId:           string;
    description:           string;
    originLocationId:      string;
    destinationLocationId: string;
    priority:              DeliveryPriority;
    status:                DeliveryStatus;
    createdAt:             string;
    completedAt:           string | null;
}

export class DeliveryRequestLoader {
    private readonly store: FileStore;

    constructor(dataDir: string) {
        this.store = new FileStore(dataDir);
    }

    save(request: DeliveryRequest): void {
        const record: DeliveryRequestRecord = {
            id:                    request.id,
            requesterId:           request.requesterId,
            description:           request.description,
            originLocationId:      request.originLocationId,
            destinationLocationId: request.destinationLocationId,
            priority:              request.priority,
            status:                request.status,
            createdAt:             request.createdAt.toISOString(),
            completedAt:           request.completedAt?.toISOString() ?? null,
        };
        this.store.write(request.id, record);
    }

    loadAll(): DeliveryRequest[] {
        return this.store.readAll<DeliveryRequestRecord>().map(r => {
            const req = new DeliveryRequest(
                r.requesterId,
                r.description,
                r.originLocationId,
                r.destinationLocationId,
                r.priority,
                r.id,
                new Date(r.createdAt),
            );
            req.status      = r.status;
            req.completedAt = r.completedAt ? new Date(r.completedAt) : null;
            return req;
        });
    }

    delete(id: string): boolean {
        return this.store.delete(id);
    }
}

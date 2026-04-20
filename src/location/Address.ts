export interface Address {
    street: string;
    unit?:  string;   // apt, suite, unit number
    city:   string;
    state:  string;
    zip:    string;
}

export function formatAddress(a: Address): string {
    const line1 = a.unit ? `${a.street}, ${a.unit}` : a.street;
    return `${line1}, ${a.city}, ${a.state} ${a.zip}`;
}

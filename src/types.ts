export class StationNavigation {
    constructor(public readonly deviceId: string, public readonly name: string) {}

    public static fromRegistration(registration: Registration): StationNavigation {
        return new StationNavigation(registration.deviceId, registration.address);
    }
}

export class Registration {
    public readonly address: string;

    constructor(
        public readonly deviceId: string,
        public readonly addresses: string[],
        public readonly port: number,
        public zeroconf: Date | null = null,
        public udp: Date | null = null,
        public lost: Date | null = null,
        public queried: Date | null = null,
        public replied: Date | null = null,
        public refreshed: Date | null = null
    ) {
        this.address = this.addresses[0];
    }

    public clone(): Registration {
        return new Registration(
            this.deviceId,
            this.addresses,
            this.port,
            this.zeroconf,
            this.udp,
            this.lost,
            this.queried,
            this.replied,
            new Date()
        );
    }
}

export class PersistedStation {
    constructor(public readonly reply: AppProto.HttpReply, public readonly registration: Registration) {}
}

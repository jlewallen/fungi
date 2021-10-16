import Zeroconf from "react-native-zeroconf";
import RNFetchBlob from "react-native-fetch-blob";

import dgram from "react-native-udp";
import { Buffer } from "buffer";
import { fk_app as AppProto } from "fk-app-protocol/fk-app";

export class Registration {
    constructor(
        public readonly name: string,
        public readonly addresses: string[],
        public readonly port: number,
        public zeroconf: Date | null = null,
        public udp: Date | null = null,
        public lost: Date | null = null,
        public queried: Date | null = null,
        public replied: Date | null = null
    ) {}
}

type CallbackFunc = (registrations: Registration[]) => Promise<void>;

export class Discovery {
    private readonly services: { [index: string]: Registration } = {};
    private callback: CallbackFunc = async () => {};
    private zeroconf: Zeroconf = null;

    async start(callback: CallbackFunc): Promise<void> {
        if (this.zeroconf) {
            return;
        }

        this.callback = callback;
        this.zeroconf = new Zeroconf();

        this.zeroconf.on("start", () => console.log("Zeroconf scan has started."));
        this.zeroconf.on("stop", () => console.log("Zeroconf scan has stopped."));
        this.zeroconf.on("found", (found: unknown) => console.log("Zeroconf found.", found));
        this.zeroconf.on("update", () => {
            // console.log('Zeroconf update.');
            this.refresh();
        });
        this.zeroconf.on("error", (error: string) => console.log("Zeroconf error.", error));

        this.zeroconf.on("resolved", (resolved: { name: string; addresses: string[]; port: number }) => {
            console.log("Zeroconf found.", resolved);
            this.onZeroConfFound(resolved.name, resolved.addresses, resolved.port);
            this.refresh();
        });

        this.zeroconf.on("remove", (removed: string) => {
            console.log("Zeroconf remove.", removed);
            this.onServiceLost(removed);
            this.refresh();
        });

        this.zeroconf.scan("fk", "tcp", "local.");

        const socket = dgram.createSocket("udp4");
        socket.bind(22143, function () {
            console.log("udp: bound");
            socket.addMembership("224.1.2.3");
        });

        socket.on("message", (buffer, rinfo) => {
            const addresses = [rinfo.address];
            console.log("udp: message", buffer, addresses);
            const decoded = AppProto.UdpMessage.decodeDelimited(buffer);
            const deviceId = Buffer.from(decoded.deviceId).toString("hex");
            console.log("udp: decoded", decoded);
            this.onUdpFound(deviceId, addresses, 80);
        });

        const periodicRefresh = () => {
            setTimeout(() => {
                this.refresh();
                periodicRefresh();
            }, 1000);
        };

        periodicRefresh();

        return Promise.resolve();
    }

    refresh() {
        this.callback(this.getServices());
    }

    onUdpFound(name: string, addresses: string[], port: number) {
        console.log("onUdpFound", name, addresses, port);
        if (!this.services[name]) {
            this.services[name] = new Registration(name, addresses, port);
        }
        this.services[name].udp = new Date();
        this.services[name].lost = null;
    }

    onZeroConfFound(name: string, addresses: string[], port: number) {
        console.log("onZeroConfFound", name, addresses, port);
        if (!this.services[name]) {
            this.services[name] = new Registration(name, addresses, port);
        }
        this.services[name].zeroconf = new Date();
        this.services[name].lost = null;
    }

    onServiceLost(name: string) {
        if (this.services[name]) {
            console.log("onServiceLost", name);
            this.services[name].lost = new Date();
        } else {
            console.log("onServiceLost (MYSTERY)", name);
        }
    }

    getServices(): Registration[] {
        return Object.values(this.services);
    }

    async query(name: string): Promise<void> {
        const service = this.services[name];
        if (!service) {
            console.log("querying (MYSTERY)", name);
            return Promise.resolve();
        }

        console.log("query-service", service);

        const url = `http://${service.addresses[0]}:${service.port}/fk/v1`;

        console.log("query-url", url);

        service.queried = new Date();

        this.refresh();

        await RNFetchBlob.fetch("GET", url)
            .then((res: ResponseType) => {
                service.replied = new Date();
                console.log("response", res.info());
                const status = res.info().status;
                if (status == 200) {
                    const base64Str = res.base64();
                    const buffer = Buffer.from(base64Str, "base64");
                    const decoded = AppProto.HttpReply.decodeDelimited(buffer);
                    console.log("query-decoded", decoded);
                }
            })
            .catch((errorMessage: string, statusCode: number) => {
                console.log(`query-error-`, statusCode, errorMessage);
            });

        this.refresh();

        return Promise.resolve();
    }
}

type ResponseType = {};

import Emitter from "tiny-emitter";
import Zeroconf from "react-native-zeroconf";
import RNFetchBlob from "react-native-fetch-blob";
import dgram from "react-native-udp";
import { Buffer } from "buffer";
import { fk_app as AppProto } from "fk-app-protocol/fk-app";

import { Registration, PersistedStation } from "./types";

type ResponseType = {};

export class Discovery extends Emitter {
    private readonly services: { [index: string]: Registration } = {};
    private readonly stations: { [index: string]: PersistedStation } = {};
    private zeroconf: Zeroconf = null;
    public passive = true;

    async start(): Promise<void> {
        if (this.zeroconf) {
            return;
        }

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
                if (!this.passive) {
                    this.tryQuerying().finally(() => {
                        periodicRefresh();
                    });
                } else {
                    periodicRefresh();
                }
            }, 1000);
        };

        periodicRefresh();

        return Promise.resolve();
    }

    private shouldQuery(reg: Registration): boolean {
        if (!reg.queried) {
            return true;
        }
        const now = new Date();
        const mark = reg.replied || reg.queried;
        const elapsed = now - mark;
        return elapsed > 10 * 1000;
    }

    async tryQuerying(): Promise<void> {
        const querying = this.getRegistrations().filter((reg) => this.shouldQuery(reg));
        await Promise.all(querying.map((reg) => this.query(reg.deviceId)));
    }

    private refresh(id: string | null = null) {
        if (id) {
            console.log("refresh", "id", id);
        } else {
            console.log("refresh");
        }

        const registrations = this.getRegistrations();
        this.emit(`registrations`, registrations);

        for (const registration of registrations) {
            this.emit(`registrations/${registration.deviceId}`, registration);
        }

        if (id) {
            const station = this.stations[id];
            if (station) {
                this.emit(`stations/${id}`, station);
            }
        }
    }

    private onUdpFound(deviceId: string, addresses: string[], port: number) {
        console.log("onUdpFound", deviceId, addresses, port);
        if (!this.services[deviceId]) {
            this.services[deviceId] = new Registration(deviceId, addresses, port);
        }
        this.services[deviceId].udp = new Date();
        this.services[deviceId].lost = null;
    }

    private onZeroConfFound(deviceId: string, addresses: string[], port: number) {
        console.log("onZeroConfFound", deviceId, addresses, port);
        if (!this.services[deviceId]) {
            this.services[deviceId] = new Registration(deviceId, addresses, port);
        }
        this.services[deviceId].zeroconf = new Date();
        this.services[deviceId].lost = null;
    }

    private onServiceLost(deviceId: string) {
        if (this.services[deviceId]) {
            console.log("onServiceLost", deviceId);
            this.services[deviceId].lost = new Date();
        } else {
            console.log("onServiceLost (MYSTERY)", deviceId);
        }
    }

    private getRegistrations(): Registration[] {
        return Object.values(this.services);
    }

    public setPassive(passive: boolean) {
        this.passive = passive;
    }

    async query(deviceId: string): Promise<void> {
        const service = this.services[deviceId];
        if (!service) {
            console.log("querying (MYSTERY)", deviceId);
            return Promise.resolve();
        }

        console.log("query-service", service);

        const url = `http://${service.address}:${service.port}/fk/v1`;

        // console.log("query-url", url);

        const query = AppProto.HttpQuery.create({
            type: AppProto.QueryType.QUERY_TAKE_READINGS,
        });
        const encoded = AppProto.HttpQuery.encodeDelimited(query as AppProto.IHttpQuery).finish();
        // console.log("query-encoded", encoded);

        const body = Buffer.from(encoded).toString("base64");
        // console.log("query-body", body);

        service.queried = new Date();

        this.refresh(deviceId);

        await RNFetchBlob.fetch(
            "POST",
            url,
            {
                "Content-Type": "application/octet-stream",
            },
            body
        )
            .then((res: ResponseType) => {
                service.replied = new Date();
                console.log("response", res.info());
                const status = res.info().status;
                if (status == 200) {
                    const base64Str = res.base64();
                    const buffer = Buffer.from(base64Str, "base64");
                    const decoded = AppProto.HttpReply.decodeDelimited(buffer);
                    console.log("query-decoded", decoded);

                    this.stations[deviceId] = new PersistedStation(decoded, service);
                }
            })
            .catch((errorMessage: string, statusCode: number) => {
                console.log(`query-error-`, statusCode, errorMessage);
            });

        this.refresh(deviceId);

        return Promise.resolve();
    }
}

import Zeroconf from 'react-native-zeroconf';
import dgram from 'react-native-udp';

export class Registration {
  constructor(
    public readonly name: string,
    public readonly addresses: string[],
    public readonly port: number,
    public zeroconf: Date | null = null,
    public udp: Date | null = null,
    public lost: Date | null = null,
  ) {}
}

type CallbackFunc = (registrations: Registration[]) => Promise<void>;

export class Discovery {
  private readonly services: {[index: string]: Registration} = {};
  private zeroconf: Zeroconf = null;

  async start(callback: CallbackFunc): Promise<void> {
    if (this.zeroconf) {
      return;
    }

    this.zeroconf = new Zeroconf();

    this.zeroconf.on('start', () => console.log('Zeroconf scan has started.'));
    this.zeroconf.on('stop', () => console.log('Zeroconf scan has stopped.'));
    this.zeroconf.on('found', found => console.log('Zeroconf found.', found));
    this.zeroconf.on('update', () => {
      // console.log('Zeroconf update.');
      callback(this.getServices());
    });
    this.zeroconf.on('error', error => console.log('Zeroconf error.', error));

    this.zeroconf.on('resolved', resolved => {
      console.log('Zeroconf found.', resolved);
      this.onServiceFound(resolved.name, resolved.addresses, resolved.port);
      callback(this.getServices());
    });

    this.zeroconf.on('remove', removed => {
      console.log('Zeroconf remove.', removed);
      this.onServiceLost(removed);
      callback(this.getServices());
    });

    this.zeroconf.scan('fk', 'tcp', 'local.');

    const socket = dgram.createSocket('udp4');
    socket.bind(22143, function () {
      console.log('udp: bound');
      socket.addMembership('224.1.2.3');
    });

    socket.on('message', function (msg, rinfo) {
      console.log('udp: message', msg, rinfo);
    });

    setInterval(() => {
      callback(this.getServices());
    }, 1000);

    return Promise.resolve();
  }

  onServiceFound(name: string, addresses: string[], port: number) {
    console.log('onServiceFound', name, addresses, port);
    if (!this.services[name]) {
      this.services[name] = new Registration(name, addresses, port);
    }
    this.services[name].zeroconf = new Date();
  }

  onServiceLost(name: string) {
    if (this.services[name]) {
      console.log('onServiceLost', name);
      this.services[name].lost = new Date();
    } else {
      console.log('onServiceLost (MYSTERY)', name);
    }
  }

  getServices(): Registration[] {
    return Object.values(this.services);
  }
}

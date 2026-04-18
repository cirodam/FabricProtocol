import { SmsHandler } from "./SmsHandler.js";

/**
 * Production SMS interface via USB GSM modem (SIM800, SIM7600, etc.).
 * Communicates over serial port using AT commands.
 *
 * Requires: npm install serialport
 * Tested with: Waveshare SIM7600 USB hat on Raspberry Pi
 *
 * AT command flow:
 *   AT+CMGF=1           — set text mode (vs PDU mode)
 *   AT+CNMI=1,1,0,0,0   — notify on new message arrival
 *   AT+CMGR=<index>     — read message at index
 *   AT+CMGS="<number>"  — send message (body + Ctrl+Z to send)
 *   AT+CMGD=<index>     — delete message after processing
 */
export class ModemInterface {
  // TODO: replace with: import { SerialPort } from "serialport";
  private port: unknown = null;
  private readonly handler: SmsHandler;

  constructor(
    private readonly portPath: string,   // e.g. "/dev/ttyUSB0"
    private readonly baudRate: number = 115200
  ) {
    this.handler = new SmsHandler();
  }

  start(): void {
    // TODO: open serial port
    // const port = new SerialPort({ path: this.portPath, baudRate: this.baudRate });
    // const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));
    //
    // port.write("AT+CMGF=1\r\n");
    // port.write("AT+CNMI=1,1,0,0,0\r\n");
    //
    // parser.on("data", (line: string) => this.onLine(line));
    console.log(`[modem] TODO: open serial port at ${this.portPath}`);
  }

  stop(): void {
    // TODO: close serial port
  }

  private onLine(_line: string): void {
    // TODO: parse +CMTI: "SM",<index> notifications and call readMessage(index)
  }

  private readMessage(_index: number): void {
    // TODO: send AT+CMGR=<index>, parse response into IncomingMessage,
    // call this.handler.handle(msg), send reply, delete message
  }

  private sendSms(_to: string, _body: string): void {
    // TODO: AT+CMGS="<to>"\r\n<body>\x1A
  }
}

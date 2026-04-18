import { SerialPort, ReadlineParser } from "serialport";
import { SmsHandler } from "./SmsHandler.js";
import { IncomingMessage } from "./SmsMessage.js";

/**
 * Production SMS interface via USB GSM modem (SIM800, SIM7600, etc.).
 * Communicates over serial port using AT commands.
 *
 * Tested with: Waveshare SIM7600 USB hat on Raspberry Pi
 *
 * AT command flow:
 *   AT+CMGF=1           — set text mode (vs PDU mode)
 *   AT+CNMI=1,1,0,0,0   — notify on new message arrival (+CMTI unsolicited)
 *   AT+CMGR=<index>     — read message at index
 *   AT+CMGS="<number>"  — send message (body + Ctrl+Z to send)
 *   AT+CMGD=<index>     — delete message after processing
 */
export class ModemInterface {
  private port: SerialPort | null = null;
  private parser: ReadlineParser | null = null;
  private readonly handler: SmsHandler;

  /** Buffer accumulating lines for the current AT+CMGR response */
  private readBuffer: string[] = [];
  private readingMessage = false;

  constructor(
    private readonly portPath: string,   // e.g. "/dev/ttyUSB0"
    private readonly baudRate: number = 115200
  ) {
    this.handler = new SmsHandler();
  }

  start(): void {
    this.port = new SerialPort({ path: this.portPath, baudRate: this.baudRate });
    this.parser = this.port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

    this.port.on("open", () => {
      console.log(`[modem] Serial port open: ${this.portPath}`);
      // Text mode + unsolicited new-message notifications
      this.send("AT+CMGF=1");
      this.send("AT+CNMI=1,1,0,0,0");
    });

    this.port.on("error", (err) => {
      console.error(`[modem] Serial error: ${err.message}`);
    });

    this.parser.on("data", (line: string) => this.onLine(line.trim()));
  }

  stop(): void {
    this.port?.close((err) => {
      if (err) console.error(`[modem] Error closing port: ${err.message}`);
    });
    this.port = null;
    this.parser = null;
  }

  // ── Inbound ────────────────────────────────────────────────────────────────

  private onLine(line: string): void {
    if (!line) return;

    // New message notification: +CMTI: "SM",<index>
    const cmti = line.match(/^\+CMTI:\s*"[^"]+",(\d+)$/);
    if (cmti) {
      this.readMessage(parseInt(cmti[1], 10));
      return;
    }

    // Accumulate CMGR response lines until "OK"
    if (this.readingMessage) {
      if (line === "OK") {
        this.processReadBuffer();
        this.readBuffer = [];
        this.readingMessage = false;
      } else {
        this.readBuffer.push(line);
      }
      return;
    }

    // Start of CMGR response: +CMGR: "REC UNREAD","+15551234567",,"26/04/18,12:00:00+00"
    if (line.startsWith("+CMGR:")) {
      this.readingMessage = true;
      this.readBuffer = [line];
    }
  }

  /**
   * Parse buffered CMGR lines and dispatch to SmsHandler.
   * Buffer[0] is the +CMGR header; Buffer[1] is the message body.
   */
  private processReadBuffer(): void {
    if (this.readBuffer.length < 2) return;

    const header = this.readBuffer[0];
    const body   = this.readBuffer[1];

    // Extract sender number from header: +CMGR: "REC UNREAD","+15551234567",...
    const match = header.match(/^\+CMGR:\s*"[^"]*","([^"]+)"/);
    if (!match) {
      console.warn("[modem] Could not parse CMGR header:", header);
      return;
    }

    const msg: IncomingMessage = { from: match[1], body };
    const reply = this.handler.handle(msg);
    this.sendSms(reply.to, reply.body);
  }

  private readMessage(index: number): void {
    this.send(`AT+CMGR=${index}`);
    // Delete after a short delay to give the modem time to finish responding
    setTimeout(() => this.send(`AT+CMGD=${index}`), 2000);
  }

  // ── Outbound ───────────────────────────────────────────────────────────────

  private sendSms(to: string, body: string): void {
    if (!this.port) return;
    this.send(`AT+CMGS="${to}"`);
    // Small delay before body to let modem issue the ">" prompt
    setTimeout(() => {
      this.port?.write(`${body}\x1A`, (err) => {
        if (err) console.error(`[modem] Send error: ${err.message}`);
        else console.log(`[modem] SMS sent to ${to}`);
      });
    }, 500);
  }

  private send(cmd: string): void {
    this.port?.write(`${cmd}\r\n`, (err) => {
      if (err) console.error(`[modem] Write error (${cmd}): ${err.message}`);
    });
  }
}


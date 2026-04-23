/**
 * Development SMS interface via Twilio webhooks.
 * Twilio POSTs to /sms when a message arrives at your Twilio number.
 *
 * Requires: npm install express @types/express
 *
 * Setup:
 *   1. Create a Twilio account and buy a phone number.
 *   2. Set the number's messaging webhook to: http://<your-server>/sms
 *   3. Set env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
 *
 * In development, expose localhost with: npx ngrok http 3000
 */
export class TwilioInterface {
  // TODO: wire up Express + Twilio webhook (see commented body of start())
  constructor(private readonly port: number = 3000) {}

  start(): void {
    // TODO:
    // this.app = express();
    // this.app.use(express.urlencoded({ extended: false }));
    //
    // this.app.post("/sms", (req: Request, res: Response) => {
    //   const msg: IncomingMessage = {
    //     from: req.body.From,
    //     body: req.body.Body?.trim() ?? "",
    //   };
    //   const reply = this.handler.handle(msg);
    //   res.type("text/xml").send(
    //     `<?xml version="1.0"?><Response><Message>${reply.body}</Message></Response>`
    //   );
    // });
    //
    // this.app.listen(this.port, () =>
    //   console.log(`[twilio] SMS webhook listening on port ${this.port}`)
    // );
    console.log(`[twilio] TODO: start Express webhook on port ${this.port}`);
  }
}

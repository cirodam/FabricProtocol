/** A normalized inbound SMS message from any interface (modem or Twilio). */
export interface IncomingMessage {
  from: string;   // E.164 phone number, e.g. "+15551234567"
  body: string;   // Raw message text, trimmed
}

/** A reply to send back to the sender. */
export interface OutgoingMessage {
  to: string;
  body: string;
}

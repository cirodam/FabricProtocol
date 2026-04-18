import { IncomingMessage, OutgoingMessage } from "./SmsMessage.js";
import { MemberService } from "../member/MemberService.js";
import { Bank } from "../bank/Bank.js";
import { Marketplace } from "../marketplace/Marketplace.js";

/**
 * Parses inbound SMS commands and dispatches to the appropriate service.
 * Returned OutgoingMessage is sent back to the sender by the interface layer.
 *
 * Supported commands (case-insensitive):
 *   BAL                              — account balance
 *   SEND <amount> <handle> [memo]    — transfer credits
 *   POST OFFER|REQUEST <title> <price> [qty] [category]  — create marketplace post
 *   POSTS [category]                 — list active posts
 *   PIN <pin>                        — authenticate session
 *   HELP                             — command list
 */
export class SmsHandler {
  handle(msg: IncomingMessage): OutgoingMessage {
    const body = msg.body.trim();
    const upper = body.toUpperCase();
    const reply = (text: string): OutgoingMessage => ({ to: msg.from, body: text });

    const member = MemberService.getInstance().getByPhone(msg.from);

    // Commands that do not require a known member
    if (upper === "HELP") {
      return reply(
        "Commands:\nBAL\nSEND <amt> <handle> [memo]\nPOST OFFER|REQUEST <title> <price> [qty]\nPOSTS [category]\nPIN <pin>"
      );
    }

    if (!member) {
      return reply("Phone number not registered. Contact your community administrator.");
    }

    const tokens = body.split(/\s+/);
    const cmd = tokens[0].toUpperCase();

    // TODO: implement PIN session check for write operations
    // TODO: implement each command below

    switch (cmd) {
      case "BAL": {
        const account = Bank.getInstance().getPrimaryAccount(member.getId());
        if (!account) return reply("No account found.");
        return reply(`Balance: ${account.credits} credits`);
      }

      case "SEND": {
        // SEND <amount> <handle> [memo]
        // TODO: require PIN session
        return reply("SEND not yet implemented.");
      }

      case "POST": {
        // POST OFFER|REQUEST <title> <price> [qty] [category]
        // TODO: require PIN session
        return reply("POST not yet implemented.");
      }

      case "POSTS": {
        // POSTS [category]
        const category = tokens[1]?.toLowerCase();
        const posts = Marketplace.getInstance().getPosts({ category });
        if (posts.length === 0) return reply("No active posts.");
        const lines = posts.slice(0, 5).map(p =>
          `${p.side.toUpperCase()} ${p.title} ${p.price}cr (@${p.posterId})`
        );
        return reply(lines.join("\n"));
      }

      case "PIN": {
        // TODO: implement session store
        return reply("PIN not yet implemented.");
      }

      default:
        return reply(`Unknown command: ${cmd}. Text HELP for commands.`);
    }
  }
}

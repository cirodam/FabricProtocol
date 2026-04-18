import { IncomingMessage, OutgoingMessage } from "./SmsMessage.js";
import { MemberService } from "../member/MemberService.js";
import { Bank } from "../bank/Bank.js";
import { Marketplace } from "../marketplace/Marketplace.js";
import { SessionStore } from "./SessionStore.js";
import { Post } from "../marketplace/Post.js";

/**
 * Parses inbound SMS commands and dispatches to the appropriate service.
 * Returned OutgoingMessage is sent back to the sender by the interface layer.
 *
 * Supported commands (case-insensitive):
 *   BAL                              — account balance
 *   SEND <amount> <handle> [memo]    — transfer credits
 *   POST OFFER|REQUEST <category> <title> <price> [qty]  — create marketplace post
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
        "Commands:\nBAL\nSEND <amt> <handle> [memo]\nPOST OFFER|REQUEST <cat> <title> <price> [qty]\nPOSTS [category]\nPIN <code>"
      );
    }

    if (!member) {
      return reply("Phone number not registered. Contact your community administrator.");
    }

    const tokens = body.split(/\s+/);
    const cmd = tokens[0].toUpperCase();
    const sessions = SessionStore.getInstance();

    switch (cmd) {
      case "BAL": {
        const account = Bank.getInstance().getPrimaryAccount(member.getId());
        if (!account) return reply("No account found.");
        const parts = [`Credits: ${account.credits}`];
        if (account.foodVouchers > 0) parts.push(`Food vouchers: ${account.foodVouchers}`);
        if (account.fec > 0) parts.push(`FEC: ${account.fec}`);
        return reply(parts.join("\n"));
      }

      case "SEND": {
        // SEND <amount> <handle> [memo]
        if (!sessions.isAuthenticated(msg.from)) return reply("PIN required. Text: PIN <your-pin>");

        const amount = parseFloat(tokens[1]);
        const handle = tokens[2];
        const memo   = tokens.slice(3).join(" ") || "";

        if (!amount || amount <= 0) return reply("Usage: SEND <amount> <handle> [memo]");
        if (!handle)                return reply("Usage: SEND <amount> <handle> [memo]");

        const fromAccount = Bank.getInstance().getPrimaryAccount(member.getId());
        if (!fromAccount) return reply("No account found.");

        const recipientMember = MemberService.getInstance().getByHandle(handle);
        if (!recipientMember) return reply(`Unknown handle: ${handle}`);

        const toAccount = Bank.getInstance().getPrimaryAccount(recipientMember.getId());
        if (!toAccount) return reply(`No account found for ${handle}`);

        try {
          Bank.getInstance().transfer(fromAccount.id, toAccount.id, "credits", amount, memo);
          const updated = Bank.getInstance().getPrimaryAccount(member.getId())!;
          return reply(`Sent ${amount} credits to ${handle}. New balance: ${updated.credits}`);
        } catch (err) {
          return reply((err as Error).message);
        }
      }

      case "POSTS": {
        // POSTS [category]
        const category = tokens[1]?.toLowerCase();
        const posts = Marketplace.getInstance().getPosts({ category });
        if (posts.length === 0) return reply("No active posts.");
        const lines = posts.slice(0, 5).map(p => {
          const who = p.posterHandle ? `@${p.posterHandle}` : p.posterName || p.posterId.slice(0, 8);
          const qty = p.quantity !== undefined ? ` (qty: ${p.quantity})` : "";
          return `${p.side.toUpperCase()} ${p.title} ${p.price}cr${qty} ${who}`;
        });
        return reply(lines.join("\n"));
      }

      case "PIN": {
        // PIN <code>
        const code = tokens[1];
        if (!code) return reply("Usage: PIN <code>");
        if (!member.pinHash) return reply("No PIN set on your account. Contact an administrator.");
        if (!MemberService.getInstance().verifyPin(member.id, code)) return reply("Incorrect PIN.");
        sessions.authenticate(msg.from);
        return reply("Authenticated. Session valid for 15 minutes.");
      }

      case "POST": {
        // POST OFFER|REQUEST <category> <title> <price> [qty]
        if (!sessions.isAuthenticated(msg.from)) return reply("PIN required. Text: PIN <your-pin>");

        const side = tokens[1]?.toUpperCase();
        const category = tokens[2]?.toLowerCase();
        const title = tokens[3];
        const price = parseFloat(tokens[4]);
        const qty = tokens[5] !== undefined ? parseFloat(tokens[5]) : undefined;

        if (side !== "OFFER" && side !== "REQUEST")
            return reply("Usage: POST OFFER|REQUEST <category> <title> <price> [qty]");
        if (!category || !title)
            return reply("Usage: POST OFFER|REQUEST <category> <title> <price> [qty]");
        if (isNaN(price) || price < 0)
            return reply("price must be a non-negative number");
        if (qty !== undefined && (isNaN(qty) || qty <= 0))
            return reply("qty must be a positive number");

        const post = new Post(
            member.id,
            member.getDisplayName(),
            member.getHandle(),
            qty !== undefined ? "item" : "service",
            side === "OFFER" ? "offer" : "request",
            category,
            title,
            "",
            price,
            qty !== undefined ? { quantity: qty } : { pricingUnit: "in_total" }
        );
        Marketplace.getInstance().addPost(post);
        return reply(`Posted: ${side} ${title} at ${price} credits${qty !== undefined ? `, qty ${qty}` : ""}.`);
      }

      default:
        return reply(`Unknown command: ${cmd}. Text HELP for commands.`);
    }
  }
}

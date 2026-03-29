import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const allConversations = await ctx.db.query("conversations").collect();
    return allConversations
      .filter((c) => c.participant_ids.includes(userId))
      .sort((a, b) => (b.last_message_at ?? 0) - (a.last_message_at ?? 0));
  },
});

export const get = query({
  args: { id: v.id("conversations") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: {
    participant_ids: v.array(v.string()),
    event_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("conversations").collect();
    const found = existing.find(
      (c) =>
        c.participant_ids.length === args.participant_ids.length &&
        args.participant_ids.every((id) => c.participant_ids.includes(id))
    );
    if (found) return found._id;

    return await ctx.db.insert("conversations", {
      participant_ids: args.participant_ids,
      event_id: args.event_id,
    });
  },
});

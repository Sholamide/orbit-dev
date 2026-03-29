import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversation_id", conversationId)
      )
      .collect();
  },
});

export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.string(),
    body: v.string(),
    isAnonymous: v.boolean(),
  },
  handler: async (ctx, { conversationId, senderId, body, isAnonymous }) => {
    const now = Date.now();

    await ctx.db.insert("messages", {
      conversation_id: conversationId,
      sender_id: senderId,
      body,
      is_anonymous: isAnonymous,
      created_at: now,
    });

    await ctx.db.patch(conversationId, {
      last_message: body,
      last_message_at: now,
    });
  },
});

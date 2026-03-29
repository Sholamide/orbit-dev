import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  conversations: defineTable({
    participant_ids: v.array(v.string()),
    event_id: v.optional(v.string()),
    last_message: v.optional(v.string()),
    last_message_at: v.optional(v.number()),
  }).index("by_participant", ["participant_ids"]),

  messages: defineTable({
    conversation_id: v.id("conversations"),
    sender_id: v.string(),
    body: v.string(),
    is_anonymous: v.boolean(),
    created_at: v.number(),
  }).index("by_conversation", ["conversation_id", "created_at"]),
});

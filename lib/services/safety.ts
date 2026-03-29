import { supabase } from '@/lib/supabase';
import { type TrustedContact } from '@/lib/types';

export async function reportUser(
  reporterId: string,
  reportedUserId: string,
  reason: string,
  details?: string
): Promise<void> {
  const { error } = await supabase.from('reports').insert({
    reporter_id: reporterId,
    reported_user_id: reportedUserId,
    reason,
    details: details ?? null,
  });
  if (error) throw error;
}

export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  const { error } = await supabase.from('blocks').insert({
    blocker_id: blockerId,
    blocked_id: blockedId,
  });
  if (error) throw error;
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);
  if (error) throw error;
}

export async function getBlockedUserIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('blocks')
    .select('blocked_id')
    .eq('blocker_id', userId);
  if (error) throw error;
  return (data ?? []).map((b) => b.blocked_id);
}

export async function isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  const { data } = await supabase
    .from('blocks')
    .select('id')
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId)
    .maybeSingle();
  return !!data;
}

export async function getTrustedContacts(userId: string): Promise<TrustedContact[]> {
  const { data, error } = await supabase
    .from('trusted_contacts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addTrustedContact(
  userId: string,
  name: string,
  phone: string
): Promise<TrustedContact> {
  const { data, error } = await supabase
    .from('trusted_contacts')
    .insert({ user_id: userId, name, phone })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function removeTrustedContact(contactId: string): Promise<void> {
  const { error } = await supabase
    .from('trusted_contacts')
    .delete()
    .eq('id', contactId);
  if (error) throw error;
}

export async function createSafetyCheckin(
  userId: string,
  eventId?: string,
  venueId?: string
): Promise<string> {
  const { data, error } = await supabase
    .from('safety_checkins')
    .insert({
      user_id: userId,
      event_id: eventId ?? null,
      venue_id: venueId ?? null,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function markSafe(checkinId: string): Promise<void> {
  const { error } = await supabase
    .from('safety_checkins')
    .update({ status: 'safe', resolved_at: new Date().toISOString() })
    .eq('id', checkinId);
  if (error) throw error;
}

export async function triggerAlert(checkinId: string): Promise<void> {
  const { error } = await supabase
    .from('safety_checkins')
    .update({ status: 'alert', resolved_at: new Date().toISOString() })
    .eq('id', checkinId);
  if (error) throw error;
}

export async function getActiveCheckin(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('safety_checkins')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('check_in_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

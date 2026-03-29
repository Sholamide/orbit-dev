ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS push_token text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_per_user
  ON safety_checkins(user_id) WHERE status = 'pending';

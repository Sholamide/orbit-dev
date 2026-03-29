-- Orbit Database Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  vibe_preferences text[] default '{}',
  is_anonymous boolean default false,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view all profiles"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- VENUES
-- ============================================================
create table public.venues (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  category text not null check (category in ('club', 'lounge', 'rooftop', 'bar', 'popup')),
  vibe_tags text[] default '{}',
  cover_image_url text,
  gallery_urls text[] default '{}',
  address text,
  latitude float8,
  longitude float8,
  hot_score int default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.venues enable row level security;

create policy "Anyone can view venues"
  on public.venues for select
  using (true);

create policy "Admins can insert venues"
  on public.venues for insert
  with check (auth.uid() = created_by);

create policy "Admins can update their venues"
  on public.venues for update
  using (auth.uid() = created_by);

-- ============================================================
-- EVENTS
-- ============================================================
create table public.events (
  id uuid default gen_random_uuid() primary key,
  venue_id uuid references public.venues(id) on delete cascade not null,
  title text not null,
  description text,
  cover_image_url text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_at timestamptz default now()
);

alter table public.events enable row level security;

create policy "Anyone can view events"
  on public.events for select
  using (true);

-- ============================================================
-- SWIPES
-- ============================================================
create table public.swipes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  venue_id uuid references public.venues(id) on delete cascade not null,
  direction text not null check (direction in ('left', 'right')),
  created_at timestamptz default now(),
  unique (user_id, venue_id)
);

alter table public.swipes enable row level security;

create policy "Users can view their own swipes"
  on public.swipes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own swipes"
  on public.swipes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own swipes"
  on public.swipes for update
  using (auth.uid() = user_id);

-- ============================================================
-- ATTENDANCES
-- ============================================================
create table public.attendances (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  event_id uuid references public.events(id) on delete cascade not null,
  status text not null default 'going' check (status in ('going', 'maybe', 'invited')),
  created_at timestamptz default now(),
  unique (user_id, event_id)
);

alter table public.attendances enable row level security;

create policy "Anyone can view attendances"
  on public.attendances for select
  using (true);

create policy "Users can insert their own attendance"
  on public.attendances for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own attendance"
  on public.attendances for update
  using (auth.uid() = user_id);

create policy "Users can delete their own attendance"
  on public.attendances for delete
  using (auth.uid() = user_id);

-- ============================================================
-- COMPANION REQUESTS
-- ============================================================
create table public.companion_requests (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  event_id uuid references public.events(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz default now()
);

alter table public.companion_requests enable row level security;

create policy "Users can view requests they sent or received"
  on public.companion_requests for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send companion requests"
  on public.companion_requests for insert
  with check (auth.uid() = sender_id);

create policy "Receivers can update companion request status"
  on public.companion_requests for update
  using (auth.uid() = receiver_id);

-- ============================================================
-- INDEXES for performance
-- ============================================================
create index idx_swipes_user on public.swipes(user_id);
create index idx_swipes_venue on public.swipes(venue_id);
create index idx_attendances_event on public.attendances(event_id);
create index idx_attendances_user on public.attendances(user_id);
create index idx_events_venue on public.events(venue_id);
create index idx_events_starts_at on public.events(starts_at);
create index idx_companion_requests_sender on public.companion_requests(sender_id);
create index idx_companion_requests_receiver on public.companion_requests(receiver_id);
create index idx_venues_category on public.venues(category);
create index idx_venues_hot_score on public.venues(hot_score desc);

-- ============================================================
-- STORAGE BUCKET for avatars
-- ============================================================
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

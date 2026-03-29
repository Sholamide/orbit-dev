-- Seed Data for Orbit (Kano Edition - Updated)
-- Run this in the Supabase SQL Editor AFTER 001_initial_schema.sql

insert into public.venues (name, description, category, vibe_tags, cover_image_url, address, latitude, longitude, hot_score) values
(
  'Coolio Premium Lounge',
  'Upscale resto-lounge and club in Sabon Gari with premium cocktails, continental & traditional dishes, rooftop vibes, and top DJs spinning Afrobeats every weekend. Perfect for classy nights out.',
  'lounge',
  '{"Exclusive", "Late Night", "VIP"}',
  'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800',
  'Ballet Hughes by Court Road, Sabon Gari, Kano',
  12.0025, 8.5350, 92
),
(
  'Cálido Rooftop',
  'Rooftop bar with city views, sunset drinks, live highlife/acoustic sets on Thursdays, and relaxed Northern vibes. Ideal for chill hangouts and good conversations.',
  'rooftop',
  '{"Chill", "Rooftop", "Live Music"}',
  'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800',
  'Farm Centre Area, Kano',
  12.0100, 8.5200, 90
),
(
  'Mozida Night Hub',
  'Premium lounge and club with pool bar, garden, culture vibes, old-school classics mixed with modern beats. Friday & Saturday nights get lively with great energy.',
  'club',
  '{"Hype", "Late Night", "Exclusive"}',
  'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800',
  'No.5 Daura Street, No-Man''s-Land, Kano',
  11.9950, 8.5400, 94
),
(
  'Hybrid Sunset Lounge',
  'Elegant lounge with premium vibes, cocktails, and occasional live performances. Perfect for classy evenings and connecting with good company.',
  'lounge',
  '{"Chill", "Exclusive", "Live Music"}',
  'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800',
  'Zoo Road Area, Kano',
  11.9850, 8.5450, 85
),
(
  'Club 47',
  'Popular spot for parties with DJs, specials, and energetic crowd. One of Kano''s go-to for weekend fun.',
  'club',
  '{"Hype", "Late Night", "Exclusive"}',
  'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800',
  'Sabon Gari, Kano',
  12.0010, 8.5380, 93
),
(
  'Knight House Nights',
  'Late-night hangout with music, drinks, and good vibes. Known for consistent energy and local favorites.',
  'popup',
  '{"Hype", "Live Music", "Late Night"}',
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
  'Jaba Road Area, Kano',
  11.9900, 8.5500, 84
),
(
  'Antika Garden Lounge',
  'Modern garden lounge with continental & traditional options, chill music, and relaxed premium setting.',
  'lounge',
  '{"Chill", "Exclusive", "Garden Vibes"}',
  'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800',
  'Court Road, Sabon Gari, Kano',
  12.0040, 8.5330, 80
),
(
  'Kasamigo Lifestyle',
  'Cozy premium bar and lounge (formerly Madagascar) with great drinks, sumptuous meals, and welcoming vibes. Ideal for socializing, unwinding, and enjoying the Sabon Gari scene.',
  'bar',
  '{"Chill", "Late Night", "Premium"}',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
  '42 Middle Road by Ibo Road, Sabon Gari, Kano',
  12.0000, 8.5350, 82
);

-- Seed some events for the venues (adjusted for current date: Feb 27, 2026 is a Friday)
-- Note: Events unchanged as they referenced surviving venues only
insert into public.events (venue_id, title, description, starts_at, ends_at) 
select 
  v.id,
  'Friday Premium Takeover',
  'Biggest night of the week at Coolio. Resident DJs, drink specials, VIP sections, and pure Kano energy.',
  now() + interval '0 days' + interval '8 hours',  -- Tonight (Friday evening)
  now() + interval '0 days' + interval '14 hours'
from public.venues v where v.name = 'Coolio Premium Lounge';

insert into public.events (venue_id, title, description, starts_at, ends_at) 
select 
  v.id,
  'Rooftop Sunset Sessions',
  'Live acoustic/highlife sets as the sun sets. Premium drinks and chill Northern vibes.',
  now() + interval '1 day',  -- Saturday
  now() + interval '1 day' + interval '5 hours'
from public.venues v where v.name = 'Cálido Rooftop';

insert into public.events (venue_id, title, description, starts_at, ends_at) 
select 
  v.id,
  'Mozida Old-School Reloaded',
  'Timeless classics mixed with modern beats. Pool bar open, limited capacity — book early.',
  now() + interval '1 day',  -- Saturday evening
  now() + interval '1 day' + interval '6 hours'
from public.venues v where v.name = 'Mozida Night Hub';

insert into public.events (venue_id, title, description, starts_at, ends_at) 
select 
  v.id,
  'Weekend Garden Party',
  'Day-to-night vibes with garden access, DJs, and bring-your-crew energy. Relaxed Kano style.',
  now() + interval '2 days',  -- Sunday daytime
  now() + interval '2 days' + interval '10 hours'
from public.venues v where v.name = 'Antika Garden Lounge';

insert into public.events (venue_id, title, description, starts_at, ends_at) 
select 
  v.id,
  'Club 47 Friday Afters',
  'Post-Juma''at party with hype DJs, specials, and non-stop vibes. Dress sharp!',
  now() + interval '0 days' + interval '10 hours',  -- Friday late night
  now() + interval '0 days' + interval '16 hours'
from public.venues v where v.name = 'Club 47';
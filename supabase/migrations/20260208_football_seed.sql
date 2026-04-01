-- Seed the four IOMFA football leagues for 2025/26 season
-- Run this once after the sports_core migration

insert into public.sports_leagues (sport_code, slug, name, season, status)
values
  ('football', 'iom-premier-league',  'Canada Life Premier League',      '2025/26', 'active'),
  ('football', 'iom-division-2',      'DPS Ltd Division Two',            '2025/26', 'active'),
  ('football', 'iom-combination-1',   'Canada Life Combination League 1', '2025/26', 'active'),
  ('football', 'iom-combination-2',   'DPS Ltd Combination League 2',    '2025/26', 'active')
on conflict (slug) do update
  set name   = excluded.name,
      season = excluded.season,
      status = excluded.status;

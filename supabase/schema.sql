-- oshitaku cloud sync schema (Supabase / PostgreSQL)
-- Run this in the Supabase SQL Editor after creating the project.
--
-- Design notes:
--  - auth.users (Supabase Auth) IS the parent account. No separate "parent" table
--    is needed for identity; we just reference auth.uid() directly.
--  - `parent_profile` holds app-specific parent data (display name, onboarding state).
--  - Every child-owned table carries `child_id` and inherits access control via a
--    join back to `child.parent_id = auth.uid()` in RLS policies.
--  - `updated_at` + `deleted_at` (soft delete) on every syncable table enables
--    last-write-wins conflict resolution and tombstone propagation for deletes.
--  - `id` columns are text (not uuid) to match the existing SQLite-generated ids
--    (nanoid-style) produced by src/utils/id.ts, so local rows sync without remapping.

-- ── Extensions ────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Helper: auto-touch updated_at ────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ── parent_profile ────────────────────────────────────────────────────────
create table parent_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── child ─────────────────────────────────────────────────────────────────
create table child (
  id text primary key,
  parent_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  avatar_emoji text not null,
  avatar_color text not null,
  avatar_image_uri text,
  school_arrival_times jsonb not null default '{}',
  active_timetable_set_id text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_child_parent on child(parent_id);

-- ── timetable_set ─────────────────────────────────────────────────────────
create table timetable_set (
  id text primary key,
  child_id text not null references child(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_timetable_set_child on timetable_set(child_id);

-- ── subject ───────────────────────────────────────────────────────────────
create table subject (
  id text primary key,
  child_id text not null references child(id) on delete cascade,
  name text not null,
  color text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_subject_child on subject(child_id);

-- ── item (mochimono) ──────────────────────────────────────────────────────
create table item (
  id text primary key,
  child_id text not null references child(id) on delete cascade,
  name text not null,
  icon text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_item_child on item(child_id);

-- ── subject_item (join table) ────────────────────────────────────────────
create table subject_item (
  id text primary key,
  subject_id text not null references subject(id) on delete cascade,
  item_id text not null references item(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_subject_item_subject on subject_item(subject_id);
create index idx_subject_item_item on subject_item(item_id);

-- ── timetable_entry ───────────────────────────────────────────────────────
create table timetable_entry (
  id text primary key,
  child_id text not null references child(id) on delete cascade,
  timetable_set_id text not null references timetable_set(id) on delete cascade,
  day_of_week integer not null,
  period integer not null,
  subject_id text not null references subject(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_timetable_entry_set on timetable_entry(timetable_set_id);
create index idx_timetable_entry_child on timetable_entry(child_id);

-- ── morning_task / evening_task ───────────────────────────────────────────
create table morning_task (
  id text primary key,
  child_id text not null references child(id) on delete cascade,
  label text not null,
  icon text not null,
  sort_order integer not null default 0,
  days_of_week jsonb not null default '[0,1,2,3,4,5,6]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_morning_task_child on morning_task(child_id);

create table evening_task (
  id text primary key,
  child_id text not null references child(id) on delete cascade,
  label text not null,
  icon text not null,
  sort_order integer not null default 0,
  days_of_week jsonb not null default '[0,1,2,3,4,5,6]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_evening_task_child on evening_task(child_id);

-- ── daily_task_log ────────────────────────────────────────────────────────
create table daily_task_log (
  id text primary key,
  child_id text not null references child(id) on delete cascade,
  date text not null,
  kind text not null,
  ref_id text not null,
  checked boolean not null default false,
  checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (child_id, date, kind, ref_id)
);
create index idx_daily_task_log_child_date on daily_task_log(child_id, date);

-- ── day_completion ────────────────────────────────────────────────────────
create table day_completion (
  id text primary key,
  child_id text not null references child(id) on delete cascade,
  date text not null,
  morning_completed boolean not null default false,
  morning_completed_at timestamptz,
  morning_on_time boolean not null default false,
  evening_completed boolean not null default false,
  evening_completed_at timestamptz,
  evening_on_time boolean not null default false,
  no_forgotten_items boolean not null default false,
  awarded_rules jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (child_id, date)
);
create index idx_day_completion_child_date on day_completion(child_id, date);

-- ── reward ────────────────────────────────────────────────────────────────
create table reward (
  id text primary key,
  child_id text not null references child(id) on delete cascade,
  name text not null,
  icon text not null,
  description text not null default '',
  image_uri text,
  point_cost integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_reward_child on reward(child_id);

-- ── chore (おてつだい) ────────────────────────────────────────────────────
create table chore (
  id text primary key,
  child_id text not null references child(id) on delete cascade,
  name text not null,
  icon text not null,
  point_value integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_chore_child on chore(child_id);

-- ── point_rule ────────────────────────────────────────────────────────────
create table point_rule (
  child_id text primary key references child(id) on delete cascade,
  morning_complete integer not null default 10,
  evening_complete integer not null default 10,
  on_time integer not null default 5,
  no_forgotten_items integer not null default 5,
  perfect_day_bonus integer not null default 20,
  updated_at timestamptz not null default now()
);

-- ── point_history ─────────────────────────────────────────────────────────
create table point_history (
  id text primary key,
  child_id text not null references child(id) on delete cascade,
  date text not null,
  type text not null,
  amount integer not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_point_history_child on point_history(child_id);
create index idx_point_history_child_date on point_history(child_id, date);

-- ── stamp ─────────────────────────────────────────────────────────────────
create table stamp (
  id text primary key,
  child_id text not null references child(id) on delete cascade,
  date text not null,
  kind text not null,
  stamp_type text not null,
  source text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_stamp_child on stamp(child_id);
create index idx_stamp_child_date on stamp(child_id, date);

-- ── notification_setting ──────────────────────────────────────────────────
create table notification_setting (
  child_id text primary key references child(id) on delete cascade,
  morning_enabled boolean not null default true,
  morning_time text not null default '07:00',
  evening_enabled boolean not null default true,
  evening_time text not null default '20:00',
  reminder_enabled boolean not null default true,
  reminder_minutes_after integer not null default 20,
  updated_at timestamptz not null default now()
);

-- ── updated_at triggers (last-write-wins support) ────────────────────────
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'parent_profile','child','timetable_set','subject','item','subject_item',
    'timetable_entry','morning_task','evening_task','daily_task_log',
    'day_completion','reward','chore','point_rule','point_history','stamp',
    'notification_setting'
  ])
  loop
    execute format(
      'create trigger trg_%1$s_updated_at before update on %1$s
       for each row execute function set_updated_at();', t
    );
  end loop;
end $$;

-- ── Row Level Security ────────────────────────────────────────────────────
-- Every table is scoped to the owning parent so accounts are fully isolated.

alter table parent_profile enable row level security;
create policy "parent reads own profile" on parent_profile
  for select using (auth.uid() = id);
create policy "parent updates own profile" on parent_profile
  for update using (auth.uid() = id);
create policy "parent inserts own profile" on parent_profile
  for insert with check (auth.uid() = id);

alter table child enable row level security;
create policy "parent manages own children" on child
  for all using (auth.uid() = parent_id) with check (auth.uid() = parent_id);

-- Generic pattern for every child-scoped table: access allowed iff the
-- referenced child belongs to the calling parent.
create policy "parent manages own timetable_set" on timetable_set
  for all using (exists (select 1 from child c where c.id = timetable_set.child_id and c.parent_id = auth.uid()))
  with check (exists (select 1 from child c where c.id = timetable_set.child_id and c.parent_id = auth.uid()));
alter table timetable_set enable row level security;

create policy "parent manages own subject" on subject
  for all using (exists (select 1 from child c where c.id = subject.child_id and c.parent_id = auth.uid()))
  with check (exists (select 1 from child c where c.id = subject.child_id and c.parent_id = auth.uid()));
alter table subject enable row level security;

create policy "parent manages own item" on item
  for all using (exists (select 1 from child c where c.id = item.child_id and c.parent_id = auth.uid()))
  with check (exists (select 1 from child c where c.id = item.child_id and c.parent_id = auth.uid()));
alter table item enable row level security;

create policy "parent manages own subject_item" on subject_item
  for all using (exists (
    select 1 from subject s join child c on c.id = s.child_id
    where s.id = subject_item.subject_id and c.parent_id = auth.uid()
  ))
  with check (exists (
    select 1 from subject s join child c on c.id = s.child_id
    where s.id = subject_item.subject_id and c.parent_id = auth.uid()
  ));
alter table subject_item enable row level security;

create policy "parent manages own timetable_entry" on timetable_entry
  for all using (exists (select 1 from child c where c.id = timetable_entry.child_id and c.parent_id = auth.uid()))
  with check (exists (select 1 from child c where c.id = timetable_entry.child_id and c.parent_id = auth.uid()));
alter table timetable_entry enable row level security;

create policy "parent manages own morning_task" on morning_task
  for all using (exists (select 1 from child c where c.id = morning_task.child_id and c.parent_id = auth.uid()))
  with check (exists (select 1 from child c where c.id = morning_task.child_id and c.parent_id = auth.uid()));
alter table morning_task enable row level security;

create policy "parent manages own evening_task" on evening_task
  for all using (exists (select 1 from child c where c.id = evening_task.child_id and c.parent_id = auth.uid()))
  with check (exists (select 1 from child c where c.id = evening_task.child_id and c.parent_id = auth.uid()));
alter table evening_task enable row level security;

create policy "parent manages own daily_task_log" on daily_task_log
  for all using (exists (select 1 from child c where c.id = daily_task_log.child_id and c.parent_id = auth.uid()))
  with check (exists (select 1 from child c where c.id = daily_task_log.child_id and c.parent_id = auth.uid()));
alter table daily_task_log enable row level security;

create policy "parent manages own day_completion" on day_completion
  for all using (exists (select 1 from child c where c.id = day_completion.child_id and c.parent_id = auth.uid()))
  with check (exists (select 1 from child c where c.id = day_completion.child_id and c.parent_id = auth.uid()));
alter table day_completion enable row level security;

create policy "parent manages own reward" on reward
  for all using (exists (select 1 from child c where c.id = reward.child_id and c.parent_id = auth.uid()))
  with check (exists (select 1 from child c where c.id = reward.child_id and c.parent_id = auth.uid()));
alter table reward enable row level security;

create policy "parent manages own chore" on chore
  for all using (exists (select 1 from child c where c.id = chore.child_id and c.parent_id = auth.uid()))
  with check (exists (select 1 from child c where c.id = chore.child_id and c.parent_id = auth.uid()));
alter table chore enable row level security;

create policy "parent manages own point_rule" on point_rule
  for all using (exists (select 1 from child c where c.id = point_rule.child_id and c.parent_id = auth.uid()))
  with check (exists (select 1 from child c where c.id = point_rule.child_id and c.parent_id = auth.uid()));
alter table point_rule enable row level security;

create policy "parent manages own point_history" on point_history
  for all using (exists (select 1 from child c where c.id = point_history.child_id and c.parent_id = auth.uid()))
  with check (exists (select 1 from child c where c.id = point_history.child_id and c.parent_id = auth.uid()));
alter table point_history enable row level security;

create policy "parent manages own stamp" on stamp
  for all using (exists (select 1 from child c where c.id = stamp.child_id and c.parent_id = auth.uid()))
  with check (exists (select 1 from child c where c.id = stamp.child_id and c.parent_id = auth.uid()));
alter table stamp enable row level security;

create policy "parent manages own notification_setting" on notification_setting
  for all using (exists (select 1 from child c where c.id = notification_setting.child_id and c.parent_id = auth.uid()))
  with check (exists (select 1 from child c where c.id = notification_setting.child_id and c.parent_id = auth.uid()));
alter table notification_setting enable row level security;

-- ── Auto-create parent_profile row on signup ─────────────────────────────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into parent_profile (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

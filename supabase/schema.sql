-- ============================================================================
-- 「今天吃点啥」Supabase 初始化脚本
-- 使用前：
--   1) Supabase 控制台 → Authentication → Providers → 开启 Anonymous（匿名登录）
--   2) SQL Editor 中完整粘贴并执行本文件
-- 数据模型与本地 IndexedDB 对应；安全模型：匿名用户凭房间成员关系（room_members）
-- 只能读写自己所在房间的数据（RLS 行级安全）。
-- ============================================================================

-- ---------- 工具函数：判断当前用户是否为某房间成员 ----------
create or replace function public.is_room_member(p_room uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.room_members
    where room_id = p_room and member_id = auth.uid()
  );
$$;

-- ---------- 房间 ----------
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,            -- 6 位邀请码
  created_by uuid,
  created_at timestamptz not null default now()
);
alter table public.rooms enable row level security;

drop policy if exists "登录用户可查看房间（加入流程需要按邀请码查询）" on public.rooms;
create policy "登录用户可查看房间（加入流程需要按邀请码查询）"
  on public.rooms for select
  to authenticated
  using (true);

drop policy if exists "登录用户可创建房间" on public.rooms;
create policy "登录用户可创建房间"
  on public.rooms for insert
  to authenticated
  with check (created_by = auth.uid());

drop policy if exists "房间成员可更新房间" on public.rooms;
create policy "房间成员可更新房间"
  on public.rooms for update
  to authenticated
  using (public.is_room_member(id));

-- ---------- 成员资料（每个 auth 用户一条） ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '我',
  emoji text not null default '🙋',
  color text not null default '#E8833A',
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists "登录用户可读成员资料（房间内展示昵称头像）" on public.profiles;
create policy "登录用户可读成员资料（房间内展示昵称头像）"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "用户可创建自己的资料" on public.profiles;
create policy "用户可创建自己的资料"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "用户只能更新自己的资料" on public.profiles;
create policy "用户只能更新自己的资料"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- 新用户登录后自动创建 profile（可选触发器）
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, emoji, color)
  values (new.id, '我', '🙋', '#E8833A')
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- 房间成员关系 ----------
create table if not exists public.room_members (
  room_id uuid not null references public.rooms(id) on delete cascade,
  member_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, member_id)
);
alter table public.room_members enable row level security;

drop policy if exists "房间成员可查看成员关系" on public.room_members;
create policy "房间成员可查看成员关系"
  on public.room_members for select
  to authenticated
  using (public.is_room_member(room_id) or member_id = auth.uid());

drop policy if exists "登录用户可加入已存在的房间" on public.room_members;
create policy "登录用户可加入已存在的房间"
  on public.room_members for insert
  to authenticated
  with check (member_id = auth.uid());

-- ---------- 菜品 ----------
create table if not exists public.dishes (
  id uuid primary key,                    -- 与客户端本地 id 一致
  room_id uuid not null references public.rooms(id) on delete cascade,
  name text not null,
  category text not null default '主食',
  emoji text not null default '🍽️',
  kcal_per_100g numeric not null default 0,
  default_portion_g numeric not null default 100,
  custom_image text,                      -- 压缩后 dataURL
  builtin boolean not null default false,
  deleted boolean not null default false,
  operator_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.dishes enable row level security;

drop policy if exists "房间成员可读取菜品" on public.dishes;
create policy "房间成员可读取菜品"
  on public.dishes for select
  to authenticated
  using (public.is_room_member(room_id));

drop policy if exists "房间成员可新增菜品" on public.dishes;
create policy "房间成员可新增菜品"
  on public.dishes for insert
  to authenticated
  with check (public.is_room_member(room_id));

drop policy if exists "房间成员可更新菜品" on public.dishes;
create policy "房间成员可更新菜品"
  on public.dishes for update
  to authenticated
  using (public.is_room_member(room_id))
  with check (public.is_room_member(room_id));

drop policy if exists "房间成员可删除菜品" on public.dishes;
create policy "房间成员可删除菜品"
  on public.dishes for delete
  to authenticated
  using (public.is_room_member(room_id));

-- ---------- 进食记录 ----------
create table if not exists public.meals (
  id uuid primary key,
  room_id uuid not null references public.rooms(id) on delete cascade,
  date date not null,
  meal_type text not null,
  dish_id uuid,
  dish_name text not null,
  emoji text,
  mode text not null default 'portion',
  servings numeric not null default 1,
  grams integer,
  kcal integer not null default 0,
  operator_id uuid,
  note text,
  created_at timestamptz not null default now()
);
alter table public.meals enable row level security;

drop policy if exists "房间成员可读取进食记录" on public.meals;
create policy "房间成员可读取进食记录"
  on public.meals for select
  to authenticated
  using (public.is_room_member(room_id));

drop policy if exists "房间成员可新增进食记录" on public.meals;
create policy "房间成员可新增进食记录"
  on public.meals for insert
  to authenticated
  with check (public.is_room_member(room_id));

drop policy if exists "房间成员可更新进食记录" on public.meals;
create policy "房间成员可更新进食记录"
  on public.meals for update
  to authenticated
  using (public.is_room_member(room_id))
  with check (public.is_room_member(room_id));

drop policy if exists "房间成员可删除进食记录" on public.meals;
create policy "房间成员可删除进食记录"
  on public.meals for delete
  to authenticated
  using (public.is_room_member(room_id));

-- ---------- 抽签历史（可选） ----------
create table if not exists public.spins (
  id uuid primary key,
  room_id uuid not null references public.rooms(id) on delete cascade,
  dish_id uuid,
  dish_name text not null,
  operator_id uuid,
  created_at timestamptz not null default now()
);
alter table public.spins enable row level security;

drop policy if exists "房间成员可读取抽签历史" on public.spins;
create policy "房间成员可读取抽签历史"
  on public.spins for select
  to authenticated
  using (public.is_room_member(room_id));

drop policy if exists "房间成员可新增抽签历史" on public.spins;
create policy "房间成员可新增抽签历史"
  on public.spins for insert
  to authenticated
  with check (public.is_room_member(room_id));

-- ---------- 开启实时订阅 ----------
-- Replica Identity Full：让 DELETE 实时事件携带完整旧行
alter table public.dishes replica identity full;
alter table public.meals replica identity full;
alter publication supabase_realtime add table public.dishes;
alter publication supabase_realtime add table public.meals;
alter publication supabase_realtime add table public.room_members;

-- ---------- 索引 ----------
create index if not exists idx_dishes_room on public.dishes(room_id);
create index if not exists idx_meals_room_date on public.meals(room_id, date);
create index if not exists idx_room_members_member on public.room_members(member_id);

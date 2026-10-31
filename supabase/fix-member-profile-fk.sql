-- ============================================================================
-- 修复：room_members 与 profiles 的关联关系
-- 问题：room_members.member_id 原本只引用 auth.users，PostgREST 无法推断它与
-- profiles 的关联，导致应用内 .select('..., profiles(...)') 报错：
--   "Could not find a relationship between 'room_members' and 'profiles'"
-- 方案：补一个指向 profiles 的外键（member_id 的取值与 profiles.id 完全一致），
-- 然后通知 PostgREST 重新加载 schema cache。可重复执行。
-- ============================================================================

alter table public.room_members
  drop constraint if exists room_members_member_profile_fkey;

alter table public.room_members
  add constraint room_members_member_profile_fkey
  foreign key (member_id) references public.profiles(id) on delete cascade;

-- 通知 PostgREST 重新加载结构缓存
notify pgrst, 'reload schema';

-- Public chat must use the server function. No client read/write access to quota data.
create table if not exists public.heyrin_chat_quota (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists heyrin_chat_quota_recent_idx
  on public.heyrin_chat_quota (ip_hash, created_at desc);
alter table public.heyrin_chat_quota enable row level security;
revoke all on public.heyrin_chat_quota from public, anon, authenticated;

-- Single transaction, keyed advisory lock: simultaneous requests cannot bypass the hourly cap.
create or replace function public.heyrin_chat_claim_quota(p_ip_hash text, p_limit integer default 8, p_daily_limit integer default 100)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare recent_count integer;
declare daily_count integer;
begin
  if length(p_ip_hash) <> 64 or p_limit < 1 or p_limit > 20 or p_daily_limit < 1 or p_daily_limit > 100 then return false; end if;
  -- Serialize all quota claims on the global daily key before taking the per-IP lock.
  -- This prevents rotating IPs from creating unbounded paid AI requests.
  perform pg_advisory_xact_lock(862810420261118::bigint);
  perform pg_advisory_xact_lock(hashtext(p_ip_hash));
  select count(*) into daily_count
    from public.heyrin_chat_quota
    where created_at >= now() - interval '1 day';
  if daily_count >= p_daily_limit then return false; end if;
  select count(*) into recent_count
    from public.heyrin_chat_quota
    where ip_hash = p_ip_hash and created_at >= now() - interval '1 hour';
  if recent_count >= p_limit then return false; end if;
  insert into public.heyrin_chat_quota (ip_hash) values (p_ip_hash);
  return true;
end;
$$;
revoke all on function public.heyrin_chat_claim_quota(text, integer, integer) from public, anon, authenticated;
grant execute on function public.heyrin_chat_claim_quota(text, integer, integer) to service_role;

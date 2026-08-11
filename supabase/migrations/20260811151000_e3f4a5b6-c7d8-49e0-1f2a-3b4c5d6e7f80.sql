-- Lead notification — fire the notify-lead edge function on every leads insert.
--
-- Leads were landing in the table with nothing alerting anyone, so inbound sales
-- enquiries could sit unseen. This AFTER INSERT trigger calls the notify-lead
-- edge function via pg_net, server-side, so a notification goes out regardless
-- of what the browser does after submit.
--
-- IMPORTANT: the trigger is exception-safe. Any failure (pg_net missing, settings
-- unset, network error) is swallowed so the lead INSERT always commits — a missed
-- notification must never cost us the lead.
--
-- One-time configuration (run once, out of version control so the secret isn't
-- committed; replace <PROJECT_REF> and <SECRET>):
--   alter database postgres set app.notify_lead_url =
--     'https://<PROJECT_REF>.functions.supabase.co/notify-lead';
--   alter database postgres set app.notify_lead_secret = '<SECRET>';
-- and set the matching NOTIFY_LEAD_SECRET (plus a delivery channel) as edge
-- function secrets. Until app.notify_lead_url is set, the trigger no-ops.

create extension if not exists pg_net;

create or replace function public.notify_lead_created()
returns trigger
language plpgsql
security definer
set search_path = public, net, extensions
as $$
declare
  fn_url text := current_setting('app.notify_lead_url', true);
  fn_secret text := current_setting('app.notify_lead_secret', true);
begin
  if fn_url is null or fn_url = '' then
    return new;  -- not configured yet; do nothing
  end if;

  perform net.http_post(
    url := fn_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-notify-secret', coalesce(fn_secret, '')
    ),
    body := jsonb_build_object('leadId', new.id)
  );
  return new;
exception
  when others then
    -- Never let a notification problem roll back the lead insert.
    raise warning 'notify_lead_created failed: %', sqlerrm;
    return new;
end;
$$;

drop trigger if exists trg_notify_lead_created on public.leads;
create trigger trg_notify_lead_created
  after insert on public.leads
  for each row execute function public.notify_lead_created();

-- Keep the helper callable only by the table owner via the trigger.
revoke execute on function public.notify_lead_created() from public, anon, authenticated;

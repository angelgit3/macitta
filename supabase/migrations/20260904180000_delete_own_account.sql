-- ─── Baja de cuenta (Derecho ARCO de cancelación / LFPDPPP) ───────────
-- RPC que permite al usuario autenticado eliminar su propia cuenta y
-- todos sus datos personales en una sola operación atómica.
--
-- Cobertura de datos:
--   · public.decks.author_id NO tiene ON DELETE CASCADE → se borra
--     explícitamente primero (cards, card_slots y study_sessions cuelgan
--     de decks con CASCADE).
--   · El resto de las tablas de usuario (profiles, user_progress,
--     user_items, srem_inbox, study_logs, study_sessions, attempts de
--     TOEFL/grammar/reading/listening, feedback, etc.) referencian
--     auth.users(id) o profiles(id) con ON DELETE CASCADE y se eliminan
--     solas al borrar la fila de auth.users.
--
-- Seguridad: security definer (solo postgres puede escribir en
-- auth.users), pero la función SIEMPRE opera sobre auth.uid(): un
-- usuario solo puede borrarse a sí mismo. Solo rol `authenticated`.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'No autenticado';
  end if;

  -- decks.author_id no cascades; must go first (cards/card_slots/
  -- study_sessions hang off decks with ON DELETE CASCADE).
  delete from public.decks where author_id = uid;

  -- Everything else cascades from auth.users / profiles.
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public;
revoke all on function public.delete_own_account() from anon;
grant execute on function public.delete_own_account() to authenticated;

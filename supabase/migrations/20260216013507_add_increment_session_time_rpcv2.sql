-- RPC to increment session time safely
CREATE OR REPLACE FUNCTION public.increment_session_time(s_id UUID, time_ms INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.study_sessions
    SET total_time_ms = total_time_ms + time_ms
    WHERE id = s_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
;


-- Create a function to clean up empty watch parties
CREATE OR REPLACE FUNCTION public.cleanup_empty_watch_party()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  active_count integer;
BEGIN
  -- Count remaining active participants
  SELECT COUNT(*) INTO active_count
  FROM public.watch_party_participants
  WHERE party_id = OLD.party_id AND is_active = true AND id != OLD.id;

  -- If no active participants left, deactivate the party
  IF active_count = 0 THEN
    UPDATE public.watch_parties
    SET is_active = false, ended_at = now()
    WHERE id = OLD.party_id;
  END IF;

  RETURN OLD;
END;
$$;

-- Trigger when a participant leaves (deleted) or set inactive
CREATE TRIGGER on_participant_leave
AFTER DELETE ON public.watch_party_participants
FOR EACH ROW
EXECUTE FUNCTION public.cleanup_empty_watch_party();

CREATE TRIGGER on_participant_inactive
AFTER UPDATE OF is_active ON public.watch_party_participants
FOR EACH ROW
WHEN (NEW.is_active = false)
EXECUTE FUNCTION public.cleanup_empty_watch_party();

-- Add unique constraint for upsert support
ALTER TABLE public.watch_party_participants 
ADD CONSTRAINT watch_party_participants_party_user_unique UNIQUE (party_id, user_id);

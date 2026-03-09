
-- Recreate the cleanup trigger function
CREATE OR REPLACE FUNCTION public.cleanup_empty_watch_party()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  active_count integer;
  target_party_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_party_id := OLD.party_id;
  ELSE
    IF NEW.is_active = false AND (OLD.is_active = true OR OLD.is_active IS NULL) THEN
      target_party_id := NEW.party_id;
    ELSE
      RETURN NEW;
    END IF;
  END IF;

  SELECT COUNT(*) INTO active_count
  FROM public.watch_party_participants
  WHERE party_id = target_party_id AND is_active = true;

  IF active_count = 0 THEN
    UPDATE public.watch_parties
    SET is_active = false, ended_at = now()
    WHERE id = target_party_id AND is_active = true;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing triggers if any
DROP TRIGGER IF EXISTS on_participant_leave ON public.watch_party_participants;
DROP TRIGGER IF EXISTS on_participant_delete ON public.watch_party_participants;

-- Create triggers
CREATE TRIGGER on_participant_leave
  AFTER UPDATE OF is_active ON public.watch_party_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_empty_watch_party();

CREATE TRIGGER on_participant_delete
  AFTER DELETE ON public.watch_party_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_empty_watch_party();

-- Enable realtime for participants
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'watch_party_participants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_party_participants;
  END IF;
END $$;

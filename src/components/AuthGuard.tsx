import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const PUBLIC_ROUTES = ["/", "/auth", "/banned", "/terms", "/privacy", "/cookies", "/dmca", "/changelog"];

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const isPublic = PUBLIC_ROUTES.includes(location.pathname);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthed(true);
      } else if (!isPublic) {
        navigate("/", { replace: true });
        return;
      }
      setChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setAuthed(true);
      } else {
        setAuthed(false);
        if (!PUBLIC_ROUTES.includes(location.pathname)) {
          navigate("/", { replace: true });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [location.pathname, navigate]);

  const isPublic = PUBLIC_ROUTES.includes(location.pathname);
  
  if (!checked && !isPublic) return null;
  if (!authed && !isPublic) return null;

  return <>{children}</>;
};

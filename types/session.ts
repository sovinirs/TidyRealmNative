import { Session } from "@supabase/supabase-js";

export interface SessionState {
  session: Session | null;
  loading: boolean;
  fetchSession: () => Promise<void>;
  setSession: (session: Session | null) => void;
}

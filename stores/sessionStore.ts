import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { SessionState } from "@/types/session";

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  loading: false,

  setSession: (session: Session | null) => set({ session }),

  fetchSession: async () => {
    const { data } = await supabase.auth.getSession();
    set({ session: data.session, loading: false });
  },
}));

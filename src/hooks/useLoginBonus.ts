import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LoginBonusResult {
  coins_earned: number;
  current_streak: number;
  is_new_day: boolean;
}

interface LoginStreak {
  last_login_date: string;
  current_streak: number;
  login_history: any;
}

export const useLoginBonus = () => {
  const queryClient = useQueryClient();

  const claimBonus = useMutation({
    mutationFn: async (): Promise<LoginBonusResult> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.rpc("claim_daily_login_bonus", {
        p_user_id: user.id,
      });

      if (error) throw error;
      return data[0] as LoginBonusResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["login-streak"] });
      queryClient.invalidateQueries({ queryKey: ["user-currency"] });
      queryClient.invalidateQueries({ queryKey: ["character-affection"] });
    },
  });

  const { data: streak } = useQuery({
    queryKey: ["login-streak"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("login_streaks")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as LoginStreak | null;
    },
  });

  return {
    claimBonus,
    streak,
  };
};

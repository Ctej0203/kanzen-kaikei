import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RecordStreak {
  last_record_date: string;
  current_streak: number;
  record_history: any;
}

export const useRecordStreak = () => {
  const { data: streak, refetch } = useQuery({
    queryKey: ["record-streak"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("record_streaks")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as RecordStreak | null;
    },
  });

  return {
    streak,
    refetch,
  };
};

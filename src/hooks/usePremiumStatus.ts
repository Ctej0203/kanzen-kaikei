import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePremiumStatus = () => {
  const { data: subscription, isLoading } = useQuery({
    queryKey: ["premium-status"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  return {
    isPremium: !!subscription,
    plan: subscription?.plan,
    periodEnd: subscription?.current_period_end,
    isLoading,
  };
};

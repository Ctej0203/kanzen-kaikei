import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCoins = () => {
  const { data: currency, isLoading } = useQuery({
    queryKey: ["user-currency"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_currency")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  return {
    totalCoins: (currency?.free_coins || 0) + (currency?.paid_coins || 0),
    freeCoins: currency?.free_coins || 0,
    paidCoins: currency?.paid_coins || 0,
    isLoading,
  };
};

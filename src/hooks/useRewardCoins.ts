import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RewardCoinsParams {
  amount: number;
  source: string;
}

export const useRewardCoins = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, source }: RewardCoinsParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.rpc("add_coins", {
        p_user_id: user.id,
        p_amount: amount,
        p_source: source,
      });

      if (error) throw error;
      return { amount };
    },
    onSuccess: ({ amount }) => {
      queryClient.invalidateQueries({ queryKey: ["user-currency"] });
      toast.success(`+${amount}コイン獲得！`, {
        description: "がんばりました！",
      });
    },
    onError: (error) => {
      toast.error("エラーが発生しました", {
        description: error.message,
      });
    },
  });
};

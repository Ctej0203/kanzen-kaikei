import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SpendCoinsParams {
  amount: number;
  source: string;
}

export const useSpendCoins = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, source }: SpendCoinsParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.rpc("spend_coins", {
        p_user_id: user.id,
        p_amount: amount,
        p_source: source,
      });

      if (error) {
        if (error.message.includes("Insufficient coins")) {
          throw new Error("コインが足りません");
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-currency"] });
    },
    onError: (error) => {
      toast.error("エラーが発生しました", {
        description: error.message,
      });
    },
  });
};

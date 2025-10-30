import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GachaResult {
  item_id: string;
  rarity: string;
  is_new: boolean;
}

export const useGacha = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rollCount: 1 | 11) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.rpc("perform_gacha", {
        p_user_id: user.id,
        p_roll_count: rollCount,
      });

      if (error) {
        if (error.message.includes("Insufficient coins")) {
          throw new Error("コインが足りません");
        }
        throw error;
      }

      return data as GachaResult[];
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["user-currency"] });
      queryClient.invalidateQueries({ queryKey: ["user-items"] });
      queryClient.invalidateQueries({ queryKey: ["gacha-pity"] });

      const newItemsCount = results.filter((r) => r.is_new).length;
      toast.success(`${results.length}個のアイテムを獲得！`, {
        description: newItemsCount > 0 ? `新アイテム: ${newItemsCount}個` : "すべて重複でした",
      });
    },
    onError: (error) => {
      toast.error("エラーが発生しました", {
        description: error.message,
      });
    },
  });
};

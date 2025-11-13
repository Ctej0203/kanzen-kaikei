import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CharacterId } from "@/lib/characterData";
import { toast } from "sonner";

interface AffectionData {
  cura: number;
  suu: number;
  luno: number;
}

export const useCharacterAffection = () => {
  const queryClient = useQueryClient();

  const { data: affectionData, isLoading } = useQuery({
    queryKey: ["character-affection"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("character_affection")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      
      const affection = data?.character_affection;
      if (!affection || typeof affection !== 'object' || Array.isArray(affection)) {
        return { cura: 0, suu: 0, luno: 0 };
      }
      
      const affectionObj = affection as Record<string, any>;
      return {
        cura: Number(affectionObj.cura) || 0,
        suu: Number(affectionObj.suu) || 0,
        luno: Number(affectionObj.luno) || 0,
      };
    },
  });

  const increaseAffection = useMutation({
    mutationFn: async ({ characterId, amount = 1 }: { characterId: CharacterId; amount?: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.rpc("increase_character_affection", {
        p_user_id: user.id,
        p_character_id: characterId,
        p_amount: amount,
      });

      if (error) throw error;
      return data[0];
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["character-affection"] });
      
      if (result.coins_awarded > 0) {
        queryClient.invalidateQueries({ queryKey: ["user-currency"] });
        toast.success(`好感度レベル${result.threshold_reached}達成！`, {
          description: `+${result.coins_awarded}コインを獲得しました！`,
          duration: 3000,
        });
      }

      return result;
    },
  });

  const getAffectionLevel = (characterId: CharacterId): number => {
    return affectionData?.[characterId] || 0;
  };

  const getAffectionThreshold = (affection: number): number => {
    return Math.floor(affection / 10) * 10;
  };

  const getProgressToNextThreshold = (affection: number): number => {
    return affection % 10;
  };

  return {
    affectionData,
    isLoading,
    increaseAffection,
    getAffectionLevel,
    getAffectionThreshold,
    getProgressToNextThreshold,
  };
};

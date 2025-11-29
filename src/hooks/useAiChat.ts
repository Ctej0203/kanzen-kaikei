import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCharacter } from "./useCharacter";

interface AiChatResponse {
  response: string;
  hasCrisis: boolean;
  tokensUsed?: number;
}

export const useAiChat = () => {
  const queryClient = useQueryClient();
  const { selectedCharacter } = useCharacter();

  return useMutation({
    mutationFn: async (message: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { 
          message, 
          user_id: user.id,
          character_id: selectedCharacter.id,
        },
      });

      if (error) throw error;
      return data as AiChatResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
      queryClient.invalidateQueries({ queryKey: ["ai-quota"] });
    },
    onError: (error: any) => {
      if (error.message?.includes("429") || error.message?.includes("QUOTA_EXCEEDED")) {
        toast.error("本日の無料会話数が上限に達しました", {
          description: "明日リセットされます。プレミアムプランで無制限に会話できます",
        });
      } else {
        toast.error("エラーが発生しました", {
          description: error.message,
        });
      }
    },
  });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AiChatResponse {
  response: string;
  hasCrisis: boolean;
  tokensUsed?: number;
}

export const useAiChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { message, user_id: user.id },
      });

      if (error) throw error;
      return data as AiChatResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
      queryClient.invalidateQueries({ queryKey: ["ai-quota"] });
    },
    onError: (error: any) => {
      if (error.message?.includes("429")) {
        toast.error("メッセージ上限に達しました", {
          description: "プレミアムプランで無制限に利用できます",
        });
      } else {
        toast.error("エラーが発生しました", {
          description: error.message,
        });
      }
    },
  });
};

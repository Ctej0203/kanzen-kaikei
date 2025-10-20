import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  message: string;
  category: string;
}

export const HomehomeCard = () => {
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchRandomMessage = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("homehome_messages")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const randomMessage = data[Math.floor(Math.random() * data.length)];
        setCurrentMessage(randomMessage);
        await checkIfFavorite(randomMessage.id);
      }
    } catch (error: any) {
      console.error("Error fetching message:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async (messageId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("favorite_messages")
        .select("id")
        .eq("user_id", user.id)
        .eq("message_id", messageId)
        .maybeSingle();

      if (error) throw error;
      setIsFavorite(!!data);
    } catch (error: any) {
      console.error("Error checking favorite:", error);
    }
  };

  const toggleFavorite = async () => {
    if (!currentMessage) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("ログインが必要です");

      if (isFavorite) {
        const { error } = await supabase
          .from("favorite_messages")
          .delete()
          .eq("user_id", user.id)
          .eq("message_id", currentMessage.id);

        if (error) throw error;
        setIsFavorite(false);
        toast({
          title: "お気に入りから削除しました",
        });
      } else {
        const { error } = await supabase
          .from("favorite_messages")
          .insert({
            user_id: user.id,
            message_id: currentMessage.id,
          });

        if (error) throw error;
        setIsFavorite(true);
        toast({
          title: "お気に入りに追加しました",
        });
      }
    } catch (error: any) {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchRandomMessage();
  }, []);

  return (
    <Card className="w-full bg-gradient-to-br from-accent/10 to-primary/10">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">今日のほめほめ</h3>
            {currentMessage && (
              <p className="text-xl font-medium leading-relaxed">
                {currentMessage.message}
              </p>
            )}
          </div>
          
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFavorite}
              disabled={!currentMessage}
            >
              <Heart
                className={`h-5 w-5 ${isFavorite ? "fill-current text-destructive" : ""}`}
              />
            </Button>
            <Button
              onClick={fetchRandomMessage}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              次のメッセージ
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
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
    <Card className="w-full gradient-calm shadow-lg hover:shadow-xl transition-all hover-lift border-2 border-primary/20">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
              <span className="text-3xl animate-wiggle">💖</span>
              今日のほめほめ
              <span className="text-3xl animate-wiggle">💖</span>
            </h3>
            {currentMessage && (
              <p className="text-2xl font-bold leading-relaxed text-white drop-shadow-lg">
                {currentMessage.message}
              </p>
            )}
          </div>
          
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFavorite}
              disabled={!currentMessage}
              className="hover-lift shadow-md hover:shadow-lg transition-all bg-white/80 backdrop-blur-sm border-2"
            >
              <Heart
                className={`h-6 w-6 transition-all ${isFavorite ? "fill-current text-destructive scale-110" : ""}`}
              />
            </Button>
            <Button
              onClick={fetchRandomMessage}
              disabled={loading}
              className="shadow-lg hover:shadow-xl transition-all hover-lift font-bold bg-white/90 text-primary hover:bg-white"
            >
              <RefreshCw className={`mr-2 h-5 w-5 ${loading ? "animate-spin" : ""}`} />
              次のメッセージ
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
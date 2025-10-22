import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import curaCharacter from "@/assets/cura-character.png";
import curaHappy from "@/assets/cura-happy.png";
import curaGentle from "@/assets/cura-gentle.png";
import curaEnergetic from "@/assets/cura-energetic.png";

interface Message {
  id: string;
  message: string;
  category: string;
}

const HomehomeMessages = () => {
  const navigate = useNavigate();
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [characterImage, setCharacterImage] = useState(curaCharacter);

  const getCharacterImage = () => {
    const expressions = [curaHappy, curaGentle, curaEnergetic];
    return expressions[Math.floor(Math.random() * expressions.length)];
  };

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
        setCharacterImage(getCharacterImage());
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
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <header className="border-b bg-card/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="hover-lift hover:bg-secondary/50 hover:text-primary transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              💖 今日のほめほめ
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* キャラクター表示 */}
          <div className="flex justify-center">
            <img 
              src={characterImage} 
              alt="Cura" 
              className="w-48 h-48 md:w-64 md:h-64 animate-bounce-soft"
            />
          </div>

          {/* 吹き出し風メッセージカード */}
          <div className="relative">
            {/* 吹き出しの三角形 */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[20px] border-b-primary/20"></div>
            
            <Card className="w-full gradient-calm shadow-xl hover:shadow-2xl transition-all border-2 border-primary/20">
              <CardContent className="pt-8 pb-8">
                <div className="space-y-6">
                  <div className="text-center min-h-[200px] flex flex-col justify-center">
                    {currentMessage && (
                      <p className="text-3xl md:text-4xl font-bold leading-relaxed text-white drop-shadow-lg px-4">
                        {currentMessage.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={toggleFavorite}
                      disabled={!currentMessage}
                      className="hover-lift shadow-md hover:shadow-lg transition-all bg-white/80 backdrop-blur-sm border-2"
                    >
                      <Heart
                        className={`h-6 w-6 mr-2 transition-all ${isFavorite ? "fill-current text-destructive scale-110" : ""}`}
                      />
                      お気に入り
                    </Button>
                    <Button
                      size="lg"
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomehomeMessages;

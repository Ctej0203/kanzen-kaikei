import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAiChat } from "@/hooks/useAiChat";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { CrisisDialog } from "@/components/CrisisDialog";
import { PremiumBadge } from "@/components/PremiumBadge";
import { AffectionDisplay } from "@/components/AffectionDisplay";
import { AffectionIncreaseAnimation } from "@/components/AffectionIncreaseAnimation";
import { AffectionLevelUpDialog } from "@/components/AffectionLevelUpDialog";
import { useCharacter } from "@/hooks/useCharacter";
import { useCharacterAffection } from "@/hooks/useCharacterAffection";
import { MessageCircle, Send, Loader2, Home } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AiChat() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showCrisisDialog, setShowCrisisDialog] = useState(false);
  const [showAffectionAnimation, setShowAffectionAnimation] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState<{ level: number; message: string } | null>(null);
  
  const aiChatMutation = useAiChat();
  const { isPremium } = usePremiumStatus();
  const { selectedCharacter } = useCharacter();
  const { increaseAffection, getAffectionLevel } = useCharacterAffection();

  // 会話数をカウント
  const { data: conversationCount } = useQuery({
    queryKey: ["ai-conversation-count"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from("ai_conversations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (error) throw error;
      return count || 0;
    },
  });

  const { data: conversations } = useQuery({
    queryKey: ["ai-conversations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  const handleSend = async () => {
    if (!input.trim() || aiChatMutation.isPending) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      const result = await aiChatMutation.mutateAsync(input);
      
      const assistantMessage: Message = {
        role: "assistant",
        content: result.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (result.hasCrisis) {
        setShowCrisisDialog(true);
      }

      // 会話後に好感度を増やす（1日1回のみ）
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("last_chat_affection_date")
          .eq("user_id", user.id)
          .single();

        const today = new Date().toISOString().split('T')[0];
        const lastChatDate = profile?.last_chat_affection_date;

        // 今日初めてのチャットの場合のみ好感度を増やす
        if (!lastChatDate || lastChatDate !== today) {
          const currentLevel = getAffectionLevel(selectedCharacter.id);
          const currentThreshold = Math.floor(currentLevel / 10) * 10;
          
          setShowAffectionAnimation(true);
          
          await increaseAffection.mutateAsync(
            { characterId: selectedCharacter.id, amount: 1 },
            {
              onSuccess: (result) => {
                // レベルアップ（10の倍数到達）を検知
                if (result.threshold_reached > currentThreshold) {
                  const levelUpMessage = selectedCharacter.levelUpMessages[result.threshold_reached];
                  if (levelUpMessage) {
                    setLevelUpInfo({
                      level: result.threshold_reached,
                      message: levelUpMessage,
                    });
                  }
                }
              },
            }
          );

          // last_chat_affection_dateを更新
          await supabase
            .from("profiles")
            .update({ last_chat_affection_date: today })
            .eq("user_id", user.id);
        }
      }
    } catch (error) {
      // エラーは useAiChat フックでトーストで表示される
    }
  };

  const remainingMessages = isPremium ? null : Math.max(0, 10 - (conversationCount || 0));

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="hover:bg-secondary/50"
        >
          <Home className="h-5 w-5" />
        </Button>
        {isPremium && <PremiumBadge />}
      </div>

      <AffectionDisplay />

      {/* ヘッダー */}
      <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img 
              src={selectedCharacter.image} 
              alt={selectedCharacter.name} 
              className="w-16 h-16 rounded-full object-cover" 
            />
            <div className="text-left">
              <h1 className="text-3xl font-bold text-primary">{selectedCharacter.name}とおしゃべり</h1>
              <p className="text-muted-foreground">{selectedCharacter.description}</p>
            </div>
          </div>

          {/* メッセージ残数表示 */}
          {!isPremium && (
            <div className="mt-4">
              <Card className="p-3 bg-purple-50 border-purple-200">
                <p className="text-sm text-purple-900">
                  残りレスポンス数: <span className="font-bold text-lg">{remainingMessages}</span> / 10
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  <PremiumBadge /> で無制限に利用できます
                </p>
              </Card>
            </div>
          )}
        </div>

        {/* チャットエリア */}
        <Card className="mb-4 bg-white/80 backdrop-blur">
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                <div>
                  <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">{selectedCharacter.name}にメッセージを送ってみましょう</p>
                  <p className="text-sm mt-2">あなたの気持ちを聞かせてください</p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-1">
                        <img 
                          src={selectedCharacter.image} 
                          alt={selectedCharacter.name} 
                          className="w-6 h-6 rounded-full object-cover" 
                        />
                        <span className="text-xs font-semibold text-primary">{selectedCharacter.name}</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}>
                      {format(message.timestamp, "HH:mm")}
                    </p>
                  </div>
                </div>
              ))
            )}

            {aiChatMutation.isPending && (
              <div className="flex justify-start">
                <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-muted">
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} />
                    <span className="text-sm">{selectedCharacter.name}が考えています...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 入力エリア */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder="メッセージを入力..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                disabled={aiChatMutation.isPending || (!isPremium && remainingMessages === 0)}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || aiChatMutation.isPending || (!isPremium && remainingMessages === 0)}
                size="icon"
              >
                <Send size={20} />
              </Button>
            </div>
          </div>
        </Card>

        {/* 会話履歴 */}
        {conversations && conversations.length > 0 && (
          <Card className="p-6 bg-white/80 backdrop-blur">
            <h3 className="font-semibold mb-4">最近の会話</h3>
            <div className="space-y-3">
              {conversations.map((conv) => (
                <div key={conv.id} className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">{conv.message.substring(0, 50)}...</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(conv.created_at), "M月d日 HH:mm", { locale: ja })}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <CrisisDialog open={showCrisisDialog} onOpenChange={setShowCrisisDialog} />
      
      {showAffectionAnimation && (
        <AffectionIncreaseAnimation 
          amount={1} 
          onComplete={() => setShowAffectionAnimation(false)} 
        />
      )}
      
      {levelUpInfo && (
        <AffectionLevelUpDialog
          character={selectedCharacter}
          level={levelUpInfo.level}
          message={levelUpInfo.message}
          open={!!levelUpInfo}
          onOpenChange={(open) => !open && setLevelUpInfo(null)}
        />
      )}
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAiChat } from "@/hooks/useAiChat";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { CrisisDialog } from "@/components/CrisisDialog";
import { PremiumBadge } from "@/components/PremiumBadge";
import { AffectionIncreaseAnimation } from "@/components/AffectionIncreaseAnimation";
import { AffectionLevelUpDialog } from "@/components/AffectionLevelUpDialog";
import { useCharacter } from "@/hooks/useCharacter";
import { useCharacterAffection } from "@/hooks/useCharacterAffection";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { MessageCircle, Send, Loader2, Mic, MicOff } from "lucide-react";
import { format } from "date-fns";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ChatSection() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showCrisisDialog, setShowCrisisDialog] = useState(false);
  const [showAffectionAnimation, setShowAffectionAnimation] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState<{ level: number; message: string } | null>(null);
  
  const aiChatMutation = useAiChat();
  const { isPremium } = usePremiumStatus();
  const { selectedCharacter } = useCharacter();
  const { increaseAffection, getAffectionLevel } = useCharacterAffection();
  const { isRecording, isProcessing, startRecording, stopRecording } = useVoiceRecording();

  const handleVoiceInput = async () => {
    if (isRecording) {
      try {
        const text = await stopRecording();
        setInput(prev => prev ? `${prev} ${text}` : text);
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    } else {
      await startRecording();
    }
  };

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

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("last_chat_affection_date")
          .eq("user_id", user.id)
          .single();

        const today = new Date().toISOString().split('T')[0];
        const lastChatDate = profile?.last_chat_affection_date;

        if (!lastChatDate || lastChatDate !== today) {
          const currentLevel = getAffectionLevel(selectedCharacter.id);
          const currentThreshold = Math.floor(currentLevel / 10) * 10;
          
          setShowAffectionAnimation(true);
          
          await increaseAffection.mutateAsync(
            { characterId: selectedCharacter.id, amount: 1 },
            {
              onSuccess: (result) => {
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
    <>
      <Card className="bg-white/80 backdrop-blur border-primary/20">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <img 
              src={selectedCharacter.image} 
              alt={selectedCharacter.name} 
              className="w-12 h-12 rounded-full object-cover" 
            />
            <div>
              <h2 className="text-xl font-bold text-primary">{selectedCharacter.name}とおしゃべり</h2>
              <p className="text-sm text-muted-foreground">{selectedCharacter.description}</p>
            </div>
          </div>
          
          {!isPremium && (
            <div className="mt-3">
              <Card className="p-2 bg-purple-50 border-purple-200">
                <p className="text-sm text-purple-900">
                  残りレスポンス数: <span className="font-bold">{remainingMessages}</span> / 10
                  <span className="text-xs text-purple-700 ml-2">
                    <PremiumBadge /> で無制限
                  </span>
                </p>
              </Card>
            </div>
          )}
        </div>

        <div className="h-[300px] overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center text-muted-foreground">
              <div>
                <MessageCircle size={40} className="mx-auto mb-3 opacity-50" />
                <p>{selectedCharacter.name}にメッセージを送ってみましょう</p>
                <p className="text-sm mt-1">あなたの気持ちを聞かせてください</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
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
                        className="w-5 h-5 rounded-full object-cover" 
                      />
                      <span className="text-xs font-semibold text-primary">{selectedCharacter.name}</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
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
              <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-muted">
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={14} />
                  <span className="text-sm">{selectedCharacter.name}が考えています...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-3">
          <div className="flex gap-2">
            <Input
              placeholder="メッセージを入力..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              disabled={aiChatMutation.isPending || (!isPremium && remainingMessages === 0) || isProcessing}
              className="flex-1"
            />
            <Button
              onClick={handleVoiceInput}
              disabled={aiChatMutation.isPending || (!isPremium && remainingMessages === 0)}
              size="icon"
              variant={isRecording ? "destructive" : "secondary"}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isRecording ? (
                <MicOff size={18} />
              ) : (
                <Mic size={18} />
              )}
            </Button>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || aiChatMutation.isPending || (!isPremium && remainingMessages === 0)}
              size="icon"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </Card>

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
    </>
  );
}

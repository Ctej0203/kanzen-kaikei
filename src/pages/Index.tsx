import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { HomehomeCard } from "@/components/HomehomeCard";
import { MoodLogger } from "@/components/MoodLogger";
import { MentalScoreDisplay } from "@/components/MentalScoreDisplay";
import { LogOut, Settings, FileText, Heart, Video, Wind } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { CoinBalance } from "@/components/CoinBalance";
import { LoginBonusPopup } from "@/components/LoginBonusPopup";
import { UnifiedCalendar } from "@/components/UnifiedCalendar";
import { useLoginBonus } from "@/hooks/useLoginBonus";
import { Calendar } from "lucide-react";
import { useCharacter } from "@/hooks/useCharacter";
import { AffectionDisplay } from "@/components/AffectionDisplay";
import { AffectionIncreaseAnimation } from "@/components/AffectionIncreaseAnimation";
import { useCharacterAffection } from "@/hooks/useCharacterAffection";
import curaDoctor from "@/assets/cura-doctor.png";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bonusData, setBonusData] = useState<{
    coins: number;
    streak: number;
  } | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarTab, setCalendarTab] = useState<"login" | "record">("login");
  const [shouldShowLoginCalendar, setShouldShowLoginCalendar] = useState(false);
  const [showAffectionAnimation, setShowAffectionAnimation] = useState(false);
  const { claimBonus } = useLoginBonus();
  const { selectedCharacter } = useCharacter();
  const { increaseAffection } = useCharacterAffection();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      setProfile(profileData);

      if (profileData && !profileData.onboarding_completed) {
        navigate("/onboarding");
      } else {
        // ログインボーナスをチェック
        try {
          const result = await claimBonus.mutateAsync();
          if (result.is_new_day && result.coins_earned > 0) {
            setBonusData({
              coins: result.coins_earned,
              streak: result.current_streak,
            });
            setShouldShowLoginCalendar(true);

            // Increase affection for current character
            const { data: profile } = await supabase
              .from("profiles")
              .select("selected_character")
              .eq("user_id", session.user.id)
              .single();

            if (profile?.selected_character) {
              await increaseAffection.mutateAsync({
                characterId: profile.selected_character as any,
                amount: 1,
              });
              setShowAffectionAnimation(true);
            }
          }
        } catch (error) {
          console.error("Login bonus error:", error);
        }
      }

      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "ログアウトしました",
    });
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-lg">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {showAffectionAnimation && (
        <AffectionIncreaseAnimation
          amount={1}
          onComplete={() => setShowAffectionAnimation(false)}
        />
      )}

      {bonusData && (
        <LoginBonusPopup
          coinsEarned={bonusData.coins}
          streak={bonusData.streak}
          onClose={() => {
            setBonusData(null);
            if (shouldShowLoginCalendar) {
              setCalendarTab("login");
              setShowCalendar(true);
              setShouldShowLoginCalendar(false);
            }
          }}
        />
      )}

      <UnifiedCalendar 
        open={showCalendar} 
        onOpenChange={setShowCalendar}
        defaultTab={calendarTab}
      />

      <header className="border-b bg-card/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-card border-2 border-primary/20 shadow-sm transition-all hover:scale-110 hover:shadow-md">
                <img
                  src={selectedCharacter.image}
                  alt={selectedCharacter.name}
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-wiggle">
                ✨ Curely
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <CoinBalance />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setCalendarTab("login");
                  setShowCalendar(true);
                }}
                className="hover-lift hover:bg-secondary/50 hover:text-primary transition-all"
                title="カレンダー"
              >
                <Calendar className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/mental-record")}
                className="hover-lift hover:bg-secondary/50 hover:text-primary transition-all"
                title="こころの記録"
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/breathing-guide")}
                className="hover-lift hover:bg-secondary/50 hover:text-primary transition-all"
                title="呼吸法ガイド"
              >
                <Wind className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/records")}
                className="hover-lift hover:bg-secondary/50 hover:text-primary transition-all"
              >
                <FileText className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/settings")}
                className="hover-lift hover:bg-secondary/50 hover:text-primary transition-all"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="hover-lift hover:bg-destructive/10 hover:text-destructive transition-all"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl pb-24">
        <div className="space-y-8">
          <section className="hover-lift">
            <AffectionDisplay />
          </section>

          <section className="hover-lift">
            <MentalScoreDisplay />
          </section>

          <section className="hover-lift">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-3xl">📝</span>
              今日の日記
            </h2>
            <MoodLogger />
          </section>

          <section className="hover-lift">
            <HomehomeCard />
          </section>

          <section 
            className="hover-lift cursor-pointer" 
            onClick={() => navigate("/online-consultation")}
          >
            <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-all hover:border-primary/40">
              <CardHeader className="p-8">
                <div className="flex items-center gap-4 justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Video className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">オンライン診療</CardTitle>
                      <CardDescription className="text-base">専門家にオンラインで相談できます</CardDescription>
                    </div>
                  </div>
                  <img 
                    src={curaDoctor} 
                    alt="Cura Doctor" 
                    className="w-64 h-64 object-contain flex-shrink-0"
                  />
                </div>
              </CardHeader>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;

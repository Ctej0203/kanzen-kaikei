import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { HomehomeCard } from "@/components/HomehomeCard";
import { MoodLogger } from "@/components/MoodLogger";
import { MentalScoreDisplay } from "@/components/MentalScoreDisplay";
import { LogOut, Settings, FileText, Heart, Video, Wind, ShoppingBag } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ChatSection } from "@/components/ChatSection";
import curaDoctor from "@/assets/cura-doctor.jpg";
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
  const [scoreRefreshTrigger, setScoreRefreshTrigger] = useState(0);
  const {
    claimBonus
  } = useLoginBonus();
  const {
    selectedCharacter
  } = useCharacter();
  const {
    increaseAffection
  } = useCharacterAffection();
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      const {
        data: profileData
      } = await supabase.from("profiles").select("*").eq("user_id", session.user.id).maybeSingle();
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
              streak: result.current_streak
            });
            setShouldShowLoginCalendar(true);
            setShowAffectionAnimation(true);
          }
        } catch (error) {
          console.error("Login bonus error:", error);
        }
      }
      setLoading(false);
    };
    checkAuth();
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
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
      title: "ログアウトしました"
    });
    navigate("/auth");
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-lg">読み込み中...</div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {showAffectionAnimation && <AffectionIncreaseAnimation amount={1} onComplete={() => setShowAffectionAnimation(false)} />}

      {bonusData && <LoginBonusPopup coinsEarned={bonusData.coins} streak={bonusData.streak} onClose={() => {
      setBonusData(null);
      if (shouldShowLoginCalendar) {
        setCalendarTab("login");
        setShowCalendar(true);
        setShouldShowLoginCalendar(false);
      }
    }} />}

      <UnifiedCalendar open={showCalendar} onOpenChange={setShowCalendar} defaultTab={calendarTab} />

      <header className="border-b bg-card/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-card border-2 border-primary/20 shadow-sm transition-all hover:scale-110 hover:shadow-md">
                <img src={selectedCharacter.image} alt={selectedCharacter.name} className="w-full h-full object-contain p-0.5 sm:p-1" />
              </div>
              <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-wiggle whitespace-nowrap">
                ✨ Curely
              </h1>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-2 flex-wrap justify-end">
              <div className="hidden xs:block">
                <CoinBalance />
              </div>
              <Button variant="ghost" size="icon" onClick={() => {
              setCalendarTab("login");
              setShowCalendar(true);
            }} className="hover-lift hover:bg-secondary/50 hover:text-primary transition-all h-8 w-8 sm:h-10 sm:w-10" title="カレンダー">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate("/mental-record")} className="hover-lift hover:bg-secondary/50 hover:text-primary transition-all h-8 w-8 sm:h-10 sm:w-10" title="こころの記録">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate("/breathing-guide")} className="hover-lift hover:bg-secondary/50 hover:text-primary transition-all h-8 w-8 sm:h-10 sm:w-10 hidden sm:flex" title="呼吸法ガイド">
                <Wind className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate("/records")} className="hover-lift hover:bg-secondary/50 hover:text-primary transition-all h-8 w-8 sm:h-10 sm:w-10 hidden sm:flex">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button
                variant="ghost" 
                size="icon" 
                onClick={() => window.open("https://curelyshop-fk6cmnpx.manus.space", "_blank")} 
                className="hover-lift hover:bg-secondary/50 hover:text-primary transition-all h-8 w-8 sm:h-10 sm:w-10" 
                title="ECサイト"
              >
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate("/settings")} className="hover-lift hover:bg-secondary/50 hover:text-primary transition-all h-8 w-8 sm:h-10 sm:w-10">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="hover-lift hover:bg-destructive/10 hover:text-destructive transition-all h-8 w-8 sm:h-10 sm:w-10">
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
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
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-3xl">💬</span>
              おしゃべり
            </h2>
            <ChatSection />
          </section>

          <section className="hover-lift">
            <MentalScoreDisplay refreshTrigger={scoreRefreshTrigger} />
          </section>

          <section className="hover-lift">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-3xl">📝</span>
              今日の日記
            </h2>
            <MoodLogger onRecordSuccess={() => setScoreRefreshTrigger(prev => prev + 1)} />
          </section>

          <section className="hover-lift cursor-pointer" onClick={() => navigate("/online-consultation")}>
            <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-all hover:border-primary/40">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4 justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Video className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-xl sm:text-2xl md:text-3xl">オンライン診療</CardTitle>
                      <CardDescription className="text-sm sm:text-base md:text-lg">専門家にオンラインで相談できます</CardDescription>
                    </div>
                  </div>
                  <img src={curaDoctor} alt="Cura Doctor" className="hidden lg:block w-48 h-48 xl:w-64 xl:h-64 object-contain flex-shrink-0" />
                </div>
              </CardHeader>
            </Card>
          </section>

          <section className="hover-lift">
            <HomehomeCard />
          </section>
        </div>
      </main>
    </div>;
};
export default Index;
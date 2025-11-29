import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CharacterProvider } from "@/contexts/CharacterContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Records from "./pages/Records";
import Settings from "./pages/Settings";
import TwoFactorSetup from "./pages/TwoFactorSetup";
import MentalConditions from "./pages/MentalConditions";
import HomehomeMessages from "./pages/HomehomeMessages";
import MentalRecord from "./pages/MentalRecord";
import Wardrobe from "./pages/Wardrobe";
import Coins from "./pages/Coins";
import Gacha from "./pages/Gacha";
import AiChat from "./pages/AiChat";
import Premium from "./pages/Premium";
import CharacterSelect from "./pages/CharacterSelect";
import OnlineConsultation from "./pages/OnlineConsultation";
import ConsultationBooking from "./pages/ConsultationBooking";
import ConsultationList from "./pages/ConsultationList";
import BreathingGuidePage from "./pages/BreathingGuidePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CharacterProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/records" element={<Records />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/2fa" element={<TwoFactorSetup />} />
            <Route path="/mental-conditions" element={<MentalConditions />} />
            <Route path="/homehome" element={<HomehomeMessages />} />
            <Route path="/mental-record" element={<MentalRecord />} />
            <Route path="/wardrobe" element={<Wardrobe />} />
            <Route path="/coins" element={<Coins />} />
            <Route path="/gacha" element={<Gacha />} />
            <Route path="/ai-chat" element={<AiChat />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/character-select" element={<CharacterSelect />} />
            <Route path="/online-consultation" element={<OnlineConsultation />} />
            <Route path="/consultation-booking" element={<ConsultationBooking />} />
            <Route path="/consultation-list" element={<ConsultationList />} />
            <Route path="/breathing-guide" element={<BreathingGuidePage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CharacterProvider>
  </QueryClientProvider>
);

export default App;

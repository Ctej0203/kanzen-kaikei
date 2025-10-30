import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Records from "./pages/Records";
import Settings from "./pages/Settings";
import HomehomeMessages from "./pages/HomehomeMessages";
import MentalRecord from "./pages/MentalRecord";
import Wardrobe from "./pages/Wardrobe";
import Coins from "./pages/Coins";
import Gacha from "./pages/Gacha";
import AiChat from "./pages/AiChat";
import Premium from "./pages/Premium";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <Route path="/homehome" element={<HomehomeMessages />} />
          <Route path="/mental-record" element={<MentalRecord />} />
          <Route path="/wardrobe" element={<Wardrobe />} />
          <Route path="/coins" element={<Coins />} />
          <Route path="/gacha" element={<Gacha />} />
          <Route path="/ai-chat" element={<AiChat />} />
          <Route path="/premium" element={<Premium />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

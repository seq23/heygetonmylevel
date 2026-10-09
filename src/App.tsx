import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import type { ReactNode, ComponentType } from "react";
import { SessionProvider } from "@/contexts/SessionContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import SkipNav from "@/components/SkipNav";
import Index from "./pages/Index";
import SelectLevel from "./pages/SelectLevel";
import Assessment from "./pages/Assessment";
import Dashboard from "./pages/Dashboard";
import Session from "./pages/Session";
import Summary from "./pages/Summary";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Phonics from "./pages/Phonics";
import Curriculum from "./pages/Curriculum";
import CurriculumBand from "./pages/CurriculumBand";
import Install from "./pages/Install";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import FeedbackBubble from "./components/FeedbackBubble";


/**
 * The whole app, router-agnostic: the browser passes BrowserRouter, the build-time
 * prerender (src/entry-server.tsx) passes StaticRouter so crawlers get real HTML.
 */
const App = ({ Router, queryClient = new QueryClient() }: { Router: ComponentType<{ children: ReactNode }>; queryClient?: QueryClient }) => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <SessionProvider>
          <Toaster />
          <Sonner />
          <Router>
            <SkipNav />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/select-level" element={<SelectLevel />} />
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/session" element={<Session />} />
              <Route path="/phonics" element={<Phonics />} />
              <Route path="/curriculum" element={<Curriculum />} />
              <Route path="/curriculum/:band" element={<CurriculumBand />} />
              <Route path="/install" element={<Install />} />
              <Route path="/summary" element={<Summary />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <FeedbackBubble />
          </Router>
        </SessionProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

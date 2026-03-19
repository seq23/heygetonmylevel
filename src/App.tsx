import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionProvider } from "@/contexts/SessionContext";
import Index from "./pages/Index";
import SelectLevel from "./pages/SelectLevel";
import Assessment from "./pages/Assessment";
import Dashboard from "./pages/Dashboard";
import Session from "./pages/Session";
import Summary from "./pages/Summary";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Phonics from "./pages/Phonics";
import NotFound from "./pages/NotFound";
import FeedbackBubble from "./components/FeedbackBubble";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SessionProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/select-level" element={<SelectLevel />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/session" element={<Session />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FeedbackBubble />
        </BrowserRouter>
      </SessionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

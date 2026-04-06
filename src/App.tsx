import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Splash from "./pages/Splash";
import Home from "./pages/Home";
import Login from "./pages/Login";

import VerifyQatarId from "./pages/VerifyQatarId";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();




const AppRoutes = () => {
  const location = useLocation();
  const [splashDone, setSplashDone] = useState(() => {
    return sessionStorage.getItem("splashShown") === "true";
  });

  const handleSplashDone = () => {
    sessionStorage.setItem("splashShown", "true");
    setSplashDone(true);
  };

  if (!splashDone) {
    return <Splash onDone={handleSplashDone} />;
  }

  return (
    <PageTransition>
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-qatar-id" element={<VerifyQatarId />} />
        
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageTransition>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

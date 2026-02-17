import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Objects from "@/pages/Objects";
import SingleInspect from "@/pages/SingleInspect";
import BatchInspect from "@/pages/BatchInspect";
import HistoryPage from "@/pages/History";
import NotFound from "./pages/NotFound";
import Train from "./pages/Train";
import Register from "./pages/Register";

const queryClient = new QueryClient();

const ProtectedPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
            <Route path="/objects" element={<ProtectedPage><Objects /></ProtectedPage>} />
            <Route path="/inspect" element={<ProtectedPage><SingleInspect /></ProtectedPage>} />
            <Route path="/batch" element={<ProtectedPage><BatchInspect /></ProtectedPage>} />
            <Route path="/history" element={<ProtectedPage><HistoryPage /></ProtectedPage>} />
            <Route path="/train" element={<Train />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

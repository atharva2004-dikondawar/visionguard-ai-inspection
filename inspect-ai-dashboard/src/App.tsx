import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "@/components/AppLayout";

import Dashboard from "@/pages/Dashboard";
import Objects from "@/pages/Objects";
import SingleInspect from "@/pages/SingleInspect";
import BatchInspect from "@/pages/BatchInspect";
import HistoryPage from "@/pages/History";
import Train from "@/pages/Train";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const LayoutPage = ({ children }: { children: React.ReactNode }) => (
  <AppLayout>{children}</AppLayout>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <LayoutPage>
                  <Dashboard />
                </LayoutPage>
              }
            />

            <Route
              path="/objects"
              element={
                <LayoutPage>
                  <Objects />
                </LayoutPage>
              }
            />

            <Route
              path="/inspect"
              element={
                <LayoutPage>
                  <SingleInspect />
                </LayoutPage>
              }
            />

            <Route
              path="/batch"
              element={
                <LayoutPage>
                  <BatchInspect />
                </LayoutPage>
              }
            />

            <Route
              path="/history"
              element={
                <LayoutPage>
                  <HistoryPage />
                </LayoutPage>
              }
            />

            <Route
              path="/train"
              element={
                <LayoutPage>
                  <Train />
                </LayoutPage>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>

      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
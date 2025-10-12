import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Propostas from "./pages/Propostas";
import Financeiro from "./pages/Financeiro";
import Projetos from "./pages/Projetos";
import Usuarios from "./pages/Usuarios";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute } from "./components/auth/PrivateRoute";

const queryClient = new QueryClient();

const AppRoutes = () => (
  <MainLayout>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/leads" element={<Leads />} />
      <Route path="/propostas" element={<Propostas />} />
      <Route path="/financeiro" element={<Financeiro />} />
      <Route path="/projetos" element={<Projetos />} />
      <Route path="/usuarios" element={<Usuarios />} />
      <Route path="/configuracoes" element={<Configuracoes />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </MainLayout>
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
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <AppRoutes />
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
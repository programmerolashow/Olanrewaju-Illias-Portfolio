import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import SiteLayout from "@/components/SiteLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Secondary pages load on demand so the home page bundle stays lean.
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));
const ArticlesPage = lazy(() => import("./pages/ArticlesPage"));
const MomentsPage = lazy(() => import("./pages/MomentsPage"));
const ApproachPage = lazy(() => import("./pages/ApproachPage"));
const UpdatesPage = lazy(() => import("./pages/UpdatesPage"));
const UpdateDetailPage = lazy(() => import("./pages/UpdateDetailPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:slug" element={<ProjectDetailPage />} />
              <Route path="/articles" element={<ArticlesPage />} />
              <Route path="/moments" element={<MomentsPage />} />
              <Route path="/approach" element={<ApproachPage />} />
              <Route path="/updates" element={<UpdatesPage />} />
              <Route path="/updates/:id" element={<UpdateDetailPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

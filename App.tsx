import { Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Header } from "./components/Header";
import { DashboardSkeleton } from "./components/LoadingStates";

// Lazy load pages for better performance
const LandingPage = lazy(() =>
  import("./components/pages/LandingPage").then((module) => ({
    default: module.LandingPage,
  })),
);
const MarketplacePage = lazy(() =>
  import("./components/pages/MarketplacePage").then(
    (module) => ({ default: module.MarketplacePage }),
  ),
);
const AgentDetailPage = lazy(() =>
  import("./components/pages/AgentDetailPage").then(
    (module) => ({ default: module.AgentDetailPage }),
  ),
);
const DashboardPage = lazy(() =>
  import("./components/pages/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);
const CreateAgentPage = lazy(() =>
  import("./components/pages/CreateAgentPage").then(
    (module) => ({ default: module.CreateAgentPage }),
  ),
);
const AuthPage = lazy(() =>
  import("./components/pages/AuthPage").then(
    (module) => ({ default: module.AuthPage }),
  ),
);
const SettingsPage = lazy(() =>
  import("./components/pages/SettingsPage").then(
    (module) => ({ default: module.SettingsPage }),
  ),
);
const ResetPasswordPage = lazy(() =>
  import("./components/pages/ResetPasswordPage").then(
    (module) => ({ default: module.ResetPasswordPage }),
  ),
);

// Loading fallback component
function PageLoader() {
  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardSkeleton />
    </div>
  );
}

// Error Boundary Component
function ErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">{children}</div>
  );
}

// SEO setup function (would be better handled by a meta framework like Next.js)
function setupSEO() {
  if (typeof document !== "undefined") {
    document.title = "Agentica.ai - AI Voice Agents Marketplace";

    const metaTags = [
      {
        name: "description",
        content:
          "Discover and deploy AI voice agents in seconds with Agentica.ai. Choose from hundreds of pre-built intelligent agents or create your own custom AI assistant.",
      },
      {
        name: "keywords",
        content:
          "AI voice agents, artificial intelligence, chatbots, voice AI, AI marketplace, conversational AI, intelligent agents, AI assistants, voice technology, AI automation",
      },
      { name: "author", content: "Agentica.ai" },
      {
        property: "og:title",
        content: "Agentica.ai - AI Voice Agents Marketplace",
      },
      {
        property: "og:description",
        content:
          "Discover and deploy AI voice agents in seconds. The ultimate marketplace for intelligent conversational AI.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://agentica.ai" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Agentica.ai - AI Voice Agents Marketplace",
      },
      {
        name: "twitter:description",
        content:
          "Discover and deploy AI voice agents in seconds. The ultimate marketplace for intelligent conversational AI.",
      },
      {
        name: "twitter:site",
        content: "@AgenticaAI",
      },
      {
        name: "theme-color",
        content: "#030213",
      },
      {
        name: "apple-mobile-web-app-title",
        content: "Agentica.ai",
      },
      {
        name: "application-name",
        content: "Agentica.ai",
      },
    ];

    metaTags.forEach(({ name, property, content }) => {
      const selector = name
        ? `meta[name="${name}"]`
        : `meta[property="${property}"]`;
      let meta = document.querySelector(selector);

      if (!meta) {
        meta = document.createElement("meta");
        if (name) meta.setAttribute("name", name);
        if (property) meta.setAttribute("property", property);
        document.head.appendChild(meta);
      }

      meta.setAttribute("content", content);
    });

    // Add favicon if it doesn't exist
    if (!document.querySelector('link[rel="icon"]')) {
      const favicon = document.createElement("link");
      favicon.rel = "icon";
      favicon.type = "image/svg+xml";
      favicon.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23030213' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect width='18' height='10' x='3' y='11' rx='2'/><circle cx='12' cy='5' r='2'/><path d='m12 7 0 4'/><line x1='8' x2='8' y1='16' y2='16'/><line x1='16' x2='16' y1='16' y2='16'/></svg>";
      document.head.appendChild(favicon);
    }
  }
}

export default function App() {
  // Setup SEO on component mount
  useEffect(() => {
    setupSEO();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Header />
            <main className="pb-8">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/marketplace" element={<MarketplacePage />} />
                  <Route path="/agent/:id" element={<AgentDetailPage />} />
                  
                  {/* Auth Routes */}
                  <Route 
                    path="/auth" 
                    element={
                      <ProtectedRoute requireAuth={false}>
                        <AuthPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/auth/reset-password" 
                    element={<ResetPasswordPage />} 
                  />
                  
                  {/* Protected Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/create"
                    element={
                      <ProtectedRoute>
                        <CreateAgentPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Catch-all route for unmatched URLs */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "hsl(var(--card))",
                  color: "hsl(var(--card-foreground))",
                  border: "1px solid hsl(var(--border))",
                },
              }}
            />
          </div>
        </Router>
      </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
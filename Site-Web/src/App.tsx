import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import ScriptsPage from "./pages/ScriptsPage";
import CategoryPage from "./pages/CategoryPage";
import CategoriesPage from "./pages/CategoriesPage";
import NewCategoryPage from "./pages/NewCategoryPage";
import NewScriptPage from "./pages/NewScriptPage";
import EditScriptPage from "./pages/EditScriptPage";
import ScriptDetailPage from "./pages/ScriptDetailPage";
import SettingsPage from "./pages/SettingsPage";
import ProviderPage from "./pages/ProviderPage";
import ResourcesPage from "./pages/ResourcesPage";
import FavoritesPage from "./pages/FavoritesPage";
import SharesPage from "./pages/SharesPage";
import DownloadsPage from "./pages/DownloadsPage";
import HistoryPage from "./pages/HistoryPage";
import ProfilePage from "./pages/ProfilePage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SetPasswordPage from "./pages/SetPasswordPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AuditLogsPage from "./pages/AuditLogsPage";
import { ForbiddenPage, SuspendedPage } from "./pages/AccessPages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/forbidden" element={<ForbiddenPage />} />
            <Route path="/suspended" element={<SuspendedPage />} />

            {/* Set-password (auth required, no must_change_password gate) */}
            <Route
              path="/set-password"
              element={
                <ProtectedRoute>
                  <SetPasswordPage />
                </ProtectedRoute>
              }
            />

            {/* Protected app routes */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/scripts" element={<ProtectedRoute><ScriptsPage /></ProtectedRoute>} />
            <Route path="/scripts/new" element={<ProtectedRoute permission={{ resource: 'scripts', action: 'create' }}><NewScriptPage /></ProtectedRoute>} />
            <Route path="/scripts/:scriptId/edit" element={<ProtectedRoute permission={{ resource: 'scripts', action: 'update' }}><EditScriptPage /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
            <Route path="/categories/new" element={<ProtectedRoute permission={{ resource: 'resources', action: 'create' }}><NewCategoryPage /></ProtectedRoute>} />
            <Route path="/category/:categoryId" element={<ProtectedRoute><CategoryPage /></ProtectedRoute>} />
            <Route path="/provider/:providerId" element={<ProtectedRoute><ProviderPage /></ProtectedRoute>} />
            <Route path="/resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
            <Route path="/shares" element={<ProtectedRoute><SharesPage /></ProtectedRoute>} />
            <Route path="/downloads" element={<ProtectedRoute><DownloadsPage /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/contact" element={<ProtectedRoute><ContactPage /></ProtectedRoute>} />
            <Route path="/script/:scriptId" element={<ProtectedRoute><ScriptDetailPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

            {/* Admin-only */}
            <Route path="/admin/users" element={<ProtectedRoute role="global_admin"><AdminUsersPage /></ProtectedRoute>} />
            <Route path="/admin/audit-logs" element={<ProtectedRoute role="global_admin"><AuditLogsPage /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

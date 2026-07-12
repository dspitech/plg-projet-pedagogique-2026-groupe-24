import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/app/Index";
import DashboardPage from "./pages/app/DashboardPage";
import ScriptsPage from "./pages/scripts/ScriptsPage";
import CategoryPage from "./pages/categories/CategoryPage";
import CategoriesPage from "./pages/categories/CategoriesPage";
import NewCategoryPage from "./pages/categories/NewCategoryPage";
import NewScriptPage from "./pages/scripts/NewScriptPage";
import EditScriptPage from "./pages/scripts/EditScriptPage";
import ScriptDetailPage from "./pages/scripts/ScriptDetailPage";
import SettingsPage from "./pages/app/SettingsPage";
import ResourcesPage from "./pages/resources/ResourcesPage";
import ProfilePage from "./pages/app/ProfilePage";
import ContactPage from "./pages/app/ContactPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import SetPasswordPage from "./pages/auth/SetPasswordPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AuditLogsPage from "./pages/admin/AuditLogsPage";
import ArchivesPage from "./pages/admin/ArchivesPage";
import TrashPage from "./pages/admin/TrashPage";
import { ForbiddenPage, SuspendedPage, NoSignupPage } from "./pages/auth/AccessPages";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/public/HomePage";
import AboutPage from "./pages/public/AboutPage";
import ScriptsPublicPage from "./pages/public/ScriptsPublicPage";
import ScriptPublicDetailPage from "./pages/public/ScriptPublicDetailPage";
import CategoriesPublicPage from "./pages/public/CategoriesPublicPage";
import CategoryPublicPage from "./pages/public/CategoryPublicPage";
import ResourcesPublicPage from "./pages/public/ResourcesPublicPage";
import ContactPublicPage from "./pages/public/ContactPublicPage";
import { TermsPage, PrivacyPage, CookiesPage, LegalNoticePage } from "./pages/public/LegalPages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/forbidden" element={<ForbiddenPage />} />
            <Route path="/suspended" element={<SuspendedPage />} />
            <Route path="/no-signup" element={<NoSignupPage />} />

            <Route path="/set-password" element={<ProtectedRoute><SetPasswordPage /></ProtectedRoute>} />

            {/* Public visitor site */}
            <Route path="/" element={<HomePage />} />
            <Route path="/qui-sommes-nous" element={<AboutPage />} />
            <Route path="/nos-scripts" element={<ScriptsPublicPage />} />
            <Route path="/nos-scripts/:scriptId" element={<ScriptPublicDetailPage />} />
            <Route path="/nos-categories" element={<CategoriesPublicPage />} />
            <Route path="/nos-categories/:categoryId" element={<CategoryPublicPage />} />
            <Route path="/nos-ressources" element={<ResourcesPublicPage />} />
            <Route path="/nous-contacter" element={<ContactPublicPage />} />
            <Route path="/mentions-legales" element={<LegalNoticePage />} />
            <Route path="/conditions-generales" element={<TermsPage />} />
            <Route path="/politique-confidentialite" element={<PrivacyPage />} />
            <Route path="/politique-cookies" element={<CookiesPage />} />


            {/* Admin dashboard */}
            <Route path="/admin" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/scripts" element={<ProtectedRoute><ScriptsPage /></ProtectedRoute>} />
            <Route path="/scripts/new" element={<ProtectedRoute permission={{ resource: 'scripts', action: 'create' }}><NewScriptPage /></ProtectedRoute>} />
            <Route path="/scripts/:scriptId/edit" element={<ProtectedRoute permission={{ resource: 'scripts', action: 'update' }}><EditScriptPage /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
            <Route path="/categories/new" element={<ProtectedRoute permission={{ resource: 'resources', action: 'create' }}><NewCategoryPage /></ProtectedRoute>} />
            <Route path="/category/:categoryId" element={<ProtectedRoute><CategoryPage /></ProtectedRoute>} />
            <Route path="/resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/contact" element={<ProtectedRoute><ContactPage /></ProtectedRoute>} />
            <Route path="/script/:scriptId" element={<ProtectedRoute><ScriptDetailPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

            <Route path="/admin/users" element={<ProtectedRoute role="global_admin"><AdminUsersPage /></ProtectedRoute>} />
            <Route path="/admin/audit-logs" element={<ProtectedRoute role="global_admin"><AuditLogsPage /></ProtectedRoute>} />
            <Route path="/admin/archives" element={<ProtectedRoute role="global_admin"><ArchivesPage /></ProtectedRoute>} />
            <Route path="/admin/trash" element={<ProtectedRoute role="global_admin"><TrashPage /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

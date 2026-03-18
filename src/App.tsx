import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";

// Public Pages
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Suppliers from "./pages/Suppliers";
import SupplierDetail from "./pages/SupplierDetail";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import ProductScanner from "./pages/ProductScanner";

// Profile Pages
import BuyerProfile from "./pages/buyer/Profile";
import SupplierProfile from "./pages/supplier/Profile";
import SavedItems from "./pages/buyer/SavedItems";

// Product/Recipe Management Pages
import SupplierProducts from "./pages/supplier/Products";
import ProductEdit from "./pages/supplier/ProductEdit";
import SupplierEnquiries from "./pages/supplier/Enquiries";
import SupplierRecipes from "./pages/supplier/Recipes";
import RecipeEdit from "./pages/supplier/RecipeEdit";

// Chat Pages
import Chat from "./pages/Chat";
import ChatRoom from "./pages/ChatRoom";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminSuppliers from "./pages/admin/Suppliers";
import AdminProducts from "./pages/admin/Products";
import AdminContactSubmissions from "./pages/admin/ContactSubmissions";
import AdminImportSuppliers from "./pages/admin/ImportSuppliers";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import RefundPolicy from "./pages/RefundPolicy";
import Disclaimer from "./pages/Disclaimer";
import AdminBlogs from "./pages/admin/Blogs";
import AdminBlogEdit from "./pages/admin/BlogEdit";
import AdminSubscriptions from "./pages/admin/Subscriptions";
import Subscribe from "./pages/Subscribe";
import CategoryDetail from "./pages/CategoryDetail";
import AdminHotRequirements from "./pages/admin/HotRequirements";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
            <Route path="/products/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
            <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
            <Route path="/suppliers/:id" element={<ProtectedRoute><SupplierDetail /></ProtectedRoute>} />
            <Route path="/recipes" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
            <Route path="/recipes/:id" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
            <Route path="/scan" element={<ProductScanner />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            
            {/* Subscribe page - for users without active subscription */}
            <Route path="/subscribe" element={<ProtectedRoute><Subscribe /></ProtectedRoute>} />

            {/* Unified Dashboard */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            {/* Legacy redirects */}
            <Route path="/buyer/dashboard" element={<Navigate to="/dashboard" replace />} />
            <Route path="/supplier/dashboard" element={<Navigate to="/dashboard" replace />} />

            {/* Profile - any authenticated user */}
            <Route path="/profile" element={<ProtectedRoute><BuyerProfile /></ProtectedRoute>} />
            <Route path="/buyer/profile" element={<Navigate to="/profile" replace />} />
            <Route path="/supplier/profile" element={<ProtectedRoute><SupplierProfile /></ProtectedRoute>} />

            {/* Product & Recipe Management - any authenticated user */}
            <Route path="/supplier/products" element={<ProtectedRoute><SupplierProducts /></ProtectedRoute>} />
            <Route path="/supplier/products/new" element={<ProtectedRoute><ProductEdit /></ProtectedRoute>} />
            <Route path="/supplier/products/:id" element={<ProtectedRoute><ProductEdit /></ProtectedRoute>} />
            <Route path="/supplier/enquiries" element={<ProtectedRoute><SupplierEnquiries /></ProtectedRoute>} />
            <Route path="/supplier/recipes" element={<ProtectedRoute><SupplierRecipes /></ProtectedRoute>} />
            <Route path="/supplier/recipes/new" element={<ProtectedRoute><RecipeEdit /></ProtectedRoute>} />
            <Route path="/supplier/recipes/:id" element={<ProtectedRoute><RecipeEdit /></ProtectedRoute>} />

            {/* Saved Items - any authenticated user */}
            <Route path="/saved" element={<ProtectedRoute><SavedItems /></ProtectedRoute>} />
            
            {/* Chat Routes - any authenticated user */}
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/chat/:id" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/suppliers" element={<ProtectedRoute allowedRoles={['admin']}><AdminSuppliers /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute allowedRoles={['admin']}><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/contact" element={<ProtectedRoute allowedRoles={['admin']}><AdminContactSubmissions /></ProtectedRoute>} />
            <Route path="/admin/import-suppliers" element={<ProtectedRoute allowedRoles={['admin']}><AdminImportSuppliers /></ProtectedRoute>} />
            <Route path="/admin/blogs" element={<ProtectedRoute allowedRoles={['admin']}><AdminBlogs /></ProtectedRoute>} />
            <Route path="/admin/blogs/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminBlogEdit /></ProtectedRoute>} />
            <Route path="/admin/subscriptions" element={<ProtectedRoute allowedRoles={['admin']}><AdminSubscriptions /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

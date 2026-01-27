import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Public Pages
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Suppliers from "./pages/Suppliers";
import SupplierDetail from "./pages/SupplierDetail";

// Buyer Pages
import BuyerDashboard from "./pages/buyer/Dashboard";
import SavedItems from "./pages/buyer/SavedItems";

// Supplier Pages
import SupplierDashboard from "./pages/supplier/Dashboard";
import SupplierProfile from "./pages/supplier/Profile";
import SupplierProducts from "./pages/supplier/Products";
import ProductEdit from "./pages/supplier/ProductEdit";
import SupplierEnquiries from "./pages/supplier/Enquiries";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminSuppliers from "./pages/admin/Suppliers";
import AdminProducts from "./pages/admin/Products";

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
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/suppliers/:id" element={<SupplierDetail />} />
            
            {/* Buyer Routes */}
            <Route 
              path="/buyer/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <BuyerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/saved" 
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <SavedItems />
                </ProtectedRoute>
              } 
            />
            
            {/* Supplier Routes */}
            <Route 
              path="/supplier/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['supplier']}>
                  <SupplierDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/supplier/profile" 
              element={
                <ProtectedRoute allowedRoles={['supplier']}>
                  <SupplierProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/supplier/products" 
              element={
                <ProtectedRoute allowedRoles={['supplier']}>
                  <SupplierProducts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/supplier/products/new" 
              element={
                <ProtectedRoute allowedRoles={['supplier']}>
                  <ProductEdit />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/supplier/products/:id" 
              element={
                <ProtectedRoute allowedRoles={['supplier']}>
                  <ProductEdit />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/supplier/enquiries" 
              element={
                <ProtectedRoute allowedRoles={['supplier']}>
                  <SupplierEnquiries />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/suppliers" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSuppliers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/products" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminProducts />
                </ProtectedRoute>
              } 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

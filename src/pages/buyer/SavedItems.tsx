import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { ProductCard } from '@/components/shared/ProductCard';
import { SupplierCard } from '@/components/shared/SupplierCard';
import { useSavedItems } from '@/hooks/useSavedItems';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Package, Store, Loader2 } from 'lucide-react';

export default function SavedItems() {
  const {
    savedProducts,
    savedSuppliers,
    loading,
    toggleSaveProduct,
    toggleSaveSupplier,
    isProductSaved,
    isSupplierSaved,
  } = useSavedItems();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            Saved Items
          </h1>
          <p className="text-muted-foreground">
            Your favorited products and suppliers
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              Products ({savedProducts.length})
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="gap-2">
              <Store className="h-4 w-4" />
              Suppliers ({savedSuppliers.length})
            </TabsTrigger>
          </TabsList>

          {/* Saved Products */}
          <TabsContent value="products" className="mt-6">
            {savedProducts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold text-xl mb-2">No saved products</h3>
                  <p className="text-muted-foreground max-w-md mb-4">
                    Browse products and click the heart icon to save them for later
                  </p>
                  <Button asChild>
                    <Link to="/products">Browse Products</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {savedProducts.map((saved) => {
                  const product = saved.products;
                  if (!product) return null;
                  
                  return (
                    <ProductCard
                      key={saved.id}
                      id={product.id}
                      name={product.name}
                      description={product.description}
                      images={product.images}
                      supplierName={product.supplier_profiles?.company_name}
                      supplierId={product.supplier_profiles?.id}
                      categoryName={product.product_categories?.name}
                      isSaved={isProductSaved(product.id)}
                      onSaveToggle={() => toggleSaveProduct(product.id)}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Saved Suppliers */}
          <TabsContent value="suppliers" className="mt-6">
            {savedSuppliers.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Store className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold text-xl mb-2">No saved suppliers</h3>
                  <p className="text-muted-foreground max-w-md mb-4">
                    Browse suppliers and click the heart icon to save them for later
                  </p>
                  <Button asChild>
                    <Link to="/suppliers">Browse Suppliers</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {savedSuppliers.map((saved) => {
                  const supplier = saved.supplier_profiles;
                  if (!supplier) return null;
                  
                  return (
                    <SupplierCard
                      key={saved.id}
                      id={supplier.id}
                      companyName={supplier.company_name}
                      businessDescription={supplier.business_description}
                      logoUrl={supplier.logo_url}
                      city={supplier.city}
                      state={supplier.state}
                      verificationStatus={supplier.verification_status as 'pending' | 'verified' | 'rejected'}
                      isSaved={isSupplierSaved(supplier.id)}
                      onSaveToggle={() => toggleSaveSupplier(supplier.id)}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

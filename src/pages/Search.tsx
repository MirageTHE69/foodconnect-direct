import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SupplierCard } from '@/components/shared/SupplierCard';
import { ProductCard } from '@/components/shared/ProductCard';
import { useSavedItems } from '@/hooks/useSavedItems';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search as SearchIcon, Loader2, ArrowLeft, Store, Package, Tag, ChevronRight } from 'lucide-react';

interface SupplierResult {
  id: string;
  company_name: string;
  business_description: string | null;
  logo_url: string | null;
  city: string | null;
  state: string | null;
  verification_status: 'pending' | 'verified' | 'rejected';
}

interface ProductResult {
  id: string;
  name: string;
  description: string | null;
  images: string[] | null;
}

interface CategoryResult {
  id: string;
  slug: string;
  name: string;
}

interface SubCategoryResult {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
}

interface VendorResult {
  id: string;
  name: string;
  subCategorySlug: string;
  categorySlug: string;
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);
  const [suppliers, setSuppliers] = useState<SupplierResult[]>([]);
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [categories, setCategories] = useState<CategoryResult[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryResult[]>([]);
  const [vendors, setVendors] = useState<VendorResult[]>([]);
  const [loading, setLoading] = useState(false);

  const { isSupplierSaved, toggleSaveSupplier, isProductSaved, toggleSaveProduct } = useSavedItems();

  useEffect(() => {
    setInputValue(query);
    if (!query.trim()) {
      setSuppliers([]);
      setProducts([]);
      setCategories([]);
      setSubCategories([]);
      setVendors([]);
      return;
    }
    runSearch(query);
  }, [query]);

  const runSearch = async (term: string) => {
    setLoading(true);
    try {
      const like = `%${term}%`;
      const [suppliersRes, productsRes, categoriesRes, subCategoriesRes, vendorsRes] = await Promise.all([
        supabase
          .from('supplier_profiles')
          .select('id, company_name, business_description, logo_url, city, state, verification_status')
          .ilike('company_name', like)
          .limit(24),
        supabase
          .from('products')
          .select('id, name, description, images')
          .ilike('name', like)
          .eq('status', 'approved')
          .limit(24),
        supabase
          .from('categories')
          .select('id, slug, name')
          .ilike('name', like)
          .eq('is_active', true)
          .limit(12),
        supabase
          .from('sub_categories')
          .select('id, slug, name, categories(slug)')
          .ilike('name', like)
          .eq('is_active', true)
          .limit(12),
        supabase
          .from('directory_vendors')
          .select('id, name, sub_categories(slug, categories(slug))')
          .ilike('name', like)
          .limit(24),
      ]);
      setSuppliers(suppliersRes.data || []);
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
      setSubCategories(
        (subCategoriesRes.data || [])
          .filter((s) => s.categories?.slug)
          .map((s) => ({ id: s.id, slug: s.slug, name: s.name, categorySlug: s.categories!.slug }))
      );
      setVendors(
        (vendorsRes.data || [])
          .filter((v) => v.sub_categories?.categories?.slug)
          .map((v) => ({
            id: v.id, name: v.name,
            subCategorySlug: v.sub_categories!.slug, categorySlug: v.sub_categories!.categories!.slug,
          }))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(inputValue.trim() ? { q: inputValue.trim() } : {});
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-40 bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="shrink-0">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <form onSubmit={handleSubmit} className="flex-1 flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search suppliers, products..."
                className="pl-9"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!query.trim() ? (
          <p className="text-center text-muted-foreground py-16">Enter a search term to find suppliers and products.</p>
        ) : loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : suppliers.length === 0 && products.length === 0 && categories.length === 0 && subCategories.length === 0 && vendors.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No results for "{query}". Try a different search term.</p>
        ) : (
          <div className="space-y-12">
            {categories.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" /> Categories ({categories.length})
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {categories.map((c) => (
                    <Link key={c.id} to={`/categories/${c.slug}`}>
                      <Card className="hover:shadow-hover hover:border-primary/30 transition-all duration-300">
                        <CardContent className="p-4 flex items-center justify-between">
                          <span className="font-medium text-sm text-foreground">{c.name}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {subCategories.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" /> Sub-categories ({subCategories.length})
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {subCategories.map((s) => (
                    <Link key={s.id} to={`/categories/${s.categorySlug}/sub/${s.slug}`}>
                      <Card className="hover:shadow-hover hover:border-primary/30 transition-all duration-300">
                        <CardContent className="p-4 flex items-center justify-between">
                          <span className="font-medium text-sm text-foreground">{s.name}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {suppliers.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" /> Suppliers ({suppliers.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {suppliers.map((s) => (
                    <SupplierCard
                      key={s.id}
                      id={s.id}
                      companyName={s.company_name}
                      businessDescription={s.business_description}
                      logoUrl={s.logo_url}
                      city={s.city}
                      state={s.state}
                      verificationStatus={s.verification_status}
                      isSaved={isSupplierSaved(s.id)}
                      onSaveToggle={() => toggleSaveSupplier(s.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {vendors.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" /> Vendor Directory ({vendors.length})
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {vendors.map((v) => (
                    <Link key={v.id} to={`/categories/${v.categorySlug}/sub/${v.subCategorySlug}`}>
                      <Card className="hover:shadow-hover hover:border-primary/30 transition-all duration-300">
                        <CardContent className="p-4 flex items-center justify-between">
                          <span className="font-medium text-sm text-foreground">{v.name}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {products.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" /> Products ({products.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {products.map((p) => (
                    <ProductCard
                      key={p.id}
                      id={p.id}
                      name={p.name}
                      description={p.description}
                      images={p.images}
                      isSaved={isProductSaved(p.id)}
                      onSaveToggle={() => toggleSaveProduct(p.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

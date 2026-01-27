import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SupplierCard } from '@/components/shared/SupplierCard';
import { useSavedItems } from '@/hooks/useSavedItems';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Search, Filter, Store, ChefHat } from 'lucide-react';

interface SupplierWithDetails {
  id: string;
  company_name: string;
  business_description: string | null;
  logo_url: string | null;
  city: string | null;
  state: string | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  product_count: number;
}

const ITEMS_PER_PAGE = 12;

export default function BrowseSuppliers() {
  const [suppliers, setSuppliers] = useState<SupplierWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [locations, setLocations] = useState<string[]>([]);
  
  const { isSupplierSaved, toggleSaveSupplier } = useSavedItems();

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [searchQuery, locationFilter, currentPage]);

  const fetchLocations = async () => {
    const { data } = await supabase
      .from('supplier_profiles')
      .select('state')
      .eq('verification_status', 'verified');
    
    const uniqueLocations = new Set<string>();
    data?.forEach(supplier => {
      if (supplier.state) uniqueLocations.add(supplier.state);
    });
    setLocations(Array.from(uniqueLocations).sort());
  };

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('supplier_profiles')
        .select('*', { count: 'exact' })
        .eq('verification_status', 'verified');

      // Apply search filter
      if (searchQuery) {
        query = query.ilike('company_name', `%${searchQuery}%`);
      }

      // Apply location filter
      if (locationFilter && locationFilter !== 'all') {
        query = query.eq('state', locationFilter);
      }

      // Pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to).order('company_name');

      const { data, count, error } = await query;

      if (error) throw error;

      // Fetch product counts for each supplier
      const supplierIds = data?.map(s => s.id) || [];
      const { data: productCounts } = await supabase
        .from('products')
        .select('supplier_id')
        .in('supplier_id', supplierIds)
        .eq('status', 'approved');

      const countMap = new Map<string, number>();
      productCounts?.forEach(p => {
        countMap.set(p.supplier_id, (countMap.get(p.supplier_id) || 0) + 1);
      });

      const suppliersWithCounts = (data || []).map(supplier => ({
        ...supplier,
        product_count: countMap.get(supplier.id) || 0,
      }));
      
      setSuppliers(suppliersWithCounts);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSuppliers();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <ChefHat className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">FoodAdda</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/products">
                <Button variant="ghost">Browse Products</Button>
              </Link>
              <Link to="/saved">
                <Button variant="ghost">Saved</Button>
              </Link>
              <Link to="/auth">
                <Button>Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span>Suppliers</span>
          </div>
          <h1 className="text-3xl font-bold">Browse Suppliers</h1>
          <p className="text-muted-foreground mt-1">
            Connect with verified food suppliers across India
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search suppliers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={locationFilter} onValueChange={(v) => { setLocationFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit">
                <Filter className="h-4 w-4 mr-2" />
                Apply
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {suppliers.length} of {totalCount} suppliers
          </p>
        </div>

        {/* Suppliers Grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-[4/3] bg-muted animate-pulse" />
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : suppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Store className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-xl mb-2">No suppliers found</h3>
            <p className="text-muted-foreground max-w-md">
              Try adjusting your search or filter criteria to find what you're looking for
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {suppliers.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                id={supplier.id}
                companyName={supplier.company_name}
                businessDescription={supplier.business_description}
                logoUrl={supplier.logo_url}
                city={supplier.city}
                state={supplier.state}
                verificationStatus={supplier.verification_status}
                productCount={supplier.product_count}
                isSaved={isSupplierSaved(supplier.id)}
                onSaveToggle={() => toggleSaveSupplier(supplier.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>
    </div>
  );
}

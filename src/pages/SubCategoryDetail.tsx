
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Mail, Phone, Store, Lock, BadgeCheck, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { supabase } from "@/integrations/supabase/client";
import { isUuid } from "@/lib/utils";
import { useAnchorNav } from "@/hooks/useAnchorNav";
import { useAuth } from "@/hooks/useAuth";
import { useVendorNameAccess } from "@/hooks/useVendorNameAccess";
import { MaskedVendorName } from "@/components/shared/MaskedVendorName";
import { VendorAccessDialog } from "@/components/shared/VendorAccessDialog";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { RfqBand } from "@/components/landing/SourcingSections";

interface Vendor {
  id: string;
  name: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  /** Set for suppliers registered on FoodAdda (links to their profile page). */
  supplierId?: string;
  logoUrl?: string | null;
}

const SubCategoryDetail = () => {
  const { categoryId, subId } = useParams<{ categoryId: string; subId: string }>();
  const goToAnchor = useAnchorNav();
  const { user } = useAuth();
  const { canView: canViewNames, reason: nameGateReason } = useVendorNameAccess();
  const [gateOpen, setGateOpen] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [subName, setSubName] = useState("");
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId || !subId) return;
    const load = async () => {
      const catQuery = isUuid(categoryId)
        ? supabase.from("categories").select("id, name, slug").eq("id", categoryId).single()
        : supabase.from("categories").select("id, name, slug").eq("slug", categoryId).single();
      const { data: catData } = await catQuery;
      if (!catData) {
        setLoading(false);
        return;
      }
      setCatName(catData.name);
      setCatSlug(catData.slug);

      const subQuery = isUuid(subId)
        ? supabase.from("sub_categories").select("id, name").eq("id", subId).eq("category_id", catData.id).single()
        : supabase.from("sub_categories").select("id, name").eq("slug", subId).eq("category_id", catData.id).single();
      const { data: subData } = await subQuery;
      if (subData) {
        setSubName(subData.name);
        const [{ data: vendorData }, { data: linkData }] = await Promise.all([
          supabase.from("directory_vendors").select("*").eq("sub_category_id", subData.id),
          // Verified suppliers registered on FoodAdda who chose this sub-category.
          supabase
            .from("supplier_sub_categories")
            .select("supplier_profiles!inner(id, company_name, city, state, logo_url, verification_status)")
            .eq("sub_category_id", subData.id)
            .eq("supplier_profiles.verification_status", "verified"),
        ]);
        const registered: Vendor[] = (linkData ?? []).map(({ supplier_profiles: sp }) => ({
          id: `supplier-${sp.id}`,
          name: sp.company_name,
          address: [sp.city, sp.state].filter(Boolean).join(", ") || null,
          email: null,
          phone: null,
          supplierId: sp.id,
          logoUrl: sp.logo_url,
        }));
        // Registered suppliers first, then the imported directory.
        setVendors([...registered, ...((vendorData as Vendor[]) ?? [])]);
      }
      setLoading(false);
    };
    load();
  }, [categoryId, subId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-48 bg-muted rounded" />
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <a href="#categories" onClick={goToAnchor("#categories")}>All Categories</a>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/categories/${catSlug}`}>{catName}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{subName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{subName}</h1>
          <p className="text-muted-foreground mt-1">{vendors.length} vendor{vendors.length !== 1 ? "s" : ""} listed</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {vendors.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Store className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg">No vendors listed yet.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link to={`/categories/${catSlug}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to {catName}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {vendors.map((v) => (
                <Card
                  key={v.id}
                  className={`hover:shadow-lg transition-shadow duration-300 border-border ${canViewNames ? '' : 'cursor-pointer'}`}
                  onClick={canViewNames ? undefined : () => setGateOpen(true)}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {v.logoUrl && canViewNames
                          ? <img src={v.logoUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
                          : <Store className="w-5 h-5 text-primary" />}
                      </div>
                      {canViewNames ? (
                        <h3 className="font-semibold text-foreground text-base">{v.name}</h3>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setGateOpen(true)}
                          className="text-left font-semibold text-foreground text-base hover:text-primary transition-colors"
                          title={user ? 'Choose a plan to see the full name' : 'Sign up to see the full name'}
                        >
                          <h3><MaskedVendorName name={v.name} /></h3>
                        </button>
                      )}
                    </div>

                    {v.supplierId && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-foreground">
                        <BadgeCheck className="w-3.5 h-3.5 text-primary" /> Verified FoodAdda supplier
                      </span>
                    )}

                    {v.supplierId ? (
                      <>
                        {canViewNames && v.address && (
                          <p className="text-sm text-muted-foreground flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {v.address}
                          </p>
                        )}
                        {canViewNames ? (
                          <Link
                            to={`/suppliers/${v.supplierId}`}
                            className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                          >
                            View products & contact <ArrowRight className="w-4 h-4" />
                          </Link>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                            <Lock className="w-3.5 h-3.5 shrink-0" />
                            {user ? 'Choose a plan to view contact details' : 'Sign in to view contact details'}
                          </div>
                        )}
                      </>
                    ) : canViewNames ? (
                      <>
                        {v.address && (
                          <p className="text-sm text-muted-foreground flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {v.address}
                          </p>
                        )}
                        {v.email && (
                          <a href={`mailto:${v.email}`} onClick={(e) => e.stopPropagation()} className="text-sm text-primary hover:underline flex items-center gap-2">
                            <Mail className="w-4 h-4 shrink-0" /> {v.email}
                          </a>
                        )}
                        {v.phone && (
                          <a href={`tel:${v.phone}`} onClick={(e) => e.stopPropagation()} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
                            <Phone className="w-4 h-4 shrink-0" /> {v.phone}
                          </a>
                        )}
                      </>
                    ) : (
                      (v.address || v.email || v.phone) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                          <Lock className="w-3.5 h-3.5 shrink-0" />
                          {user ? 'Choose a plan to view contact details' : 'Sign in to view contact details'}
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <VendorAccessDialog open={gateOpen} onOpenChange={setGateOpen} reason={nameGateReason} />
      <RfqBand title={`Need ${subName}?`} text="Post your RFQ free and our sourcing team will connect you with suitable suppliers." />
      <Footer />
    </div>
  );
};

export default SubCategoryDetail;

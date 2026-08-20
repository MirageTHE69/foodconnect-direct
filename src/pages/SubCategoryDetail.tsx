
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Mail, Phone, Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { supabase } from "@/integrations/supabase/client";
import { isUuid } from "@/lib/utils";
import { useAnchorNav } from "@/hooks/useAnchorNav";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

interface Vendor {
  id: string;
  name: string;
  address: string | null;
  email: string | null;
  phone: string | null;
}

const SubCategoryDetail = () => {
  const { categoryId, subId } = useParams<{ categoryId: string; subId: string }>();
  const goToAnchor = useAnchorNav();
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
        const { data: vendorData } = await supabase
          .from("directory_vendors")
          .select("*")
          .eq("sub_category_id", subData.id);
        if (vendorData) setVendors(vendorData as Vendor[]);
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
                <Card key={v.id} className="hover:shadow-lg transition-shadow duration-300 border-border">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Store className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground text-base">{v.name}</h3>
                    </div>

                    {v.address && (
                      <p className="text-sm text-muted-foreground flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {v.address}
                      </p>
                    )}
                    {v.email && (
                      <a href={`mailto:${v.email}`} className="text-sm text-primary hover:underline flex items-center gap-2">
                        <Mail className="w-4 h-4 shrink-0" /> {v.email}
                      </a>
                    )}
                    {v.phone && (
                      <a href={`tel:${v.phone}`} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
                        <Phone className="w-4 h-4 shrink-0" /> {v.phone}
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SubCategoryDetail;

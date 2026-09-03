import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/shared/ProductCard';
import { SaveButton } from '@/components/buyer/SaveButton';
import { GatedDetail } from '@/components/shared/GatedDetail';
import { useSavedItems } from '@/hooks/useSavedItems';
import { useEnquiries } from '@/hooks/useEnquiries';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useSupplierUnlock } from '@/hooks/useSupplierUnlock';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ChefHat,
  MapPin,
  Globe,
  CheckCircle,
  Package,
  MessageSquare,
  Loader2,
  ArrowLeft,
  Award,
  Store,
  MessageCircle,
  User,
  Phone,
  Mail,
  Factory,
  Boxes,
  Ship,
} from 'lucide-react';

interface SupplierDetail {
  id: string;
  company_name: string;
  business_description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  city: string | null;
  state: string | null;
  website: string | null;
  certifications: string[] | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  contact_person_name: string | null;
  phone: string | null;
  email: string | null;
  moq: string | null;
  export_capability: string | null;
  manufacturing_capability: string | null;
}

interface ProductItem {
  id: string;
  name: string;
  description: string | null;
  images: string[] | null;
  product_categories: { name: string } | null;
}

export default function SupplierDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [supplier, setSupplier] = useState<SupplierDetail | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [enquiryDialogOpen, setEnquiryDialogOpen] = useState(false);
  const [enquirySubject, setEnquirySubject] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [sendingEnquiry, setSendingEnquiry] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  const { isSupplierSaved, toggleSaveSupplier, isProductSaved, toggleSaveProduct } = useSavedItems();
  const { createEnquiry } = useEnquiries();
  const { startConversation } = useChat();
  const { can, tierLabel } = usePermissions();
  const { unlocked, unlocking, unlock } = useSupplierUnlock(id ?? null);

  useEffect(() => {
    if (id) {
      fetchSupplierDetails(id);
    }
  }, [id]);

  const fetchSupplierDetails = async (supplierId: string) => {
    setLoading(true);
    try {
      // Fetch supplier
      const { data: supplierData, error: supplierError } = await supabase
        .from('supplier_profiles')
        .select('*')
        .eq('id', supplierId)
        .single();

      if (supplierError) throw supplierError;
      setSupplier(supplierData);

      // Fetch supplier's products
      const { data: productsData } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          images,
          product_categories (name)
        `)
        .eq('supplier_id', supplierId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching supplier:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactClick = async () => {
    if (!user) { navigate('/auth'); return; }
    const access = can('send_enquiry');
    if (access === 'none') { navigate('/subscribe'); return; }
    if (access === 'limited' && !unlocked) { await unlock(); return; }
    setEnquiryDialogOpen(true);
  };

  const contactButtonLabel = () => {
    if (!user) return 'Contact Supplier';
    const access = can('send_enquiry');
    if (access === 'none') return 'Upgrade to Contact';
    if (access === 'limited' && !unlocked) return unlocking ? 'Unlocking...' : 'Unlock to Contact';
    return 'Contact Supplier';
  };

  const handleSendEnquiry = async () => {
    if (!supplier || !enquirySubject.trim() || !enquiryMessage.trim()) return;

    setSendingEnquiry(true);
    const { error } = await createEnquiry(supplier.id, enquirySubject, enquiryMessage);
    setSendingEnquiry(false);

    if (!error) {
      setEnquiryDialogOpen(false);
      setEnquirySubject('');
      setEnquiryMessage('');
    }
  };

  const handleStartChat = async () => {
    if (!supplier) return;
    
    setStartingChat(true);
    const { data, error } = await startConversation(supplier.id);
    setStartingChat(false);
    
    if (!error && data) {
      navigate(`/chat/${data.id}`);
    }
  };

  const canChat = user && userRole === 'buyer';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Store className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Supplier Not Found</h1>
        <p className="text-muted-foreground mb-4">The supplier you're looking for doesn't exist</p>
        <Button asChild>
          <Link to="/suppliers">Browse Suppliers</Link>
        </Button>
      </div>
    );
  }

  const location = [supplier.city, supplier.state].filter(Boolean).join(', ');
  const isVerified = supplier.verification_status === 'verified';

  const catalogueAccess = can('full_catalogue');
  const catalogueUnlocked = catalogueAccess === 'full' || (catalogueAccess === 'limited' && unlocked);
  const CATALOGUE_PREVIEW_COUNT = 4;
  const visibleProducts = catalogueUnlocked ? products : products.slice(0, CATALOGUE_PREVIEW_COUNT);
  const hiddenProductCount = products.length - visibleProducts.length;

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
                <Button variant="ghost">Products</Button>
              </Link>
              <Link to="/suppliers">
                <Button variant="ghost">Suppliers</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Cover Image */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary/20 to-primary/5">
          {supplier.cover_image_url && (
            <img
              src={supplier.cover_image_url}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>

        <div className="container mx-auto px-4">
          {/* Supplier Info */}
          <div className="relative -mt-16 mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Logo */}
              <div className="w-32 h-32 rounded-xl overflow-hidden bg-background shadow-lg border flex-shrink-0">
                {supplier.logo_url ? (
                  <img
                    src={supplier.logo_url}
                    alt={supplier.company_name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Store className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 pt-4 md:pt-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl md:text-3xl font-bold">{supplier.company_name}</h1>
                      {isVerified && (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                      {location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {location}
                        </span>
                      )}
                      {supplier.website && (
                        <GatedDetail
                          access={can('website')}
                          unlocked={unlocked}
                          onUnlock={unlock}
                          unlocking={unlocking}
                          icon={<Globe className="h-4 w-4" />}
                          label="Website"
                        >
                          <a
                            href={supplier.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            <Globe className="h-4 w-4" />
                            Website
                          </a>
                        </GatedDetail>
                      )}
                      <span className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        {products.length} products
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <SaveButton
                      isSaved={isSupplierSaved(supplier.id)}
                      onToggle={() => toggleSaveSupplier(supplier.id)}
                      variant="outline"
                    />
                    {canChat && (
                      <Button 
                        variant="outline" 
                        onClick={handleStartChat}
                        disabled={startingChat}
                      >
                        {startingChat ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <MessageCircle className="h-4 w-4 mr-2" />
                        )}
                        Chat
                      </Button>
                    )}
                    <Button onClick={handleContactClick} disabled={unlocking}>
                      {unlocking ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <MessageSquare className="h-4 w-4 mr-2" />
                      )}
                      {contactButtonLabel()}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="products">
                <TabsList>
                  <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
                  <TabsTrigger value="about">About</TabsTrigger>
                </TabsList>
                
                <TabsContent value="products" className="mt-6">
                  {products.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground">No products listed yet</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {visibleProducts.map((product) => (
                          <ProductCard
                            key={product.id}
                            id={product.id}
                            name={product.name}
                            description={product.description}
                            images={product.images}
                            categoryName={product.product_categories?.name}
                            showSaveButton={true}
                            isSaved={isProductSaved(product.id)}
                            onSaveToggle={() => toggleSaveProduct(product.id)}
                          />
                        ))}
                      </div>
                      {hiddenProductCount > 0 && (
                        <div className="text-center mt-6 p-4 rounded-lg border border-dashed">
                          <p className="text-sm text-muted-foreground mb-2">
                            {hiddenProductCount} more product{hiddenProductCount !== 1 ? 's' : ''} in the full catalogue
                          </p>
                          {catalogueAccess === 'limited' ? (
                            <Button size="sm" onClick={unlock} disabled={unlocking}>
                              {unlocking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                              Unlock Full Catalogue
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => navigate(user ? '/subscribe' : '/auth')}>
                              Upgrade to View
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="about" className="mt-6">
                  <Card>
                    <CardContent className="pt-6">
                      {supplier.business_description ? (
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {supplier.business_description}
                        </p>
                      ) : (
                        <p className="text-muted-foreground italic">
                          No description provided
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Certifications */}
              {supplier.certifications && supplier.certifications.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold flex items-center gap-2 mb-4">
                      <Award className="h-5 w-5 text-primary" />
                      Certifications
                    </h3>
                    {can('view_certifications') === 'summary' ? (
                      <p className="text-sm text-muted-foreground">
                        {supplier.certifications.length} certification{supplier.certifications.length !== 1 ? 's' : ''} — sign in to view details
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {supplier.certifications.map((cert) => (
                          <Badge key={cert} variant="secondary">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Business Details (contact, MOQ, export/manufacturing capability) */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 mb-1">
                    <Store className="h-5 w-5 text-primary" />
                    Business Details
                  </h3>
                  <GatedDetail
                    access={can('contact_person')}
                    unlocked={unlocked}
                    onUnlock={unlock}
                    unlocking={unlocking}
                    icon={<User className="h-4 w-4 text-muted-foreground shrink-0" />}
                    label="Contact Person"
                  >
                    {supplier.contact_person_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{supplier.contact_person_name}</span>
                      </div>
                    )}
                  </GatedDetail>
                  <GatedDetail
                    access={can('phone_number')}
                    unlocked={unlocked}
                    onUnlock={unlock}
                    unlocking={unlocking}
                    icon={<Phone className="h-4 w-4 text-muted-foreground shrink-0" />}
                    label="Phone Number"
                  >
                    {supplier.phone && (
                      <a href={`tel:${supplier.phone}`} className="flex items-center gap-2 text-sm hover:text-primary">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{supplier.phone}</span>
                      </a>
                    )}
                  </GatedDetail>
                  <GatedDetail
                    access={can('email')}
                    unlocked={unlocked}
                    onUnlock={unlock}
                    unlocking={unlocking}
                    icon={<Mail className="h-4 w-4 text-muted-foreground shrink-0" />}
                    label="Email"
                  >
                    {supplier.email && (
                      <a href={`mailto:${supplier.email}`} className="flex items-center gap-2 text-sm hover:text-primary break-all">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{supplier.email}</span>
                      </a>
                    )}
                  </GatedDetail>
                  <GatedDetail
                    access={can('moq')}
                    unlocked={unlocked}
                    onUnlock={unlock}
                    unlocking={unlocking}
                    icon={<Boxes className="h-4 w-4 text-muted-foreground shrink-0" />}
                    label="MOQ"
                  >
                    {supplier.moq && (
                      <div className="flex items-center gap-2 text-sm">
                        <Boxes className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>MOQ: {supplier.moq}</span>
                      </div>
                    )}
                  </GatedDetail>
                  <GatedDetail
                    access={can('manufacturing_capability')}
                    unlocked={unlocked}
                    onUnlock={unlock}
                    unlocking={unlocking}
                    icon={<Factory className="h-4 w-4 text-muted-foreground shrink-0" />}
                    label="Manufacturing Capability"
                    summary={supplier.manufacturing_capability ? 'Manufacturing details available — sign in to view' : undefined}
                  >
                    {supplier.manufacturing_capability && (
                      <div className="flex items-start gap-2 text-sm">
                        <Factory className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span>{supplier.manufacturing_capability}</span>
                      </div>
                    )}
                  </GatedDetail>
                  <GatedDetail
                    access={can('export_capabilities')}
                    unlocked={unlocked}
                    onUnlock={unlock}
                    unlocking={unlocking}
                    icon={<Ship className="h-4 w-4 text-muted-foreground shrink-0" />}
                    label="Export Capabilities"
                    summary={supplier.export_capability ? 'Exports available — sign in to view details' : undefined}
                  >
                    {supplier.export_capability && (
                      <div className="flex items-start gap-2 text-sm">
                        <Ship className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span>{supplier.export_capability}</span>
                      </div>
                    )}
                  </GatedDetail>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  {canChat && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleStartChat}
                      disabled={startingChat}
                    >
                      {startingChat ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <MessageCircle className="h-4 w-4 mr-2" />
                      )}
                      Start Chat
                    </Button>
                  )}
                  <Button
                    className="w-full"
                    onClick={handleContactClick}
                    disabled={unlocking}
                  >
                    {unlocking ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <MessageSquare className="h-4 w-4 mr-2" />
                    )}
                    {contactButtonLabel() === 'Contact Supplier' ? 'Send Enquiry' : contactButtonLabel()}
                  </Button>
                  {can('save_suppliers') === 'none' ? (
                    <Button variant="outline" className="w-full" onClick={() => navigate(user ? '/subscribe' : '/auth')}>
                      Sign in to Save
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => toggleSaveSupplier(supplier.id)}
                    >
                      {isSupplierSaved(supplier.id) ? 'Remove from Saved' : 'Save Supplier'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Enquiry Dialog */}
      <Dialog open={enquiryDialogOpen} onOpenChange={setEnquiryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact {supplier.company_name}</DialogTitle>
            <DialogDescription>
              Send an enquiry to this supplier. They will respond via email.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={enquirySubject}
                onChange={(e) => setEnquirySubject(e.target.value)}
                placeholder="What is your enquiry about?"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={enquiryMessage}
                onChange={(e) => setEnquiryMessage(e.target.value)}
                placeholder="Describe what you're looking for..."
                rows={4}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEnquiryDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendEnquiry}
              disabled={sendingEnquiry || !enquirySubject.trim() || !enquiryMessage.trim()}
            >
              {sendingEnquiry ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Enquiry'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

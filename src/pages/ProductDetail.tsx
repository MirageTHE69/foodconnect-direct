import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/shared/ProductCard';
import { SaveButton } from '@/components/buyer/SaveButton';
import { useSavedItems } from '@/hooks/useSavedItems';
import { useEnquiries } from '@/hooks/useEnquiries';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  ChefHat,
  MapPin,
  CheckCircle,
  Package,
  MessageSquare,
  Loader2,
  ArrowLeft,
  Store,
  Tag,
  MessageCircle,
} from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';

interface ProductDetail {
  id: string;
  name: string;
  description: string | null;
  images: string[] | null;
  tags: string[] | null;
  specifications: Json | null;
  category_id: string | null;
  supplier_profiles: {
    id: string;
    company_name: string;
    logo_url: string | null;
    city: string | null;
    state: string | null;
    verification_status: string;
  } | null;
  product_categories: {
    id: string;
    name: string;
  } | null;
}

interface RelatedProduct {
  id: string;
  name: string;
  description: string | null;
  images: string[] | null;
  supplier_profiles: {
    id: string;
    company_name: string;
  } | null;
  product_categories: {
    name: string;
  } | null;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [enquiryDialogOpen, setEnquiryDialogOpen] = useState(false);
  const [enquirySubject, setEnquirySubject] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [sendingEnquiry, setSendingEnquiry] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  const { isProductSaved, toggleSaveProduct, isSupplierSaved, toggleSaveSupplier } = useSavedItems();
  const { createEnquiry } = useEnquiries();
  const { startConversation } = useChat();

  useEffect(() => {
    if (id) {
      fetchProductDetails(id);
    }
  }, [id]);

  const fetchProductDetails = async (productId: string) => {
    setLoading(true);
    try {
      // Fetch product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          supplier_profiles (
            id,
            company_name,
            logo_url,
            city,
            state,
            verification_status
          ),
          product_categories (
            id,
            name
          )
        `)
        .eq('id', productId)
        .single();

      if (productError) throw productError;
      setProduct(productData);

      // Fetch related products (same category, exclude current)
      if (productData.category_id) {
        const { data: relatedData } = await supabase
          .from('products')
          .select(`
            id,
            name,
            description,
            images,
            supplier_profiles (
              id,
              company_name
            ),
            product_categories (
              name
            )
          `)
          .eq('category_id', productData.category_id)
          .eq('status', 'approved')
          .neq('id', productId)
          .limit(4);

        setRelatedProducts(relatedData || []);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEnquiry = async () => {
    if (!product?.supplier_profiles || !enquirySubject.trim() || !enquiryMessage.trim()) return;

    setSendingEnquiry(true);
    const { error } = await createEnquiry(
      product.supplier_profiles.id,
      enquirySubject,
      enquiryMessage,
      product.id
    );
    setSendingEnquiry(false);

    if (!error) {
      setEnquiryDialogOpen(false);
      setEnquirySubject('');
      setEnquiryMessage('');
    }
  };

  const handleStartChat = async () => {
    if (!product?.supplier_profiles) return;
    
    setStartingChat(true);
    const { data, error } = await startConversation(product.supplier_profiles.id);
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

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
        <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist</p>
        <Button asChild>
          <Link to="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  const specifications = product.specifications && typeof product.specifications === 'object'
    ? Object.entries(product.specifications as Record<string, string>)
    : [];
  
  const supplier = product.supplier_profiles;
  const supplierLocation = supplier ? [supplier.city, supplier.state].filter(Boolean).join(', ') : '';
  const isVerified = supplier?.verification_status === 'verified';

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

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-foreground">Products</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <div>
            {product.images && product.images.length > 0 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {product.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={image}
                          alt={`${product.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {product.images.length > 1 && (
                  <>
                    <CarouselPrevious />
                    <CarouselNext />
                  </>
                )}
              </Carousel>
            ) : (
              <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                <Package className="h-24 w-24 text-muted-foreground/50" />
              </div>
            )}
            
            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border"
                  >
                    <img
                      src={image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Category */}
            <div>
              {product.product_categories && (
                <Badge variant="secondary" className="mb-2">
                  {product.product_categories.name}
                </Badge>
              )}
              <h1 className="text-3xl font-bold">{product.name}</h1>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground">{product.description}</p>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Specifications */}
            {specifications.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Specifications</h3>
                  <div className="space-y-2">
                    {specifications.map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{key}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Supplier Card */}
            {supplier && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {supplier.logo_url ? (
                        <img
                          src={supplier.logo_url}
                          alt={supplier.company_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Store className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/suppliers/${supplier.id}`}
                          className="font-semibold hover:text-primary"
                        >
                          {supplier.company_name}
                        </Link>
                        {isVerified && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      {supplierLocation && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {supplierLocation}
                        </p>
                      )}
                    </div>
                    <SaveButton
                      isSaved={isSupplierSaved(supplier.id)}
                      onToggle={() => toggleSaveSupplier(supplier.id)}
                      size="sm"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button className="flex-1" onClick={() => setEnquiryDialogOpen(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Supplier
              </Button>
              {canChat && (
                <Button 
                  variant="outline" 
                  onClick={handleStartChat}
                  disabled={startingChat}
                >
                  {startingChat ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                </Button>
              )}
              <SaveButton
                isSaved={isProductSaved(product.id)}
                onToggle={() => toggleSaveProduct(product.id)}
                variant="outline"
              />
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relProduct) => (
                <ProductCard
                  key={relProduct.id}
                  id={relProduct.id}
                  name={relProduct.name}
                  description={relProduct.description}
                  images={relProduct.images}
                  supplierName={relProduct.supplier_profiles?.company_name}
                  supplierId={relProduct.supplier_profiles?.id}
                  categoryName={relProduct.product_categories?.name}
                  isSaved={isProductSaved(relProduct.id)}
                  onSaveToggle={() => toggleSaveProduct(relProduct.id)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Enquiry Dialog */}
      <Dialog open={enquiryDialogOpen} onOpenChange={setEnquiryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enquire About This Product</DialogTitle>
            <DialogDescription>
              Send an enquiry to {supplier?.company_name} about {product.name}
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

 import { useState } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useToast } from '@/hooks/use-toast';
 
 interface ScanResult {
   identified: boolean;
   product: {
     name: string;
     description: string;
     keywords: string[];
   };
   confidence: number;
 }
 
 interface ProductWithSupplier {
   id: string;
   name: string;
   description: string | null;
   images: string[] | null;
   supplier_profiles: {
     id: string;
     company_name: string;
     logo_url: string | null;
     city: string | null;
     state: string | null;
     user_id: string;
   } | null;
 }
 
 export function useProductScanner() {
   const [isScanning, setIsScanning] = useState(false);
   const [isSearching, setIsSearching] = useState(false);
   const [scanResult, setScanResult] = useState<ScanResult | null>(null);
   const [matchingProducts, setMatchingProducts] = useState<ProductWithSupplier[]>([]);
   const [error, setError] = useState<string | null>(null);
   const { toast } = useToast();
 
   const scanImage = async (imageBase64: string) => {
     setIsScanning(true);
     setError(null);
     setScanResult(null);
     setMatchingProducts([]);
 
     try {
       const response = await fetch(
         `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-product`,
         {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
           },
           body: JSON.stringify({ image: imageBase64 }),
         }
       );
 
       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.error || 'Failed to scan image');
       }
 
       const result: ScanResult = await response.json();
       setScanResult(result);
 
       if (result.identified && result.product.keywords.length > 0) {
         await searchProducts(result.product.keywords, result.product.name);
       }
 
       return result;
     } catch (err) {
       const message = err instanceof Error ? err.message : 'Failed to scan image';
       setError(message);
       toast({
         title: 'Scan Failed',
         description: message,
         variant: 'destructive',
       });
       return null;
     } finally {
       setIsScanning(false);
     }
   };
 
   const searchProducts = async (keywords: string[], productName: string) => {
     setIsSearching(true);
 
     try {
       // Build search query using keywords
       const searchTerms = [productName, ...keywords].map(k => k.toLowerCase());
       
       // Search products by name and description using ILIKE
       const { data: products, error: searchError } = await supabase
         .from('products')
         .select(`
           id,
           name,
           description,
           images,
           supplier_profiles!inner (
             id,
             company_name,
             logo_url,
             city,
             state,
             user_id
           )
         `)
         .eq('status', 'approved')
         .or(
           searchTerms
             .slice(0, 5) // Limit to first 5 terms
             .map(term => `name.ilike.%${term}%,description.ilike.%${term}%`)
             .join(',')
         )
         .limit(10);
 
       if (searchError) {
         console.error('Search error:', searchError);
         throw searchError;
       }
 
       // Also search by tags if available
       const { data: tagProducts, error: tagError } = await supabase
         .from('products')
         .select(`
           id,
           name,
           description,
           images,
           supplier_profiles!inner (
             id,
             company_name,
             logo_url,
             city,
             state,
             user_id
           )
         `)
         .eq('status', 'approved')
         .overlaps('tags', keywords)
         .limit(10);
 
       if (tagError) {
         console.error('Tag search error:', tagError);
       }
 
       // Combine and deduplicate results
       const allProducts = [...(products || []), ...(tagProducts || [])];
       const uniqueProducts = allProducts.reduce((acc, product) => {
         if (!acc.find(p => p.id === product.id)) {
           acc.push(product);
         }
         return acc;
       }, [] as ProductWithSupplier[]);
 
       setMatchingProducts(uniqueProducts);
     } catch (err) {
       console.error('Product search failed:', err);
     } finally {
       setIsSearching(false);
     }
   };
 
   const reset = () => {
     setScanResult(null);
     setMatchingProducts([]);
     setError(null);
   };
 
   return {
     isScanning,
     isSearching,
     scanResult,
     matchingProducts,
     error,
     scanImage,
     reset,
   };
 }
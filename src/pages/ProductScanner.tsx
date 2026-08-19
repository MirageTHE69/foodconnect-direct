 import { useState, useRef, useCallback } from 'react';
 import { Link, useNavigate } from 'react-router-dom';
 import { useProductScanner } from '@/hooks/useProductScanner';
 import { useAuth } from '@/hooks/useAuth';
 import Navbar from '@/components/landing/Navbar';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Skeleton } from '@/components/ui/skeleton';
 import { 
   Camera, 
   Upload, 
   ScanLine, 
   X, 
   Building2, 
   MapPin, 
   MessageSquare,
   ArrowRight,
   ImageIcon,
   Sparkles
 } from 'lucide-react';
 
 export default function ProductScanner() {
   const [imagePreview, setImagePreview] = useState<string | null>(null);
   const [isCameraActive, setIsCameraActive] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const videoRef = useRef<HTMLVideoElement>(null);
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const streamRef = useRef<MediaStream | null>(null);
   const navigate = useNavigate();
   const { user, userRole } = useAuth();
 
   const {
     isScanning,
     isSearching,
     scanResult,
     matchingProducts,
     error,
     scanImage,
     reset,
   } = useProductScanner();
 
   const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
       const reader = new FileReader();
       reader.onloadend = () => {
         const base64 = reader.result as string;
         setImagePreview(base64);
       };
       reader.readAsDataURL(file);
     }
   }, []);
 
   const startCamera = async () => {
     try {
       const stream = await navigator.mediaDevices.getUserMedia({
         video: { facingMode: 'environment' }
       });
       streamRef.current = stream;
       if (videoRef.current) {
         videoRef.current.srcObject = stream;
       }
       setIsCameraActive(true);
     } catch (err) {
       console.error('Failed to access camera:', err);
     }
   };
 
   const stopCamera = () => {
     if (streamRef.current) {
       streamRef.current.getTracks().forEach(track => track.stop());
       streamRef.current = null;
     }
     setIsCameraActive(false);
   };
 
   const capturePhoto = () => {
     if (videoRef.current && canvasRef.current) {
       const video = videoRef.current;
       const canvas = canvasRef.current;
       canvas.width = video.videoWidth;
       canvas.height = video.videoHeight;
       const ctx = canvas.getContext('2d');
       if (ctx) {
         ctx.drawImage(video, 0, 0);
         const base64 = canvas.toDataURL('image/jpeg', 0.8);
         setImagePreview(base64);
         stopCamera();
       }
     }
   };
 
   const handleScan = async () => {
     if (imagePreview) {
       await scanImage(imagePreview);
     }
   };
 
   const handleReset = () => {
     setImagePreview(null);
     reset();
     if (fileInputRef.current) {
       fileInputRef.current.value = '';
     }
   };
 
   const handleContactSupplier = (supplierId: string) => {
     if (!user) {
       navigate('/auth');
       return;
     }
     navigate(`/suppliers/${supplierId}`);
   };
 
   return (
     <div className="min-h-screen bg-background">
       <Navbar />
       
       <main className="pt-24 pb-16">
         <div className="container mx-auto px-4 max-w-4xl">
           {/* Header */}
           <div className="text-center mb-8">
             <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
               <Sparkles className="h-4 w-4 text-primary" />
               <span className="text-sm font-medium text-primary">AI-Powered</span>
             </div>
             <h1 className="text-3xl md:text-4xl font-bold mb-4">Product Scanner</h1>
             <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
               Take a photo or upload an image of any food product. Our AI will identify it and connect you with suppliers.
             </p>
           </div>
 
           {/* Scanner Card */}
           <Card className="mb-8">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <ScanLine className="h-5 w-5 text-primary" />
                 Scan a Product
               </CardTitle>
               <CardDescription>
                 Upload an image or use your camera to scan a food product
               </CardDescription>
             </CardHeader>
             <CardContent>
               {!imagePreview && !isCameraActive && (
                 <div className="grid sm:grid-cols-2 gap-4">
                   {/* Upload Button */}
                   <label className="cursor-pointer">
                     <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors">
                       <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                       <p className="font-medium mb-1">Upload Image</p>
                       <p className="text-sm text-muted-foreground">Click to select a file</p>
                     </div>
                     <input
                       ref={fileInputRef}
                       type="file"
                       accept="image/*"
                       className="hidden"
                       onChange={handleFileUpload}
                     />
                   </label>
 
                   {/* Camera Button */}
                   <button
                     onClick={startCamera}
                     className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors"
                   >
                     <Camera className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                     <p className="font-medium mb-1">Use Camera</p>
                     <p className="text-sm text-muted-foreground">Take a photo directly</p>
                   </button>
                 </div>
               )}
 
               {/* Camera View */}
               {isCameraActive && (
                 <div className="relative">
                   <video
                     ref={videoRef}
                     autoPlay
                     playsInline
                     className="w-full rounded-xl"
                   />
                   <canvas ref={canvasRef} className="hidden" />
                   <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                     <Button variant="secondary" onClick={stopCamera}>
                       <X className="h-4 w-4 mr-2" />
                       Cancel
                     </Button>
                     <Button onClick={capturePhoto}>
                       <Camera className="h-4 w-4 mr-2" />
                       Capture
                     </Button>
                   </div>
                 </div>
               )}
 
               {/* Image Preview */}
               {imagePreview && !isCameraActive && (
                 <div className="space-y-4">
                   <div className="relative aspect-video bg-muted rounded-xl overflow-hidden">
                     <img
                       src={imagePreview}
                       alt="Product preview"
                       className="w-full h-full object-contain"
                     />
                     <button
                       onClick={handleReset}
                       className="absolute top-2 right-2 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                     >
                       <X className="h-4 w-4" />
                     </button>
                   </div>
                   
                   {!scanResult && (
                     <Button 
                       onClick={handleScan} 
                       disabled={isScanning}
                       className="w-full"
                       size="lg"
                     >
                       {isScanning ? (
                         <>
                           <ScanLine className="h-4 w-4 mr-2 animate-pulse" />
                           Analyzing...
                         </>
                       ) : (
                         <>
                           <ScanLine className="h-4 w-4 mr-2" />
                           Scan Product
                         </>
                       )}
                     </Button>
                   )}
                 </div>
               )}
 
               {/* Error State */}
               {error && (
                 <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg">
                   {error}
                 </div>
               )}
             </CardContent>
           </Card>
 
           {/* Scan Results */}
           {scanResult && (
             <Card className="mb-8">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Sparkles className="h-5 w-5 text-primary" />
                   AI Identification Result
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 {scanResult.identified ? (
                   <div className="space-y-4">
                     <div className="flex items-start gap-4">
                       <div className="p-3 bg-primary/10 rounded-lg">
                         <ImageIcon className="h-6 w-6 text-primary" />
                       </div>
                       <div className="flex-1">
                         <h3 className="text-xl font-semibold mb-1">
                           {scanResult.product.name}
                         </h3>
                         <p className="text-muted-foreground mb-3">
                           {scanResult.product.description}
                         </p>
                         <div className="flex flex-wrap gap-2">
                           {scanResult.product.keywords.map((keyword, index) => (
                             <Badge key={index} variant="secondary">
                               {keyword}
                             </Badge>
                           ))}
                         </div>
                       </div>
                       <Badge variant="outline" className="shrink-0">
                         {Math.round(scanResult.confidence * 100)}% match
                       </Badge>
                     </div>
 
                     <Button variant="outline" onClick={handleReset} className="w-full">
                       Scan Another Product
                     </Button>
                   </div>
                 ) : (
                   <div className="text-center py-8">
                     <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                     <p className="text-lg font-medium mb-2">Could not identify the product</p>
                     <p className="text-muted-foreground mb-4">
                       {scanResult.product.description || 'Please try with a clearer image of a food product.'}
                     </p>
                     <Button onClick={handleReset}>Try Again</Button>
                   </div>
                 )}
               </CardContent>
             </Card>
           )}
 
           {/* Matching Products */}
           {(isSearching || matchingProducts.length > 0) && (
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Building2 className="h-5 w-5 text-primary" />
                   Matching Suppliers
                 </CardTitle>
                 <CardDescription>
                   {matchingProducts.length > 0
                     ? `Found ${matchingProducts.length} product${matchingProducts.length > 1 ? 's' : ''} from our suppliers`
                     : 'Searching for matching products...'}
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 {isSearching ? (
                   <div className="space-y-4">
                     {[1, 2, 3].map((i) => (
                       <div key={i} className="flex gap-4 p-4 border rounded-lg">
                         <Skeleton className="w-20 h-20 rounded-lg shrink-0" />
                         <div className="flex-1 space-y-2">
                           <Skeleton className="h-5 w-3/4" />
                           <Skeleton className="h-4 w-1/2" />
                           <Skeleton className="h-4 w-1/3" />
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : matchingProducts.length > 0 ? (
                   <div className="space-y-4">
                     {matchingProducts.map((product) => (
                       <div 
                         key={product.id} 
                         className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                       >
                         {/* Product Image */}
                         <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                           {product.images?.[0] ? (
                             <img
                               src={product.images[0]}
                               alt={product.name}
                               loading="lazy"
                               className="w-full h-full object-cover"
                             />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center">
                               <ImageIcon className="h-8 w-8 text-muted-foreground" />
                             </div>
                           )}
                         </div>
 
                         {/* Product Info */}
                         <div className="flex-1 min-w-0">
                           <h4 className="font-semibold truncate">{product.name}</h4>
                           {product.description && (
                             <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                               {product.description}
                             </p>
                           )}
                           
                           {product.supplier_profiles && (
                             <div className="flex items-center gap-2 text-sm">
                               <Building2 className="h-4 w-4 text-muted-foreground" />
                               <span className="font-medium">
                                 {product.supplier_profiles.company_name}
                               </span>
                               {(product.supplier_profiles.city || product.supplier_profiles.state) && (
                                 <>
                                   <span className="text-muted-foreground">•</span>
                                   <MapPin className="h-3 w-3 text-muted-foreground" />
                                   <span className="text-muted-foreground">
                                     {[product.supplier_profiles.city, product.supplier_profiles.state]
                                       .filter(Boolean)
                                       .join(', ')}
                                   </span>
                                 </>
                               )}
                             </div>
                           )}
                         </div>
 
                         {/* Actions */}
                         <div className="flex flex-col gap-2 shrink-0">
                           <Button
                             size="sm"
                             onClick={() => product.supplier_profiles && handleContactSupplier(product.supplier_profiles.id)}
                           >
                             <MessageSquare className="h-4 w-4 mr-1" />
                             Contact
                           </Button>
                           <Link to={`/products/${product.id}`}>
                             <Button size="sm" variant="outline" className="w-full">
                               View
                               <ArrowRight className="h-4 w-4 ml-1" />
                             </Button>
                           </Link>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : scanResult?.identified ? (
                   <div className="text-center py-8">
                     <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                     <p className="text-lg font-medium mb-2">No matching suppliers found</p>
                     <p className="text-muted-foreground mb-4">
                       We couldn't find any suppliers offering this product yet.
                     </p>
                     <Link to="/suppliers">
                       <Button variant="outline">Browse All Suppliers</Button>
                     </Link>
                   </div>
                 ) : null}
               </CardContent>
             </Card>
           )}
         </div>
       </main>
     </div>
   );
 }
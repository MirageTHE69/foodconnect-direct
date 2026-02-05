 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
 };
 
 serve(async (req) => {
   // Handle CORS preflight requests
   if (req.method === 'OPTIONS') {
     return new Response('ok', { headers: corsHeaders });
   }
 
   try {
     const { image } = await req.json();
     
     if (!image) {
       return new Response(
         JSON.stringify({ error: 'No image provided' }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
     if (!LOVABLE_API_KEY) {
       console.error("LOVABLE_API_KEY is not configured");
       return new Response(
         JSON.stringify({ error: 'AI service not configured' }),
         { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     console.log("Processing image for product identification...");
 
     const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
       method: "POST",
       headers: {
         Authorization: `Bearer ${LOVABLE_API_KEY}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         model: "google/gemini-3-flash-preview",
         messages: [
           {
             role: "system",
             content: `You are a food product identification expert. Analyze the image and identify the food product shown. 
 Return a JSON response with the following structure:
 {
   "identified": true/false,
   "product": {
     "name": "Product name in English",
     "description": "Brief description of the product",
     "keywords": ["keyword1", "keyword2", "keyword3"] // 3-5 search keywords for finding similar products
   },
   "confidence": 0.0-1.0
 }
 
 If you cannot identify a food product in the image, set "identified" to false and provide a helpful message in the description.
 Focus on identifying food ingredients, packaged food products, spices, grains, vegetables, fruits, dairy, meat, and other food items.`
           },
           {
             role: "user",
             content: [
               {
                 type: "text",
                 text: "Please identify the food product in this image and provide search keywords to find suppliers."
               },
               {
                 type: "image_url",
                 image_url: {
                   url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`
                 }
               }
             ]
           }
         ],
         max_tokens: 500,
       }),
     });
 
     if (!response.ok) {
       if (response.status === 429) {
         return new Response(
           JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
           { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
         );
       }
       if (response.status === 402) {
         return new Response(
           JSON.stringify({ error: "AI credits exhausted, please add funds." }),
           { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
         );
       }
       const errorText = await response.text();
       console.error("AI gateway error:", response.status, errorText);
       return new Response(
         JSON.stringify({ error: "Failed to process image" }),
         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     const aiResponse = await response.json();
     console.log("AI response received:", JSON.stringify(aiResponse));
 
     const content = aiResponse.choices?.[0]?.message?.content;
     
     if (!content) {
       return new Response(
         JSON.stringify({ 
           identified: false, 
           product: { 
             name: "Unknown", 
             description: "Could not process the image", 
             keywords: [] 
           }, 
           confidence: 0 
         }),
         { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     // Parse the AI response - it should be JSON
     let result;
     try {
       // Try to extract JSON from the response
       const jsonMatch = content.match(/\{[\s\S]*\}/);
       if (jsonMatch) {
         result = JSON.parse(jsonMatch[0]);
       } else {
         result = JSON.parse(content);
       }
     } catch (parseError) {
       console.error("Failed to parse AI response:", parseError);
       // Create a structured response from the text content
       result = {
         identified: true,
         product: {
           name: "Food Product",
           description: content.substring(0, 200),
           keywords: ["food", "product"]
         },
         confidence: 0.5
       };
     }
 
     console.log("Returning result:", JSON.stringify(result));
 
     return new Response(
       JSON.stringify(result),
       { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
 
   } catch (error) {
     console.error("Scan product error:", error);
     return new Response(
       JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
       { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
   }
 });
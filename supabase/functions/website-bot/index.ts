import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch platform context from DB
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const [categoriesRes, productsRes, hotReqRes] = await Promise.all([
      supabase.from("categories").select("name, type, item_count").eq("is_active", true).order("display_order"),
      supabase.from("products").select("name, description, tags").eq("status", "approved").limit(20),
      supabase.from("hot_requirements").select("title, description, category, location, quantity").eq("is_active", true).limit(10),
    ]);

    const categories = categoriesRes.data || [];
    const products = productsRes.data || [];
    const hotReqs = hotReqRes.data || [];

    const systemPrompt = `You are FoodAdda Bot 🍕 — a friendly, warm, and helpful AI assistant for FoodAdda, India's leading B2B food industry platform that connects food suppliers, buyers, HoReCa businesses, and franchise owners.

Your personality:
- Be warm, conversational, and approachable — like a helpful food industry friend
- Use casual language with occasional emojis (but don't overdo it)
- Be enthusiastic about food and the food business
- Keep responses concise but helpful (2-4 paragraphs max)
- Guide users to explore the platform — suggest signing up, browsing products, checking hot requirements
- If you don't know something specific, say so honestly and suggest they contact FoodAdda support

Platform info:
- FoodAdda connects food suppliers with buyers, restaurants, hotels, cafés, and catering businesses
- Users can browse products, suppliers, recipes, and categories
- New users need to sign up, choose a subscription plan, and complete registration
- There are two plans: Starter (₹500/2 months) and Annual (₹5,999/14 months)
- The platform has a WhatsApp community for HORECA & Hotels

Current categories on the platform:
${categories.map((c: any) => `- ${c.name} (${c.type}, ${c.item_count} items)`).join("\n")}

Some available products:
${products.map((p: any) => `- ${p.name}: ${p.description || "No description"}`).join("\n")}

Current hot requirements (businesses looking for suppliers):
${hotReqs.length > 0 ? hotReqs.map((r: any) => `- ${r.title}: ${r.description || ""} (${r.category || "General"}, ${r.location || "India"}, Qty: ${r.quantity || "N/A"})`).join("\n") : "No active hot requirements right now."}

Always be helpful and try to match user queries with relevant products, categories, or hot requirements from the data above.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "I'm getting too many requests right now. Please try again in a moment! 😅" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Something went wrong. Please try again!" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("website-bot error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

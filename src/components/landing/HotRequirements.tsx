
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Package, IndianRupee, ArrowRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

interface HotRequirement {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  location: string | null;
  quantity: string | null;
  budget_range: string | null;
  contact_user_id: string | null;
  created_at: string;
}

const HotRequirements = () => {
  const [requirements, setRequirements] = useState<HotRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { hasActiveSubscription } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("hot_requirements")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (data) setRequirements(data as HotRequirement[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleRespond = (req: HotRequirement) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!hasActiveSubscription) {
      navigate("/subscribe");
      return;
    }
    // If there's a contact user, navigate to chat
    if (req.contact_user_id) {
      navigate(`/chat`);
    }
  };

  if (loading || requirements.length === 0) return null;

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Flame className="w-7 h-7 text-destructive" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Hot Requirements
          </h2>
        </div>
        <p className="text-muted-foreground mb-10 max-w-2xl">
          Active buying requirements from hotels, restaurants & businesses. Respond to connect directly with buyers.
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {requirements.map((req) => (
            <Card
              key={req.id}
              className="border-border hover:border-destructive/30 hover:shadow-hover transition-all duration-300"
            >
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-foreground text-lg leading-tight">
                    {req.title}
                  </h3>
                  <Badge variant="destructive" className="shrink-0 ml-2 text-[10px]">
                    HOT
                  </Badge>
                </div>

                {req.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {req.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-5 mt-auto">
                  {req.category && (
                    <span className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" />
                      {req.category}
                    </span>
                  )}
                  {req.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {req.location}
                    </span>
                  )}
                  {req.quantity && (
                    <span className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" />
                      {req.quantity}
                    </span>
                  )}
                  {req.budget_range && (
                    <span className="flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {req.budget_range}
                    </span>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleRespond(req)}
                >
                  Respond
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HotRequirements;

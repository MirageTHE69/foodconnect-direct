import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, ChefHat, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface AdminRecipeRow {
  id: string;
  title: string;
  status: string;
  images: string[] | null;
  created_at: string;
  supplier_profiles: { company_name: string } | null;
}

const STATUSES = ["pending", "approved", "rejected"];

export default function AdminRecipes() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<AdminRecipeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("recipes")
      .select("id, title, status, images, created_at, supplier_profiles(company_name)")
      .order("created_at", { ascending: false });
    setRecipes((data as unknown as AdminRecipeRow[]) || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("recipes").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Status updated"); setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r))); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this recipe? This can't be undone.")) return;
    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Recipe deleted"); load(); }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Recipes</h1>
          <p className="text-muted-foreground">Moderate supplier recipes and publish official FoodAdda recipes</p>
        </div>
        <Button onClick={() => navigate("/admin/recipes/new")}><Plus className="h-4 w-4 mr-2" />New Recipe</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : recipes.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No recipes yet. Create the first one.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {recipes.map((recipe) => (
            <Card key={recipe.id}>
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {recipe.images?.[0] ? (
                      <img src={recipe.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><ChefHat className="h-5 w-5 text-muted-foreground" /></div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{recipe.title}</h3>
                      <Link to={`/recipes/${recipe.id}`} target="_blank" className="text-muted-foreground hover:text-primary">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {recipe.supplier_profiles?.company_name ?? "FoodAdda Team (official)"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={recipe.status} onValueChange={(v) => updateStatus(recipe.id, v)}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Badge variant="outline" className="capitalize hidden md:inline-flex">{recipe.status}</Badge>
                  <Button variant="outline" size="icon" onClick={() => navigate(`/admin/recipes/${recipe.id}/edit`)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => remove(recipe.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

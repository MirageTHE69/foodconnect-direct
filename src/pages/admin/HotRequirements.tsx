
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Flame } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface HotRequirement {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  location: string | null;
  quantity: string | null;
  budget_range: string | null;
  is_active: boolean;
  created_at: string;
}

const initialForm = {
  title: "",
  description: "",
  category: "",
  location: "",
  quantity: "",
  budget_range: "",
  is_active: true,
};

const AdminHotRequirements = () => {
  const [requirements, setRequirements] = useState<HotRequirement[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAll = async () => {
    const { data } = await supabase
      .from("hot_requirements")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setRequirements(data as HotRequirement[]);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    setLoading(true);

    const payload = {
      title: form.title,
      description: form.description || null,
      category: form.category || null,
      location: form.location || null,
      quantity: form.quantity || null,
      budget_range: form.budget_range || null,
      is_active: form.is_active,
    };

    let error;
    if (editId) {
      ({ error } = await supabase.from("hot_requirements").update(payload).eq("id", editId));
    } else {
      ({ error } = await supabase.from("hot_requirements").insert(payload));
    }

    setLoading(false);
    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editId ? "Updated" : "Created" });
      setDialogOpen(false);
      setForm(initialForm);
      setEditId(null);
      fetchAll();
    }
  };

  const handleEdit = (req: HotRequirement) => {
    setEditId(req.id);
    setForm({
      title: req.title,
      description: req.description || "",
      category: req.category || "",
      location: req.location || "",
      quantity: req.quantity || "",
      budget_range: req.budget_range || "",
      is_active: req.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("hot_requirements").delete().eq("id", id);
    fetchAll();
    toast({ title: "Deleted" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-destructive" />
            <h1 className="text-2xl font-bold text-foreground">Hot Requirements</h1>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) { setForm(initialForm); setEditId(null); }
          }}>
            <DialogTrigger asChild>
              <Button variant="hero" size="sm">
                <Plus className="w-4 h-4" />
                Add Requirement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editId ? "Edit" : "New"} Hot Requirement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantity</Label>
                    <Input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                  </div>
                  <div>
                    <Label>Budget Range</Label>
                    <Input value={form.budget_range} onChange={(e) => setForm({ ...form, budget_range: e.target.value })} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                  <Label>Active</Label>
                </div>
                <Button onClick={handleSave} disabled={loading} className="w-full" variant="hero">
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {requirements.map((req) => (
            <Card key={req.id} className={!req.is_active ? "opacity-50" : ""}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{req.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {[req.category, req.location, req.quantity].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(req)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(req.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {requirements.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No hot requirements yet.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminHotRequirements;

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AdminJobEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "", company: "", location: "", job_type: "full-time",
    category_id: "", experience_required: "", salary_range: "",
    description: "", requirements: "", responsibilities: "", is_active: true,
  });

  useEffect(() => {
    supabase.from("job_categories").select("*").is("parent_id", null).order("display_order")
      .then(({ data }) => setCategories(data || []));
    if (id) {
      supabase.from("jobs").select("*").eq("id", id).single().then(({ data }) => {
        if (data) setForm({
          title: data.title || "", company: data.company || "", location: data.location || "",
          job_type: data.job_type || "full-time", category_id: data.category_id || "",
          experience_required: data.experience_required || "", salary_range: data.salary_range || "",
          description: data.description || "", requirements: data.requirements || "",
          responsibilities: data.responsibilities || "", is_active: data.is_active,
        });
        setLoading(false);
      });
    }
  }, [id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.company) { toast.error("Title and company are required"); return; }
    setSaving(true);
    const payload = { ...form, category_id: form.category_id || null };
    const { error } = isNew
      ? await supabase.from("jobs").insert(payload)
      : await supabase.from("jobs").update(payload).eq("id", id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success(isNew ? "Job created" : "Job updated"); navigate("/admin/jobs"); }
  };

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <Button variant="ghost" size="sm" onClick={() => navigate("/admin/jobs")} className="mb-4"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
      <Card>
        <CardHeader><CardTitle>{isNew ? "New Job" : "Edit Job"}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div><Label>Company *</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required /></div>
              <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Mumbai" /></div>
              <div>
                <Label>Job Type</Label>
                <Select value={form.job_type} onValueChange={(v) => setForm({ ...form, job_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category_id || "none"} onValueChange={(v) => setForm({ ...form, category_id: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Experience</Label><Input value={form.experience_required} onChange={(e) => setForm({ ...form, experience_required: e.target.value })} placeholder="e.g. 2-5 years" /></div>
              <div className="md:col-span-2"><Label>Salary Range</Label><Input value={form.salary_range} onChange={(e) => setForm({ ...form, salary_range: e.target.value })} placeholder="e.g. ₹3-5 LPA" /></div>
            </div>
            <div><Label>Description</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Responsibilities</Label><Textarea rows={4} value={form.responsibilities} onChange={(e) => setForm({ ...form, responsibilities: e.target.value })} /></div>
            <div><Label>Requirements</Label><Textarea rows={4} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} /></div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Active (visible to public)</Label>
            </div>
            <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save</Button>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data: jobsData } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
    setJobs(jobsData || []);
    const { data: apps } = await supabase.from("job_applications").select("job_id");
    const c: Record<string, number> = {};
    (apps || []).forEach((a: any) => { c[a.job_id] = (c[a.job_id] || 0) + 1; });
    setCounts(c);
    setLoading(false);
  };

  const toggleActive = async (id: string, value: boolean) => {
    await supabase.from("jobs").update({ is_active: value }).eq("id", id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this job? Applications will also be removed.")) return;
    const { error } = await supabase.from("jobs").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Job deleted"); load(); }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-muted-foreground">Manage job listings and applications</p>
        </div>
        <Button onClick={() => navigate("/admin/jobs/new")}><Plus className="h-4 w-4 mr-2" />New Job</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : jobs.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No jobs yet. Create your first one.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{job.title}</h3>
                    <Badge variant="secondary" className="capitalize text-xs">{job.job_type}</Badge>
                    {!job.is_active && <Badge variant="outline" className="text-xs">Inactive</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{job.company} · {job.location || "—"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/admin/jobs/${job.id}/applications`}>
                    <Button variant="outline" size="sm"><Users className="h-4 w-4 mr-1" />{counts[job.id] || 0}</Button>
                  </Link>
                  <Switch checked={job.is_active} onCheckedChange={(v) => toggleActive(job.id, v)} />
                  <Button variant="outline" size="icon" onClick={() => navigate(`/admin/jobs/${job.id}/edit`)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => remove(job.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

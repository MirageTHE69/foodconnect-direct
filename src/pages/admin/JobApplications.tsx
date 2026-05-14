import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, Mail, Phone, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const STATUSES = ["new", "reviewed", "shortlisted", "rejected"];

export default function AdminJobApplications() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) load(); }, [id]);

  const load = async () => {
    setLoading(true);
    const [jobRes, appsRes] = await Promise.all([
      supabase.from("jobs").select("title, company").eq("id", id).single(),
      supabase.from("job_applications").select("*").eq("job_id", id).order("created_at", { ascending: false }),
    ]);
    setJob(jobRes.data);
    setApps(appsRes.data || []);
    setLoading(false);
  };

  const updateStatus = async (appId: string, status: string) => {
    const { error } = await supabase.from("job_applications").update({ status }).eq("id", appId);
    if (error) toast.error(error.message);
    else { setApps(apps.map(a => a.id === appId ? { ...a, status } : a)); }
  };

  return (
    <DashboardLayout>
      <Button variant="ghost" size="sm" onClick={() => navigate("/admin/jobs")} className="mb-4"><ArrowLeft className="h-4 w-4 mr-1" />Back to Jobs</Button>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Applications</h1>
        {job && <p className="text-muted-foreground">{job.title} — {job.company}</p>}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : apps.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No applications yet.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {apps.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{a.full_name}</h3>
                      <Badge variant={a.status === "shortlisted" ? "default" : a.status === "rejected" ? "destructive" : "secondary"} className="capitalize">{a.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-2">
                      <a href={`mailto:${a.email}`} className="flex items-center gap-1 hover:text-foreground"><Mail className="h-3 w-3" />{a.email}</a>
                      <a href={`tel:${a.phone}`} className="flex items-center gap-1 hover:text-foreground"><Phone className="h-3 w-3" />{a.phone}</a>
                      <span>Applied {format(new Date(a.created_at), "PP")}</span>
                    </div>
                    {a.cover_note && <p className="text-sm text-muted-foreground italic">"{a.cover_note}"</p>}
                  </div>
                  <div className="flex flex-col gap-2 md:items-end">
                    {a.resume_url && (
                      <a href={a.resume_url} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Resume</Button>
                      </a>
                    )}
                    <Select value={a.status} onValueChange={(v) => updateStatus(a.id, v)}>
                      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

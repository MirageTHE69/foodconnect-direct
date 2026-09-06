import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Mail, Phone, Loader2, Contact } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

const STATUSES = ["new", "reviewed", "shortlisted", "rejected"];

type TalentProfile = Tables<"talent_profiles">;

export default function AdminTalentProfiles() {
  const [profiles, setProfiles] = useState<TalentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("talent_profiles").select("*").order("created_at", { ascending: false });
    setProfiles(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("talent_profiles").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Resumes & Skills</h1>
        <p className="text-muted-foreground">Candidates who submitted a resume without applying to a specific job</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : profiles.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Contact className="h-10 w-10 mx-auto mb-3 opacity-40" />
            No resume submissions yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {profiles.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{p.full_name}</h3>
                      <Badge variant={p.status === "shortlisted" ? "default" : p.status === "rejected" ? "destructive" : "secondary"} className="capitalize">{p.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-2">
                      <a href={`mailto:${p.email}`} className="flex items-center gap-1 hover:text-foreground"><Mail className="h-3 w-3" />{p.email}</a>
                      <a href={`tel:${p.phone}`} className="flex items-center gap-1 hover:text-foreground"><Phone className="h-3 w-3" />{p.phone}</a>
                      <span>Submitted {format(new Date(p.created_at), "PP")}</span>
                    </div>
                    {p.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {p.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    )}
                    {p.notes && <p className="text-sm text-muted-foreground italic">"{p.notes}"</p>}
                  </div>
                  <div className="flex flex-col gap-2 md:items-end">
                    <a href={p.resume_url} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Resume</Button>
                    </a>
                    <Select value={p.status} onValueChange={(v) => updateStatus(p.id, v)}>
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

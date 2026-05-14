import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ApplyJobDialog } from "@/components/jobs/ApplyJobDialog";
import { ArrowLeft, Building2, MapPin, Briefcase, IndianRupee, Clock, Loader2 } from "lucide-react";

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);

  useEffect(() => {
    if (id) load();
  }, [id]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("jobs").select("*").eq("id", id).single();
    setJob(data);
    if (data) document.title = `${data.title} at ${data.company} | FoodAdda Careers`;
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center pt-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center">
          <p className="text-muted-foreground mb-4">Job not found</p>
          <Link to="/jobs"><Button variant="outline">Back to Jobs</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />Back to all jobs
          </Link>

          <Card className="mb-6">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                    <span className="flex items-center gap-1"><Building2 className="h-4 w-4" />{job.company}</span>
                    {job.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>}
                  </div>
                </div>
                <Button size="lg" onClick={() => setApplyOpen(true)}>Apply Now</Button>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary" className="capitalize"><Briefcase className="h-3 w-3 mr-1" />{job.job_type}</Badge>
                {job.salary_range && <Badge variant="secondary"><IndianRupee className="h-3 w-3 mr-1" />{job.salary_range}</Badge>}
                {job.experience_required && <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{job.experience_required}</Badge>}
              </div>

              {job.description && (
                <Section title="Job Description" content={job.description} />
              )}
              {job.responsibilities && (
                <Section title="Responsibilities" content={job.responsibilities} />
              )}
              {job.requirements && (
                <Section title="Requirements" content={job.requirements} />
              )}

              <div className="pt-6 border-t">
                <Button size="lg" className="w-full md:w-auto" onClick={() => setApplyOpen(true)}>Apply Now</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
      <ApplyJobDialog jobId={job.id} jobTitle={job.title} open={applyOpen} onOpenChange={setApplyOpen} />
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div className="text-muted-foreground whitespace-pre-wrap">{content}</div>
    </div>
  );
}

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Upload, CheckCircle2 } from "lucide-react";

interface Props {
  jobId: string;
  jobTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplyJobDialog({ jobId, jobTitle, open, onOpenChange }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", cover_note: "" });
  const [resume, setResume] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.phone) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!resume) {
      toast.error("Please upload your resume");
      return;
    }
    if (resume.size > 5 * 1024 * 1024) {
      toast.error("Resume must be under 5MB");
      return;
    }

    setSubmitting(true);
    try {
      const ext = resume.name.split(".").pop();
      const path = `${jobId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("resumes").upload(path, resume);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("resumes").getPublicUrl(path);

      const { error } = await supabase.from("job_applications").insert({
        job_id: jobId,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        cover_note: form.cover_note || null,
        resume_url: publicUrl,
      });
      if (error) throw error;

      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setForm({ full_name: "", email: "", phone: "", cover_note: "" });
    setResume(null);
    setSubmitted(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-md">
        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Application Submitted!</h3>
            <p className="text-muted-foreground mb-6">Our team will review your application and contact you soon.</p>
            <Button onClick={() => { reset(); onOpenChange(false); }}>Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Apply for {jobTitle}</DialogTitle>
              <DialogDescription>Fill in your details. Our team will reach out to you.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label>Full Name *</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required maxLength={100} />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={255} />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required maxLength={20} />
              </div>
              <div>
                <Label>Resume * (PDF, DOC, DOCX — max 5MB)</Label>
                <div className="relative">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResume(e.target.files?.[0] || null)}
                    required
                  />
                  {resume && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Upload className="h-3 w-3" />{resume.name}</p>}
                </div>
              </div>
              <div>
                <Label>Cover Note (optional)</Label>
                <Textarea
                  value={form.cover_note}
                  onChange={(e) => setForm({ ...form, cover_note: e.target.value })}
                  rows={3}
                  maxLength={500}
                  placeholder="Why are you a good fit?"
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : "Submit Application"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

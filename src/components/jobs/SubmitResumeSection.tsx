import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileUp, Loader2, X, CheckCircle2, Contact } from "lucide-react";

export function SubmitResumeSection() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", notes: "" });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [resume, setResume] = useState<File | null>(null);

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !skills.includes(skill)) {
      setSkills((prev) => [...prev, skill]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => setSkills((prev) => prev.filter((s) => s !== skill));

  const reset = () => {
    setForm({ full_name: "", email: "", phone: "", notes: "" });
    setSkills([]);
    setSkillInput("");
    setResume(null);
    setSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.phone) {
      toast.error("Please fill all required fields");
      return;
    }
    if (skills.length === 0) {
      toast.error("Please add at least one skill");
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
      const path = `talent/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("resumes").upload(path, resume);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("resumes").getPublicUrl(path);

      const { error } = await supabase.from("talent_profiles").insert({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        skills,
        notes: form.notes || null,
        resume_url: publicUrl,
      });
      if (error) throw error;

      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit your profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Contact className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Don't see a role that fits right now?</CardTitle>
            <CardDescription>Drop your resume and skills — we'll reach out when a matching opening comes up.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-14 w-14 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Profile submitted!</h3>
            <p className="text-muted-foreground mb-6">Our hiring team will reach out if a suitable role opens up.</p>
            <Button variant="outline" onClick={reset}>Submit another profile</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="talent-name">Full Name *</Label>
                <Input id="talent-name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required maxLength={100} />
              </div>
              <div>
                <Label htmlFor="talent-email">Email *</Label>
                <Input id="talent-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={255} />
              </div>
              <div>
                <Label htmlFor="talent-phone">Phone *</Label>
                <Input id="talent-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required maxLength={20} />
              </div>
            </div>

            <div>
              <Label htmlFor="talent-skill-input">Skills *</Label>
              <div className="flex gap-2">
                <Input
                  id="talent-skill-input"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="e.g. Food Safety Audits, Bakery Production"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); addSkill(); }
                  }}
                />
                <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="talent-resume">Resume * (PDF, DOC, DOCX — max 5MB)</Label>
              <Input
                id="talent-resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResume(e.target.files?.[0] || null)}
                required
              />
              {resume && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><FileUp className="h-3 w-3" />{resume.name}</p>}
            </div>

            <div>
              <Label htmlFor="talent-notes">Anything else you'd like us to know? (optional)</Label>
              <Textarea
                id="talent-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                maxLength={500}
                placeholder="Preferred roles, availability, current location..."
              />
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : "Submit My Profile"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

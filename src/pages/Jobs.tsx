import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, MapPin, Search, Loader2, Building2 } from "lucide-react";
import { SubmitResumeSection } from "@/components/jobs/SubmitResumeSection";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  job_type: string;
  salary_range: string | null;
  experience_required: string | null;
  description: string | null;
  created_at: string;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    document.title = "Careers - Food Industry Jobs | FoodAdda";
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [jobsRes, catsRes] = await Promise.all([
      supabase.from("jobs").select("*").eq("is_active", true).order("created_at", { ascending: false }),
      supabase.from("job_categories").select("*").is("parent_id", null).order("display_order"),
    ]);
    setJobs((jobsRes.data as Job[]) || []);
    setCategories((catsRes.data as Category[]) || []);
    setLoading(false);
  };

  const filtered = jobs.filter((j) => {
    if (categoryFilter !== "all" && j.category_id !== categoryFilter) return false;
    if (typeFilter !== "all" && j.job_type !== typeFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        j.title.toLowerCase().includes(s) ||
        j.company.toLowerCase().includes(s) ||
        (j.location || "").toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Food Industry Careers</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find your next opportunity across kitchens, factories, supply chain, R&D, sales and more.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-card border rounded-2xl p-4 mb-8 grid md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search title, company, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger><SelectValue placeholder="Job Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No jobs found. Check back soon!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`}>
                  <Card className="hover:shadow-lg transition-all hover:border-primary/50">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-1">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Building2 className="h-4 w-4" />{job.company}</span>
                            {job.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>}
                            {job.experience_required && <span>{job.experience_required}</span>}
                          </div>
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-2">
                          <Badge variant="secondary" className="capitalize">{job.job_type}</Badge>
                          {job.salary_range && <span className="text-sm font-medium text-primary">{job.salary_range}</span>}
                          <Button size="sm">View Details</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-12 max-w-3xl mx-auto">
            <SubmitResumeSection />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

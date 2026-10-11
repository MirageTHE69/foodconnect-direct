import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, ChevronRight, FileText, ListChecks, Loader2, Mail, MessageCircle, Search, Send, Trash2, Upload, Users } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ImportLeadsDialog } from '@/components/admin/outreach/ImportLeadsDialog';
import { ComposeEmailDialog } from '@/components/admin/outreach/ComposeEmailDialog';
import { TemplatesDialog } from '@/components/admin/outreach/TemplatesDialog';
import { MAX_BATCH, canEmail, fetchAllRows, invokeOutreach, type OutreachLead, type OutreachStatus } from '@/lib/outreach';
import { toWhatsAppNumber, whatsAppLink } from '@/lib/phone';

const PAGE_SIZE = 50;
const ALL = 'all';

type StatusFilter = 'all' | 'not_sent' | 'sent' | 'failed' | 'unsubscribed' | 'no_email';

const whatsAppMessage = (name: string) =>
  `Hi ${name}, this is Team FoodAdda (foodadda.in), India's B2B marketplace for the food industry. ` +
  `We help food businesses like yours get direct buyer enquiries with no middlemen and no commission. May I share more details?`;

function StatusBadge({ lead }: { lead: OutreachLead }) {
  if (lead.unsubscribed) return <Badge variant="outline" className="whitespace-nowrap">Unsubscribed</Badge>;
  if (!lead.email) return <Badge variant="outline" className="whitespace-nowrap">No email</Badge>;
  if (lead.email_status === 'sent') return <Badge className="bg-green-600 text-white hover:bg-green-600 whitespace-nowrap">Sent{lead.email_count > 1 ? ` ×${lead.email_count}` : ''}</Badge>;
  if (lead.email_status === 'failed') return <Badge variant="destructive">Failed</Badge>;
  return <Badge variant="secondary" className="whitespace-nowrap">Not sent</Badge>;
}

export default function AdminOutreach() {
  const [leads, setLeads] = useState<OutreachLead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState(ALL);
  const [businessTypes, setBusinessTypes] = useState<string[]>([]);
  const [selected, setSelected] = useState<Map<string, OutreachLead>>(new Map());
  const [status, setStatus] = useState<OutreachStatus | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [recipients, setRecipients] = useState<OutreachLead[] | null>(null);
  const [pickingNext, setPickingNext] = useState(false);

  useEffect(() => {
    document.title = 'Outreach | FoodAdda Admin';
    invokeOutreach<OutreachStatus>({ action: 'status' }).then(setStatus).catch(() => setStatus(null));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadBusinessTypes = useCallback(async () => {
    try {
      const rows = await fetchAllRows<{ business_type: string | null }>((from, to) =>
        supabase.from('outreach_leads').select('business_type').not('business_type', 'is', null).range(from, to),
      );
      setBusinessTypes(Array.from(new Set(rows.map((r) => r.business_type as string))).sort((a, b) => a.localeCompare(b)));
    } catch {
      setBusinessTypes([]);
    }
  }, []);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('outreach_leads')
      .select('*', { count: 'exact' })
      .order('seq', { ascending: true })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (search) {
      // Strip characters that have meaning inside a PostgREST or() filter.
      const term = search.replace(/[,()%*\\]/g, ' ').trim();
      if (term) query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,business_type.ilike.%${term}%`);
    }
    if (typeFilter !== ALL) query = query.eq('business_type', typeFilter);
    if (statusFilter === 'unsubscribed') query = query.eq('unsubscribed', true);
    else if (statusFilter === 'no_email') query = query.is('email', null);
    else if (statusFilter !== 'all') query = query.eq('email_status', statusFilter).eq('unsubscribed', false).not('email', 'is', null);

    const { data, count, error } = await query;
    if (error) toast.error(error.message);
    setLeads(data ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => { loadLeads(); }, [loadLeads]);
  useEffect(() => { loadBusinessTypes(); }, [loadBusinessTypes]);

  const toggle = (lead: OutreachLead) => {
    const next = new Map(selected);
    if (next.has(lead.id)) {
      next.delete(lead.id);
    } else {
      if (next.size >= MAX_BATCH) {
        toast.error(`You can select at most ${MAX_BATCH} leads at a time.`);
        return;
      }
      next.set(lead.id, lead);
    }
    setSelected(next);
  };

  const selectNextUnsent = async () => {
    setPickingNext(true);
    let query = supabase
      .from('outreach_leads')
      .select('*')
      .eq('email_status', 'not_sent')
      .eq('unsubscribed', false)
      .not('email', 'is', null)
      .order('seq', { ascending: true })
      .limit(MAX_BATCH);
    if (typeFilter !== ALL) query = query.eq('business_type', typeFilter);
    const { data, error } = await query;
    setPickingNext(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data || data.length === 0) {
      toast.info('No unsent leads with an email address are left.');
      return;
    }
    setSelected(new Map(data.map((l) => [l.id, l])));
    toast.success(`Selected the next ${data.length} unsent lead${data.length === 1 ? '' : 's'}`);
  };

  const openWhatsApp = async (lead: OutreachLead) => {
    const number = toWhatsAppNumber(lead.phone);
    if (!number) return;
    window.open(whatsAppLink(number, whatsAppMessage(lead.name)), '_blank', 'noopener,noreferrer');
    const now = new Date().toISOString();
    await supabase.from('outreach_leads').update({ last_whatsapp_at: now }).eq('id', lead.id);
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, last_whatsapp_at: now } : l)));
  };

  const removeLead = async (lead: OutreachLead) => {
    if (!confirm(`Delete ${lead.name} from your leads?`)) return;
    const { error } = await supabase.from('outreach_leads').delete().eq('id', lead.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    const next = new Map(selected);
    next.delete(lead.id);
    setSelected(next);
    loadLeads();
  };

  const handleSent = (sentToday: number) => {
    setStatus((s) => (s ? { ...s, sent_today: sentToday } : s));
    setSelected(new Map());
    loadLeads();
  };

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Outreach</h1>
            <p className="text-muted-foreground">Import leads and email them in batches of up to {MAX_BATCH}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setTemplatesOpen(true)}><FileText className="h-4 w-4 mr-2" />Templates</Button>
            <Button onClick={() => setImportOpen(true)}><Upload className="h-4 w-4 mr-2" />Import leads</Button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold tabular-nums">{total.toLocaleString('en-IN')}</p>
                <p className="text-sm text-muted-foreground">{search || statusFilter !== 'all' || typeFilter !== ALL ? 'leads match your filters' : 'leads'}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <Mail className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold tabular-nums">{status ? `${status.sent_today} / ${status.daily_limit}` : '—'}</p>
                <p className="text-sm text-muted-foreground">
                  {status && !status.configured ? 'emails sent today · email sending not set up yet' : 'emails sent today'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search name, email, phone or business type" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-9" />
              </div>
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0); }}>
                <SelectTrigger className="lg:w-56"><SelectValue placeholder="Business type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All business types</SelectItem>
                  {businessTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as StatusFilter); setPage(0); }}>
                <SelectTrigger className="lg:w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="not_sent">Not sent</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="no_email">No email</SelectItem>
                  <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={selectNextUnsent} disabled={pickingNext}>
                {pickingNext ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ListChecks className="h-4 w-4 mr-2" />}
                Select next {MAX_BATCH} unsent
              </Button>
              <Button onClick={() => setRecipients(Array.from(selected.values()))} disabled={selected.size === 0}>
                <Send className="h-4 w-4 mr-2" />Send email to selected ({selected.size}/{MAX_BATCH})
              </Button>
              {selected.size > 0 && <Button variant="ghost" onClick={() => setSelected(new Map())}>Clear selection</Button>}
            </div>

            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Business type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last emailed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={8} className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin text-primary inline" /></TableCell></TableRow>
                  ) : leads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                        {total === 0 && !search && statusFilter === 'all' && typeFilter === ALL
                          ? 'No leads yet. Use "Import leads" to add your first contacts.'
                          : 'No leads match your search or filters.'}
                      </TableCell>
                    </TableRow>
                  ) : leads.map((lead) => {
                    const emailable = canEmail(lead);
                    const waNumber = toWhatsAppNumber(lead.phone);
                    return (
                      <TableRow key={lead.id} data-state={selected.has(lead.id) ? 'selected' : undefined}>
                        <TableCell>
                          <Checkbox
                            checked={selected.has(lead.id)}
                            onCheckedChange={() => toggle(lead)}
                            disabled={!emailable}
                            aria-label={`Select ${lead.name}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium min-w-[160px]">{lead.name}</TableCell>
                        <TableCell className="text-sm">{lead.email ?? '—'}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{lead.phone ?? '—'}</TableCell>
                        <TableCell className="text-sm">{lead.business_type ?? '—'}</TableCell>
                        <TableCell><StatusBadge lead={lead} /></TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {lead.last_emailed_at ? format(new Date(lead.last_emailed_at), 'dd MMM yyyy') : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="outline" size="icon" aria-label={`Email ${lead.name}`}
                              title={emailable ? 'Send email' : lead.unsubscribed ? 'Unsubscribed' : 'No email address'}
                              disabled={!emailable} onClick={() => setRecipients([lead])}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline" size="icon" aria-label={`WhatsApp ${lead.name}`}
                              title={waNumber ? (lead.last_whatsapp_at ? `WhatsApp (last opened ${format(new Date(lead.last_whatsapp_at), 'dd MMM')})` : 'Open WhatsApp') : 'No valid mobile number'}
                              disabled={!waNumber} onClick={() => openWhatsApp(lead)}
                              className={waNumber ? 'text-[#128C7E] border-[#25D366]/50 hover:bg-[#25D366]/10 hover:text-[#128C7E]' : ''}
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" aria-label={`Delete ${lead.name}`} title="Delete lead" onClick={() => removeLead(lead)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {total > PAGE_SIZE && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total.toLocaleString('en-IN')}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
                    <ChevronLeft className="h-4 w-4 mr-1" />Previous
                  </Button>
                  <span className="text-sm tabular-nums">Page {page + 1} of {pageCount}</span>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page + 1 >= pageCount}>
                    Next<ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ImportLeadsDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={() => { setPage(0); loadLeads(); loadBusinessTypes(); }}
      />
      <TemplatesDialog open={templatesOpen} onOpenChange={setTemplatesOpen} />
      <ComposeEmailDialog
        open={recipients !== null}
        onOpenChange={(o) => { if (!o) setRecipients(null); }}
        recipients={recipients ?? []}
        status={status}
        onSent={handleSent}
      />
    </DashboardLayout>
  );
}

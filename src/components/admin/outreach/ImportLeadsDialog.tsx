import { useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileSpreadsheet, Loader2, Store, Upload } from 'lucide-react';
import { toast } from 'sonner';
import {
  LEAD_FIELDS, LEAD_FIELD_LABELS, autoMapColumns, buildLeads, parseLeadFile, phoneKey,
  type ColumnMapping, type NewLead, type ParsedSheet,
} from '@/lib/leadImport';
import { fetchAllRows } from '@/lib/outreach';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

interface ExistingKeys {
  emails: Set<string>;
  phones: Set<string>;
}

const NONE = '__none__';
const BATCH = 500;

async function loadExistingKeys(): Promise<ExistingKeys> {
  const rows = await fetchAllRows<{ email: string | null; phone: string | null }>((from, to) =>
    supabase.from('outreach_leads').select('email, phone').range(from, to),
  );
  const emails = new Set<string>();
  const phones = new Set<string>();
  for (const row of rows) {
    if (row.email) emails.add(row.email);
    else if (phoneKey(row.phone)) phones.add(phoneKey(row.phone));
  }
  return { emails, phones };
}

async function saveLeads(leads: NewLead[]): Promise<void> {
  for (let i = 0; i < leads.length; i += BATCH) {
    const { error } = await supabase
      .from('outreach_leads')
      .upsert(leads.slice(i, i + BATCH), { onConflict: 'email', ignoreDuplicates: true });
    if (error) throw new Error(error.message);
  }
}

export function ImportLeadsDialog({ open, onOpenChange, onImported }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [sheet, setSheet] = useState<ParsedSheet | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [existing, setExisting] = useState<ExistingKeys | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setFileName('');
    setSheet(null);
    setMapping(null);
    setExisting(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const built = useMemo(
    () => (sheet && mapping && existing ? buildLeads(sheet.rows, mapping, fileName, existing) : null),
    [sheet, mapping, existing, fileName],
  );

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const [parsed, keys] = await Promise.all([parseLeadFile(file), loadExistingKeys()]);
      setFileName(file.name);
      setSheet(parsed);
      setMapping(autoMapColumns(parsed.headers));
      setExisting(keys);
    } catch (err) {
      reset();
      toast.error(err instanceof Error ? err.message : 'Could not read this file');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveFile = async () => {
    if (!built || built.leads.length === 0) return;
    setBusy(true);
    try {
      await saveLeads(built.leads);
      toast.success(`${built.leads.length} leads imported`);
      reset();
      onImported();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setBusy(false);
    }
  };

  const handleVendorImport = async () => {
    setBusy(true);
    try {
      const [vendors, keys] = await Promise.all([
        fetchAllRows<{ name: string; email: string | null; phone: string | null; sub_categories: { name: string } | null }>((from, to) =>
          supabase.from('directory_vendors').select('name, email, phone, sub_categories(name)').order('id').range(from, to),
        ),
        loadExistingKeys(),
      ]);
      const rows = vendors.map((v) => [v.name ?? '', v.email ?? '', v.phone ?? '', v.sub_categories?.name ?? '']);
      const result = buildLeads(
        rows,
        { name: 0, email: 1, phone: 2, business_type: 3, company: -1, city: -1 },
        'Vendor directory',
        keys,
      );
      if (result.leads.length === 0) {
        toast.info('Nothing new to import. Every vendor with contact details is already a lead.');
        return;
      }
      await saveLeads(result.leads);
      const withEmail = result.leads.filter((l) => l.email).length;
      toast.success(`${result.leads.length} vendors imported (${withEmail} with email, ${result.leads.length - withEmail} phone only)`);
      onImported();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setBusy(false);
    }
  };

  const needsContactColumn = mapping && mapping.email === -1 && mapping.phone === -1;
  const needsNameColumn = mapping && mapping.name === -1 && mapping.company === -1;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import leads</DialogTitle>
          <DialogDescription>Add contacts from a spreadsheet or from the vendor directory. Duplicates are skipped.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="file">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file"><FileSpreadsheet className="h-4 w-4 mr-2" />Excel / CSV</TabsTrigger>
            <TabsTrigger value="vendors"><Store className="h-4 w-4 mr-2" />Vendor directory</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4 pt-2">
            <input ref={fileRef} type="file" accept=".xlsx,.csv" onChange={handleFile} className="hidden" />
            <div className="flex items-center gap-3 flex-wrap">
              <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={busy}>
                {busy && !sheet ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                {sheet ? 'Choose another file' : 'Choose file'}
              </Button>
              <span className="text-sm text-muted-foreground">
                {fileName || 'Excel (.xlsx) or CSV. The first row must be column headings.'}
              </span>
            </div>

            {sheet && mapping && (
              <>
                <div>
                  <p className="text-sm font-medium mb-2">Match your columns</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {LEAD_FIELDS.map((field) => (
                      <div key={field}>
                        <Label className="text-xs text-muted-foreground">{LEAD_FIELD_LABELS[field]}</Label>
                        <Select
                          value={mapping[field] === -1 ? NONE : String(mapping[field])}
                          onValueChange={(v) => setMapping({ ...mapping, [field]: v === NONE ? -1 : Number(v) })}
                        >
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NONE}>Not in file</SelectItem>
                            {sheet.headers.map((h, i) => (
                              <SelectItem key={i} value={String(i)}>{h || `Column ${i + 1}`}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>

                {needsNameColumn || needsContactColumn ? (
                  <p className="text-sm text-destructive">
                    {needsNameColumn ? 'Choose a Name or Company column. ' : ''}
                    {needsContactColumn ? 'Choose an Email or Phone column.' : ''}
                  </p>
                ) : built && (
                  <>
                    <p className="text-sm">
                      <span className="font-semibold">{built.leads.length}</span> new leads ready
                      <span className="text-muted-foreground">
                        {' '}out of {sheet.rows.length} rows
                        {built.skippedDuplicate > 0 && ` · ${built.skippedDuplicate} duplicates skipped`}
                        {built.skippedNoContact > 0 && ` · ${built.skippedNoContact} without name or contact skipped`}
                        {built.invalidEmails > 0 && ` · ${built.invalidEmails} invalid emails ignored`}
                      </span>
                    </p>
                    {built.leads.length > 0 && (
                      <div className="border rounded-lg overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Phone</TableHead>
                              <TableHead>Business type</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {built.leads.slice(0, 5).map((lead, i) => (
                              <TableRow key={i}>
                                <TableCell>{lead.name}</TableCell>
                                <TableCell>{lead.email ?? '—'}</TableCell>
                                <TableCell>{lead.phone ?? '—'}</TableCell>
                                <TableCell>{lead.business_type ?? '—'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                    <div className="flex justify-end">
                      <Button onClick={handleSaveFile} disabled={busy || built.leads.length === 0}>
                        {busy ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Importing...</> : `Import ${built.leads.length} leads`}
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="vendors" className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Copies every vendor from the website's category directory that has an email or phone number.
              The vendor's sub-category becomes the business type. Vendors already in your leads are skipped,
              so it's safe to run again after adding new vendors.
            </p>
            <Button onClick={handleVendorImport} disabled={busy}>
              {busy ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Importing...</> : <><Store className="h-4 w-4 mr-2" />Import vendors</>}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useRef, useCallback } from 'react';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CSVRow {
  [key: string]: string;
}

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

const BATCH_SIZE = 500;

const EXPECTED_COLUMNS = [
  'company_name', 'specialty', 'specialty_tags', 'city', 'state', 'address',
  'pincode', 'website', 'gst_number', 'fssai_number', 'business_description',
  'market_reputation', 'reputation_score', 'years_in_business', 'certifications',
];

function parseCSV(text: string): { headers: string[]; rows: CSVRow[] } {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_').replace(/['"]/g, ''));
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
    const row: CSVRow = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? '';
    });
    if (row.company_name?.trim()) {
      rows.push(row);
    }
  }

  return { headers, rows };
}

export default function ImportSuppliers() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvData, setCsvData] = useState<{ headers: string[]; rows: CSVRow[] } | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [defaultReputation, setDefaultReputation] = useState<string>('emerging');

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      setCsvData(parsed);
      setResult(null);

      // Auto-map columns
      const autoMap: Record<string, string> = {};
      parsed.headers.forEach(h => {
        const match = EXPECTED_COLUMNS.find(col => col === h || h.includes(col) || col.includes(h));
        if (match) autoMap[match] = h;
      });
      setColumnMapping(autoMap);

      toast.success(`Parsed ${parsed.rows.length} records from CSV`);
    };
    reader.readAsText(file);
  }, []);

  const handleImport = async () => {
    if (!csvData || !user) return;

    setImporting(true);
    setProgress(0);
    const errors: string[] = [];
    let success = 0;
    const total = csvData.rows.length;

    for (let i = 0; i < total; i += BATCH_SIZE) {
      const batch = csvData.rows.slice(i, i + BATCH_SIZE);

      const records = batch.map((row, idx) => {
        const get = (field: string) => {
          const csvCol = columnMapping[field];
          return csvCol ? row[csvCol]?.trim() || null : null;
        };

        const repScore = parseInt(get('reputation_score') ?? '0', 10);
        const yearsInBiz = parseInt(get('years_in_business') ?? '0', 10);
        const reputation = get('market_reputation') ?? defaultReputation;
        const specialtyTags = get('specialty_tags')?.split(';').map(t => t.trim()).filter(Boolean) ?? null;
        const certs = get('certifications')?.split(';').map(t => t.trim()).filter(Boolean) ?? null;

        return {
          user_id: user.id,
          company_name: get('company_name') ?? `Supplier ${i + idx + 1}`,
          specialty: get('specialty'),
          specialty_tags: specialtyTags,
          city: get('city'),
          state: get('state'),
          address: get('address'),
          pincode: get('pincode'),
          website: get('website'),
          gst_number: get('gst_number'),
          fssai_number: get('fssai_number'),
          business_description: get('business_description'),
          market_reputation: ['premium', 'established', 'emerging'].includes(reputation ?? '')
            ? reputation
            : defaultReputation,
          reputation_score: isNaN(repScore) ? 0 : Math.min(100, Math.max(0, repScore)),
          years_in_business: isNaN(yearsInBiz) ? null : yearsInBiz,
          certifications: certs,
          verification_status: 'verified' as const,
          is_featured: false,
        };
      });

      const { error } = await supabase.from('supplier_profiles').insert(records);

      if (error) {
        errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
      } else {
        success += batch.length;
      }

      setProgress(Math.round(((i + batch.length) / total) * 100));
    }

    setImporting(false);
    setResult({ total, success, failed: total - success, errors });

    if (errors.length === 0) {
      toast.success(`Successfully imported ${success} suppliers!`);
    } else {
      toast.error(`Imported ${success}/${total}. ${errors.length} batch(es) failed.`);
    }
  };

  const downloadTemplate = () => {
    const headers = EXPECTED_COLUMNS.join(',');
    const sample = 'Fresh Farms,Basmati Rice,rice;grains;organic,Mumbai,Maharashtra,123 Market Road,400001,https://freshfarms.in,27AAACM3025E1ZZ,12345678901234,Premium supplier of basmati rice,premium,85,15,ISO 22000;FSSAI';
    const blob = new Blob([headers + '\n' + sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'supplier_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Import Suppliers</h1>
          <p className="text-muted-foreground">Bulk import suppliers from a CSV file</p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upload CSV</CardTitle>
            <CardDescription>
              Upload a CSV file with supplier data. Use semicolons (;) to separate multiple values in array fields like specialty_tags and certifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} disabled={importing}>
                <Upload className="h-4 w-4 mr-2" />
                Select CSV File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {csvData && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span><strong>{csvData.rows.length}</strong> records found with <strong>{csvData.headers.length}</strong> columns</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Column Mapping */}
        {csvData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Column Mapping</CardTitle>
              <CardDescription>Map your CSV columns to database fields. Unmapped columns will use defaults.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {EXPECTED_COLUMNS.map(col => (
                  <div key={col} className="space-y-1">
                    <label className="text-sm font-medium capitalize">
                      {col.replace(/_/g, ' ')}
                      {col === 'company_name' && <span className="text-destructive"> *</span>}
                    </label>
                    <Select
                      value={columnMapping[col] ?? '__none__'}
                      onValueChange={(val) => {
                        setColumnMapping(prev => {
                          const next = { ...prev };
                          if (val === '__none__') delete next[col];
                          else next[col] = val;
                          return next;
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">-- Not mapped --</SelectItem>
                        {csvData.headers.map(h => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium">Default Reputation Tier</label>
                <Select value={defaultReputation} onValueChange={setDefaultReputation}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="established">Established</SelectItem>
                    <SelectItem value="emerging">Emerging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview */}
        {csvData && csvData.rows.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview (first 5 rows)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {csvData.headers.slice(0, 8).map(h => (
                        <TableHead key={h} className="text-xs whitespace-nowrap">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.rows.slice(0, 5).map((row, i) => (
                      <TableRow key={i}>
                        {csvData.headers.slice(0, 8).map(h => (
                          <TableCell key={h} className="text-xs max-w-[150px] truncate">{row[h]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Import Action */}
        {csvData && !result && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              {importing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Importing...
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}
              <Button
                size="lg"
                className="w-full"
                onClick={handleImport}
                disabled={importing || !columnMapping.company_name}
              >
                {importing ? 'Importing...' : `Import ${csvData.rows.length} Suppliers`}
              </Button>
              {!columnMapping.company_name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Please map the "company_name" column before importing.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {result.failed === 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
                Import Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <Badge variant="outline">{result.total} Total</Badge>
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">{result.success} Success</Badge>
                {result.failed > 0 && (
                  <Badge variant="destructive">{result.failed} Failed</Badge>
                )}
              </div>
              {result.errors.length > 0 && (
                <div className="bg-destructive/5 rounded-lg p-3 space-y-1">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-sm text-destructive">{err}</p>
                  ))}
                </div>
              )}
              <Button variant="outline" onClick={() => { setCsvData(null); setResult(null); }}>
                Import Another File
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

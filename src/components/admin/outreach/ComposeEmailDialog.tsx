import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Loader2, MinusCircle, Send, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  fillPlaceholders, invokeOutreach,
  type OutreachLead, type OutreachStatus, type OutreachTemplate, type SendResult,
} from '@/lib/outreach';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: OutreachLead[];
  status: OutreachStatus | null;
  onSent: (sentToday: number) => void;
}

export function ComposeEmailDialog({ open, onOpenChange, recipients, status, onSent }: Props) {
  const [templates, setTemplates] = useState<OutreachTemplate[]>([]);
  const [templateId, setTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<SendResult[] | null>(null);

  useEffect(() => {
    if (!open) return;
    setResults(null);
    supabase.from('outreach_email_templates').select('*').order('created_at').then(({ data }) => {
      const list = data ?? [];
      setTemplates(list);
      if (list.length > 0) {
        setTemplateId(list[0].id);
        setSubject(list[0].subject);
        setBody(list[0].body);
      }
    });
  }, [open]);

  const pickTemplate = (id: string) => {
    setTemplateId(id);
    const t = templates.find((x) => x.id === id);
    if (t) {
      setSubject(t.subject);
      setBody(t.body);
    }
  };

  const remaining = status ? status.daily_limit - status.sent_today : null;
  const overLimit = remaining !== null && recipients.length > remaining;
  const first = recipients[0];

  const handleSend = async () => {
    setSending(true);
    try {
      const data = await invokeOutreach<{ results: SendResult[]; sent_today: number }>({
        lead_ids: recipients.map((r) => r.id),
        subject,
        body,
      });
      setResults(data.results);
      const sent = data.results.filter((r) => r.status === 'sent').length;
      const failed = data.results.length - sent;
      if (failed === 0) toast.success(`${sent} email${sent === 1 ? '' : 's'} sent`);
      else toast.warning(`${sent} sent, ${failed} not sent`);
      onSent(data.sent_today);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sending failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!sending) onOpenChange(o); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{results ? 'Send results' : `Send email to ${recipients.length} lead${recipients.length === 1 ? '' : 's'}`}</DialogTitle>
          <DialogDescription>
            {results
              ? 'Each lead got its own separate email.'
              : `Sent from ${status?.from ?? 'FoodAdda'}. Each lead gets a separate email with their own name filled in.`}
          </DialogDescription>
        </DialogHeader>

        {results ? (
          <>
            <ul className="space-y-2">
              {results.map((r) => (
                <li key={r.lead_id} className="flex items-start gap-2 text-sm">
                  {r.status === 'sent' ? <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                    : r.status === 'skipped' ? <MinusCircle className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    : <XCircle className="h-4 w-4 mt-0.5 text-destructive shrink-0" />}
                  <span>
                    <span className="font-medium">{r.name}</span>
                    <span className="text-muted-foreground"> {r.email ?? ''}</span>
                    {r.error && <span className="block text-muted-foreground">{r.error}</span>}
                  </span>
                </li>
              ))}
            </ul>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To: {recipients.slice(0, 3).map((r) => r.name).join(', ')}
                {recipients.length > 3 && ` and ${recipients.length - 3} more`}
              </p>

              {templates.length > 0 && (
                <div>
                  <Label>Template</Label>
                  <Select value={templateId} onValueChange={pickTemplate}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="outreach-subject">Subject</Label>
                <Input id="outreach-subject" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="outreach-body">Message</Label>
                <Textarea id="outreach-body" value={body} onChange={(e) => setBody(e.target.value)} rows={10} maxLength={10000} className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">
                  Use {'{{name}}'}, {'{{business_type}}'}, {'{{company}}'} or {'{{city}}'} and each lead's own details are filled in.
                  An unsubscribe link is added automatically.
                </p>
              </div>

              {first && (subject || body) && (
                <div className="rounded-lg border bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground mb-1">Preview for {first.name}</p>
                  <p className="text-sm font-semibold">{fillPlaceholders(subject, first)}</p>
                  <p className="text-sm whitespace-pre-wrap mt-2">{fillPlaceholders(body, first)}</p>
                </div>
              )}

              {status && !status.configured && (
                <p className="text-sm text-destructive">Email sending isn't set up yet. The Resend API key hasn't been added.</p>
              )}
              {overLimit && (
                <p className="text-sm text-destructive">
                  Only {Math.max(remaining ?? 0, 0)} emails are left in today's limit of {status?.daily_limit}. Select fewer leads.
                </p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>Cancel</Button>
              <Button
                onClick={handleSend}
                disabled={sending || !subject.trim() || !body.trim() || recipients.length === 0 || overLimit || (status ? !status.configured : false)}
              >
                {sending
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>
                  : <><Send className="h-4 w-4 mr-2" />Send {recipients.length} email{recipients.length === 1 ? '' : 's'}</>}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

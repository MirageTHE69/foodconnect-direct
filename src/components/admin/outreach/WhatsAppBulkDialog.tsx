import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BadgeCheck, CheckCheck, CheckCircle2, Clock, MessageCircle, Rocket, Send, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fillPlaceholders, type OutreachLead } from '@/lib/outreach';
import { toWhatsAppNumber, whatsAppLink } from '@/lib/phone';

const WHATSAPP_TEMPLATES = [
  {
    id: 'intro',
    name: 'FoodAdda introduction',
    body:
      'Hi {{name}}, this is Team FoodAdda (foodadda.in), India\'s business food network.\n\n' +
      'We help {{business_type}} businesses like yours get direct buyer enquiries with no middlemen and no commission.\n\n' +
      'Your first month on FoodAdda is free. May I share more details?',
    buttons: ['Yes, tell me more', 'Not now'],
  },
  {
    id: 'follow_up',
    name: 'Follow-up',
    body:
      'Hi {{name}}, following up from Team FoodAdda.\n\n' +
      'Buyers on foodadda.in are looking for {{business_type}} suppliers right now. ' +
      'Listing your business takes 5 minutes and the first month is free.\n\nShall I send you the sign-up link?',
    buttons: ['Send the link', 'Call me'],
  },
  {
    id: 'free_month',
    name: 'Free month offer',
    body:
      'Hello {{name}} 👋\n\nFoodAdda is giving every new food business 1 month of full access free: ' +
      'verified buyer and supplier contacts, product listing and direct enquiries.\n\nJoin here: https://foodadda.in/auth',
    buttons: ['Join now'],
  },
] as const;

type Phase = 'compose' | 'running' | 'done';
type LeadState = 'sent' | 'skipped';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: OutreachLead[];
  onOpened: (leadId: string, at: string) => void;
}

const formatNumber = (lead: OutreachLead) => {
  const n = toWhatsAppNumber(lead.phone);
  return n ? `+${n.slice(0, 2)} ${n.slice(2, 7)} ${n.slice(7)}` : '—';
};

const messageFor = (body: string, lead: OutreachLead) =>
  fillPlaceholders(body, { ...lead, business_type: lead.business_type || 'food' });

function PhonePreview({ text, buttons, caption }: { text: string; buttons: readonly string[]; caption: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{caption}</p>
      <div className="rounded-[1.75rem] border-[6px] border-neutral-900 overflow-hidden shadow-xl bg-neutral-900">
        <div className="bg-[#075E54] text-white px-3 py-2.5 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#075E54] font-bold text-xs">FA</div>
          <div className="leading-tight">
            <p className="text-sm font-semibold flex items-center gap-1">FoodAdda <BadgeCheck className="h-3.5 w-3.5 text-[#25D366]" /></p>
            <p className="text-[10px] text-white/70">Business account</p>
          </div>
        </div>
        <div
          className="px-3 py-4 min-h-[300px] max-h-[380px] overflow-y-auto"
          style={{ backgroundColor: '#ECE5DD', backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '12px 12px' }}
        >
          <div className="max-w-[92%]">
            <div className="bg-white rounded-lg rounded-tl-none shadow-sm px-2.5 pt-2 pb-1">
              <p className="text-[13px] leading-snug text-neutral-900 whitespace-pre-wrap break-words">{text || ' '}</p>
              <p className="text-[10px] text-neutral-500 text-right mt-1 flex items-center justify-end gap-0.5">
                10:30 am <CheckCheck className="h-3 w-3 text-[#34B7F1]" />
              </p>
            </div>
            {buttons.map((b) => (
              <div key={b} className="bg-white rounded-lg shadow-sm mt-1 py-1.5 text-center text-[13px] font-medium text-[#0B84D8]">{b}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function WhatsAppBulkDialog({ open, onOpenChange, recipients, onOpened }: Props) {
  const [templateId, setTemplateId] = useState<string>(WHATSAPP_TEMPLATES[0].id);
  const [body, setBody] = useState<string>(WHATSAPP_TEMPLATES[0].body);
  const [phase, setPhase] = useState<Phase>('compose');
  const [states, setStates] = useState<Record<string, LeadState>>({});
  const sendButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    setTemplateId(WHATSAPP_TEMPLATES[0].id);
    setBody(WHATSAPP_TEMPLATES[0].body);
    setPhase('compose');
    setStates({});
  }, [open]);

  const template = WHATSAPP_TEMPLATES.find((t) => t.id === templateId) ?? WHATSAPP_TEMPLATES[0];
  const pickTemplate = (id: string) => {
    setTemplateId(id);
    const t = WHATSAPP_TEMPLATES.find((x) => x.id === id);
    if (t) setBody(t.body);
  };

  const total = recipients.length;
  const done = Object.keys(states).length;
  const sentCount = Object.values(states).filter((s) => s === 'sent').length;
  const skippedCount = done - sentCount;
  const current = recipients.find((r) => !states[r.id]);

  // When the admin comes back from WhatsApp, put focus on the next send so
  // Enter moves the campaign along.
  useEffect(() => {
    if (phase !== 'running') return;
    const refocus = () => sendButtonRef.current?.focus();
    window.addEventListener('focus', refocus);
    return () => window.removeEventListener('focus', refocus);
  }, [phase]);

  const advance = (leadId: string, state: LeadState) => {
    const next = { ...states, [leadId]: state };
    setStates(next);
    if (recipients.every((r) => next[r.id])) setPhase('done');
  };

  const sendTo = async (lead: OutreachLead) => {
    const number = toWhatsAppNumber(lead.phone);
    if (!number) { advance(lead.id, 'skipped'); return; }
    window.open(whatsAppLink(number, messageFor(body, lead)), '_blank', 'noopener,noreferrer');
    advance(lead.id, 'sent');
    const now = new Date().toISOString();
    await supabase.from('outreach_leads').update({ last_whatsapp_at: now }).eq('id', lead.id);
    onOpened(lead.id, now);
  };

  const statusOf = (lead: OutreachLead) =>
    states[lead.id] ?? (current?.id === lead.id && phase === 'running' ? 'current' : 'queued');

  const queue = (
    <ul className="border rounded-lg divide-y max-h-72 overflow-y-auto">
      {recipients.map((r, i) => {
        const s = statusOf(r);
        return (
          <li key={r.id} className={cn('flex items-center gap-3 px-3 py-2 text-sm', s === 'current' && 'bg-[#25D366]/10')}>
            <span className="w-5 text-xs text-muted-foreground tabular-nums">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{r.name}</p>
              <p className="text-xs text-muted-foreground tabular-nums">{formatNumber(r)}</p>
            </div>
            {s === 'sent' && <span className="flex items-center gap-1 text-xs font-medium text-[#128C7E]"><CheckCheck className="h-4 w-4" />Sent</span>}
            {s === 'skipped' && <span className="flex items-center gap-1 text-xs text-muted-foreground"><SkipForward className="h-3.5 w-3.5" />Skipped</span>}
            {s === 'current' && <span className="flex items-center gap-1 text-xs font-semibold text-[#128C7E]"><Send className="h-3.5 w-3.5" />Up next</span>}
            {s === 'queued' && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" />Queued</span>}
          </li>
        );
      })}
    </ul>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        {phase === 'compose' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-[#25D366]" />
                WhatsApp campaign · {total} lead{total === 1 ? '' : 's'}
              </DialogTitle>
              <DialogDescription>Choose a message, check the preview, then start the campaign. Each lead gets their own personalised message.</DialogDescription>
            </DialogHeader>

            <div className="grid md:grid-cols-[1fr_300px] gap-6">
              <div className="space-y-4 min-w-0">
                <div>
                  <Label>Template</Label>
                  <Select value={templateId} onValueChange={pickTemplate}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {WHATSAPP_TEMPLATES.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="wa-body">Message</Label>
                  <Textarea id="wa-body" value={body} onChange={(e) => setBody(e.target.value)} rows={8} maxLength={1024} className="mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use {'{{name}}'}, {'{{business_type}}'}, {'{{company}}'} or {'{{city}}'}. {body.length} / 1024 characters.
                  </p>
                </div>
                <div>
                  <Label className="mb-2 block">Recipients</Label>
                  {queue}
                </div>
              </div>
              <div className="md:sticky md:top-0 self-start">
                <PhonePreview
                  text={recipients[0] ? messageFor(body, recipients[0]) : body}
                  buttons={template.buttons}
                  caption={recipients[0] ? `Preview for ${recipients[0].name}` : 'Preview'}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button
                onClick={() => setPhase('running')}
                disabled={!body.trim() || total === 0}
                className="bg-[#25D366] hover:bg-[#1fb855] text-white"
              >
                <Rocket className="h-4 w-4 mr-2" />Start campaign ({total})
              </Button>
            </DialogFooter>
          </>
        )}

        {phase === 'running' && current && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-[#25D366]" />
                Campaign running · {done} of {total} done
              </DialogTitle>
              <DialogDescription>
                Each message opens in WhatsApp ready to go. Press send there, then come back here for the next lead.
              </DialogDescription>
            </DialogHeader>
            <Progress value={(done / total) * 100} className="h-2 bg-[#25D366]/15 [&>div]:bg-[#25D366]" />

            <div className="grid md:grid-cols-[1fr_300px] gap-6">
              <div className="space-y-4 min-w-0">
                <div className="rounded-xl border-2 border-[#25D366]/40 bg-[#25D366]/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#128C7E]">Up next · {done + 1} of {total}</p>
                  <p className="text-lg font-semibold mt-1 truncate">{current.name}</p>
                  <p className="text-sm text-muted-foreground tabular-nums">
                    {formatNumber(current)}{current.business_type ? ` · ${current.business_type}` : ''}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button
                      ref={sendButtonRef}
                      autoFocus
                      onClick={() => sendTo(current)}
                      className="bg-[#25D366] hover:bg-[#1fb855] text-white"
                    >
                      <Send className="h-4 w-4 mr-2" />Send to {current.name.split(' ')[0]}
                    </Button>
                    <Button variant="outline" onClick={() => advance(current.id, 'skipped')}>
                      <SkipForward className="h-4 w-4 mr-2" />Skip
                    </Button>
                  </div>
                </div>
                {queue}
              </div>
              <div className="md:sticky md:top-0 self-start">
                <PhonePreview text={messageFor(body, current)} buttons={template.buttons} caption={`Message for ${current.name}`} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Pause campaign</Button>
            </DialogFooter>
          </>
        )}

        {phase === 'done' && (
          <>
            <div className="flex flex-col items-center text-center py-4">
              <div className="h-16 w-16 rounded-full bg-[#25D366]/15 flex items-center justify-center mb-3">
                <CheckCircle2 className="h-9 w-9 text-[#25D366]" />
              </div>
              <DialogTitle className="text-2xl">Campaign complete</DialogTitle>
              <DialogDescription className="mt-1">
                {sentCount} message{sentCount === 1 ? '' : 's'} sent on WhatsApp
                {skippedCount > 0 ? ` · ${skippedCount} skipped` : ''}.
              </DialogDescription>
            </div>
            {queue}
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)} className="bg-[#25D366] hover:bg-[#1fb855] text-white">Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BadgeCheck, CheckCheck, ExternalLink, Info, Zap } from 'lucide-react';
import { fillPlaceholders, type OutreachLead } from '@/lib/outreach';
import { toWhatsAppNumber, whatsAppLink } from '@/lib/phone';

// Kept in code until the WhatsApp Business API is connected; approved
// templates will then come from Meta instead.
const WHATSAPP_TEMPLATES = [
  {
    id: 'intro',
    name: 'FoodAdda introduction',
    body:
      'Hi {{name}}, this is Team FoodAdda (foodadda.in), India\'s B2B marketplace for the food industry.\n\n' +
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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: OutreachLead[];
  onOpened: (leadId: string, at: string) => void;
}

export function WhatsAppBulkDialog({ open, onOpenChange, recipients, onOpened }: Props) {
  const [templateId, setTemplateId] = useState<string>(WHATSAPP_TEMPLATES[0].id);
  const [body, setBody] = useState<string>(WHATSAPP_TEMPLATES[0].body);
  const [opened, setOpened] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setTemplateId(WHATSAPP_TEMPLATES[0].id);
    setBody(WHATSAPP_TEMPLATES[0].body);
    setOpened(new Set());
  }, [open]);

  const template = WHATSAPP_TEMPLATES.find((t) => t.id === templateId) ?? WHATSAPP_TEMPLATES[0];
  const pickTemplate = (id: string) => {
    setTemplateId(id);
    const t = WHATSAPP_TEMPLATES.find((x) => x.id === id);
    if (t) setBody(t.body);
  };

  const first = recipients[0];
  const preview = first ? fillPlaceholders(body, { ...first, business_type: first.business_type || 'food' }) : body;
  const nextUnopened = recipients.find((r) => !opened.has(r.id));

  const openChat = async (lead: OutreachLead) => {
    const number = toWhatsAppNumber(lead.phone);
    if (!number) return;
    const message = fillPlaceholders(body, { ...lead, business_type: lead.business_type || 'food' });
    window.open(whatsAppLink(number, message), '_blank', 'noopener,noreferrer');
    setOpened((prev) => new Set(prev).add(lead.id));
    const now = new Date().toISOString();
    await supabase.from('outreach_leads').update({ last_whatsapp_at: now }).eq('id', lead.id);
    onOpened(lead.id, now);
  };

  const formatNumber = (lead: OutreachLead) => {
    const n = toWhatsAppNumber(lead.phone);
    return n ? `+${n.slice(0, 2)} ${n.slice(2, 7)} ${n.slice(7)}` : '—';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Send WhatsApp to {recipients.length} lead{recipients.length === 1 ? '' : 's'}
          </DialogTitle>
          <DialogDescription>Each lead gets their own message with their name filled in.</DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <p>
            <span className="font-semibold">Automatic sending is coming soon.</span> It switches on once the WhatsApp Business
            API is connected. Until then, use <span className="font-medium">Open</span> to send each message from your own WhatsApp.
          </p>
        </div>

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
              <div className="flex items-center justify-between mb-2">
                <Label>Recipients</Label>
                <span className="text-xs text-muted-foreground">{opened.size} of {recipients.length} opened</span>
              </div>
              <ul className="border rounded-lg divide-y">
                {recipients.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">{formatNumber(r)}</p>
                    </div>
                    {opened.has(r.id) ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-[#128C7E]"><CheckCheck className="h-4 w-4" />Opened</span>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => openChat(r)} className="text-[#128C7E] border-[#25D366]/50 hover:bg-[#25D366]/10 hover:text-[#128C7E]">
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />Open
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Phone-style preview of what the lead receives */}
          <div className="md:sticky md:top-0 self-start">
            <p className="text-xs text-muted-foreground mb-1">Preview{first ? ` for ${first.name}` : ''}</p>
            <div className="rounded-[1.75rem] border-[6px] border-neutral-900 overflow-hidden shadow-xl bg-neutral-900">
              <div className="bg-[#075E54] text-white px-3 py-2.5 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#075E54] font-bold text-xs">FA</div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold flex items-center gap-1">FoodAdda <BadgeCheck className="h-3.5 w-3.5 text-[#25D366]" /></p>
                  <p className="text-[10px] text-white/70">Business account</p>
                </div>
              </div>
              <div
                className="px-3 py-4 min-h-[340px] max-h-[420px] overflow-y-auto"
                style={{ backgroundColor: '#ECE5DD', backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '12px 12px' }}
              >
                <div className="max-w-[92%]">
                  <div className="bg-white rounded-lg rounded-tl-none shadow-sm px-2.5 pt-2 pb-1">
                    <p className="text-[13px] leading-snug text-neutral-900 whitespace-pre-wrap break-words">{preview || ' '}</p>
                    <p className="text-[10px] text-neutral-500 text-right mt-1">10:30 am</p>
                  </div>
                  {template.buttons.map((b) => (
                    <div key={b} className="bg-white rounded-lg shadow-sm mt-1 py-1.5 text-center text-[13px] font-medium text-[#0B84D8]">{b}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button
            variant="outline"
            onClick={() => nextUnopened && openChat(nextUnopened)}
            disabled={!nextUnopened || !body.trim()}
            className="text-[#128C7E] border-[#25D366]/50 hover:bg-[#25D366]/10 hover:text-[#128C7E]"
          >
            <ExternalLink className="h-4 w-4 mr-2" />{nextUnopened ? `Open next: ${nextUnopened.name}` : 'All opened'}
          </Button>
          <Button disabled title="Available once the WhatsApp Business API is connected" className="bg-[#25D366] hover:bg-[#25D366] text-white">
            <Zap className="h-4 w-4 mr-2" />Send all automatically
            <Badge variant="secondary" className="ml-2 bg-white/90 text-[#075E54] text-[10px]">Soon</Badge>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type OutreachLead = Tables<'outreach_leads'>;
export type OutreachTemplate = Tables<'outreach_email_templates'>;

export const MAX_BATCH = 10;

export interface OutreachStatus {
  configured: boolean;
  sent_today: number;
  daily_limit: number;
  from: string;
}

export interface SendResult {
  lead_id: string;
  name: string;
  email: string | null;
  status: 'sent' | 'failed' | 'skipped';
  error?: string;
}

/** Calls send-outreach-email and surfaces the function's own error message. */
export async function invokeOutreach<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('send-outreach-email', { body });
  if (error) {
    // supabase-js only carries a generic message; the real one is in the response body.
    const context = (error as { context?: Response }).context;
    let message: string | null = null;
    if (context) {
      try {
        const parsed = await context.clone().json();
        if (parsed?.error) message = parsed.error;
      } catch {
        // not JSON -- fall through to the generic error
      }
    }
    throw new Error(message ?? error.message);
  }
  if (data?.error) throw new Error(data.error);
  return data as T;
}

/** PostgREST caps a response at 1000 rows; this pages through all of them. */
export async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const PAGE = 1000;
  const all: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await page(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    all.push(...(data ?? []));
    if (!data || data.length < PAGE) return all;
  }
}

export function fillPlaceholders(template: string, lead: Pick<OutreachLead, 'name' | 'business_type' | 'company' | 'city'>): string {
  const values: Record<string, string> = {
    name: lead.name ?? '',
    business_type: lead.business_type ?? '',
    company: lead.company ?? lead.name ?? '',
    city: lead.city ?? '',
  };
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => (key in values ? values[key] : match));
}

export const canEmail = (lead: OutreachLead) => !!lead.email && !lead.unsubscribed;

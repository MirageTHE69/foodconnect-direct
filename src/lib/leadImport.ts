export const LEAD_FIELDS = ['name', 'email', 'phone', 'business_type', 'company', 'city'] as const;
export type LeadField = (typeof LEAD_FIELDS)[number];

export const LEAD_FIELD_LABELS: Record<LeadField, string> = {
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  business_type: 'Business type',
  company: 'Company',
  city: 'City',
};

export interface NewLead {
  name: string;
  email: string | null;
  phone: string | null;
  business_type: string | null;
  company: string | null;
  city: string | null;
  source: string;
}

export interface ParsedSheet {
  headers: string[];
  rows: string[][];
}

export type ColumnMapping = Record<LeadField, number>; // -1 = not mapped

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const ALIASES: Record<LeadField, string[]> = {
  email: ['email', 'e-mail', 'mail'],
  phone: ['phone', 'mobile', 'contact no', 'contact number', 'whatsapp', 'number', 'cell', 'tel'],
  business_type: ['business type', 'business_type', 'type', 'category', 'industry', 'segment', 'sub-category', 'subcategory'],
  company: ['company', 'business name', 'firm', 'organisation', 'organization', 'vendor'],
  city: ['city', 'location', 'town', 'district'],
  name: ['name', 'contact person', 'person', 'owner', 'full name'],
};

/** Reads the first sheet of an .xlsx or a .csv into headers + string rows. */
export async function parseLeadFile(file: File): Promise<ParsedSheet> {
  const lower = file.name.toLowerCase();
  let table: unknown[][];

  if (lower.endsWith('.xlsx')) {
    const { readSheet } = await import('read-excel-file/browser');
    table = (await readSheet(file)) as unknown[][];
  } else if (lower.endsWith('.csv')) {
    const Papa = (await import('papaparse')).default;
    table = await new Promise<unknown[][]>((resolve, reject) => {
      Papa.parse<string[]>(file, {
        skipEmptyLines: 'greedy',
        complete: (result) => resolve(result.data),
        error: (err) => reject(err),
      });
    });
  } else if (lower.endsWith('.xls')) {
    throw new Error('Old .xls files are not supported. Open it in Excel and save as .xlsx, then upload again.');
  } else {
    throw new Error('Please upload an Excel (.xlsx) or CSV (.csv) file.');
  }

  const cleaned = table
    .map((row) => row.map((cell) => (cell == null ? '' : String(cell).trim())))
    .filter((row) => row.some((cell) => cell !== ''));
  if (cleaned.length < 2) throw new Error('The file needs a header row and at least one contact row.');

  return { headers: cleaned[0], rows: cleaned.slice(1) };
}

/** Best-guess header -> field matching; each column is used at most once. */
export function autoMapColumns(headers: string[]): ColumnMapping {
  const normalized = headers.map((h) => h.toLowerCase().replace(/[_.]+/g, ' ').trim());
  const mapping = Object.fromEntries(LEAD_FIELDS.map((f) => [f, -1])) as ColumnMapping;
  const used = new Set<number>();

  // Most specific fields first so "Company Name" isn't claimed by "name".
  for (const field of ['email', 'phone', 'business_type', 'company', 'city', 'name'] as LeadField[]) {
    const idx = normalized.findIndex((h, i) => !used.has(i) && ALIASES[field].some((a) => h === a || h.includes(a)));
    if (idx !== -1) {
      mapping[field] = idx;
      used.add(idx);
    }
  }
  return mapping;
}

/** Pulls the first valid, lowercased email out of a messy cell. */
export function cleanEmail(raw: string | null | undefined): string | null {
  if (!raw) return null;
  for (const part of raw.split(/[\s,;/|]+/)) {
    const candidate = part.trim().toLowerCase().replace(/^mailto:/, '');
    if (EMAIL_RE.test(candidate)) return candidate;
  }
  return null;
}

export interface BuildResult {
  leads: NewLead[];
  skippedNoContact: number;
  skippedDuplicate: number;
  invalidEmails: number;
}

const phoneKey = (phone: string | null) => (phone ? phone.replace(/\D/g, '').slice(-10) : '');

/**
 * Turns mapped rows into leads. A row needs a name (or company) and at least
 * an email or a phone. Duplicates are dropped by email, or by phone when the
 * row has no email -- both within the file and against what's already saved.
 */
export function buildLeads(
  rows: string[][],
  mapping: ColumnMapping,
  source: string,
  existing: { emails: Set<string>; phones: Set<string> },
): BuildResult {
  const seenEmails = new Set(existing.emails);
  const seenPhones = new Set(existing.phones);
  const result: BuildResult = { leads: [], skippedNoContact: 0, skippedDuplicate: 0, invalidEmails: 0 };
  const cell = (row: string[], field: LeadField) => (mapping[field] >= 0 ? (row[mapping[field]] ?? '').trim() : '');

  for (const row of rows) {
    const company = cell(row, 'company') || null;
    const name = cell(row, 'name') || company || '';
    const rawEmail = cell(row, 'email');
    const email = cleanEmail(rawEmail);
    if (rawEmail && !email) result.invalidEmails++;
    const phone = cell(row, 'phone') || null;

    if (!name || (!email && !phone)) {
      result.skippedNoContact++;
      continue;
    }

    const pKey = phoneKey(phone);
    if (email ? seenEmails.has(email) : pKey !== '' && seenPhones.has(pKey)) {
      result.skippedDuplicate++;
      continue;
    }
    if (email) seenEmails.add(email);
    if (pKey) seenPhones.add(pKey);

    result.leads.push({
      name: name.slice(0, 200),
      email,
      phone: phone ? phone.slice(0, 100) : null,
      business_type: cell(row, 'business_type').slice(0, 120) || null,
      company,
      city: cell(row, 'city').slice(0, 120) || null,
      source,
    });
  }
  return result;
}

export { phoneKey };

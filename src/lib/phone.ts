/**
 * Turns a free-text phone value into the digits-only international number
 * wa.me needs. Cells often hold several numbers ("98250 12345, 98980 11111")
 * so only the first is used; bare 10-digit Indian mobiles get a 91 prefix.
 * Indian mobiles start with 6-9, so landlines like 080-xxxx are rejected.
 * Returns null when no usable mobile number is found.
 */
export function toWhatsAppNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const first = raw.split(/[,/;|]|\s{2,}/)[0] ?? '';
  // "079-2656 1234" / "(022) 1234 5678": a leading 0 + short STD code is a landline.
  if (/^\s*\(?0\d{2,4}\)?[\s-]/.test(first)) return null;
  let digits = first.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length === 10 && /^[6-9]/.test(digits)) return `91${digits}`;
  if (digits.length === 12 && /^91[6-9]/.test(digits)) return digits;
  return null;
}

export function whatsAppLink(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

import { cn } from '@/lib/utils';

/** Plain-text mask, e.g. "Patel Foods" -> "P••••• •••••". */
export function maskVendorName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';
  return trimmed[0] + trimmed.slice(1).replace(/[^\s]/g, '•');
}

interface MaskedVendorNameProps {
  name: string;
  className?: string;
}

/**
 * First letter stays readable; the rest is replaced with same-length filler
 * characters and blurred. The real name is never put in the DOM, so it can't
 * be read out of the page source.
 */
export function MaskedVendorName({ name, className }: MaskedVendorNameProps) {
  const trimmed = name.trim();
  const rest = trimmed.slice(1).replace(/[^\s]/g, 'x');
  return (
    <span className={cn('select-none', className)} aria-label="Vendor name hidden">
      <span>{trimmed[0]}</span>
      <span aria-hidden="true" className="blur-[5px]">{rest}</span>
    </span>
  );
}

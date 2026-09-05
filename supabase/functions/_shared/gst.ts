// Mirrors src/lib/gst.ts's calculateGst() exactly — Deno edge functions
// can't import from the Vite src/ tree. Keep both in sync.

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh',
];

export const SELLER_STATE = 'Gujarat';

export interface GstBreakdown {
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  isIntraState: boolean;
  totalGst: number;
}

export function calculateGst(inclusiveAmount: number, gstPercent: number, buyerState: string): GstBreakdown {
  const round2 = (n: number) => Math.round(n * 100) / 100;

  const taxableValue = round2(inclusiveAmount / (1 + gstPercent / 100));
  const totalGst = round2(inclusiveAmount - taxableValue);
  const isIntraState = buyerState === SELLER_STATE;

  if (isIntraState) {
    const cgstAmount = round2(totalGst / 2);
    const sgstAmount = round2(totalGst - cgstAmount);
    return { taxableValue, cgstAmount, sgstAmount, igstAmount: 0, isIntraState, totalGst };
  }

  return { taxableValue, cgstAmount: 0, sgstAmount: 0, igstAmount: totalGst, isIntraState, totalGst };
}

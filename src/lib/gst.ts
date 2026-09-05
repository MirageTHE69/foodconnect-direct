// GST calculation shared by the checkout flow and the invoice view.
// Mirrored in supabase/functions/_shared/gst.ts for the Deno edge runtime —
// keep both in sync.

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh',
] as const;

// FoodAdda's GST registration state. Intra-state sales (buyer also in this
// state) split GST into CGST+SGST; inter-state sales charge a single IGST
// line. Both total the same gst_percent of the taxable value.
export const SELLER_STATE = 'Gujarat';

// Official GST state/UT codes, for the "Place of Supply" line on invoices.
export const STATE_GST_CODES: Record<string, string> = {
  'Jammu and Kashmir': '01', 'Himachal Pradesh': '02', 'Punjab': '03',
  'Uttarakhand': '05', 'Haryana': '06', 'Delhi': '07', 'Rajasthan': '08',
  'Uttar Pradesh': '09', 'Bihar': '10', 'Sikkim': '11', 'Arunachal Pradesh': '12',
  'Nagaland': '13', 'Manipur': '14', 'Mizoram': '15', 'Tripura': '16',
  'Meghalaya': '17', 'Assam': '18', 'West Bengal': '19', 'Jharkhand': '20',
  'Odisha': '21', 'Chhattisgarh': '22', 'Madhya Pradesh': '23', 'Gujarat': '24',
  'Maharashtra': '27', 'Karnataka': '29', 'Goa': '30', 'Kerala': '32',
  'Tamil Nadu': '33', 'Telangana': '36', 'Andhra Pradesh': '37', 'Ladakh': '38',
};

export interface GstBreakdown {
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  isIntraState: boolean;
  totalGst: number;
  totalAmount: number;
}

/**
 * Prices on FoodAdda are GST-inclusive. Given the inclusive amount actually
 * charged and the plan's gst_percent, back-calculate the taxable value and
 * split the tax based on the buyer's billing state.
 */
export function calculateGst(inclusiveAmount: number, gstPercent: number, buyerState: string): GstBreakdown {
  const round2 = (n: number) => Math.round(n * 100) / 100;

  const taxableValue = round2(inclusiveAmount / (1 + gstPercent / 100));
  const totalGst = round2(inclusiveAmount - taxableValue);
  const isIntraState = buyerState === SELLER_STATE;

  if (isIntraState) {
    const cgstAmount = round2(totalGst / 2);
    const sgstAmount = round2(totalGst - cgstAmount);
    return { taxableValue, cgstAmount, sgstAmount, igstAmount: 0, isIntraState, totalGst, totalAmount: inclusiveAmount };
  }

  return { taxableValue, cgstAmount: 0, sgstAmount: 0, igstAmount: totalGst, isIntraState, totalGst, totalAmount: inclusiveAmount };
}

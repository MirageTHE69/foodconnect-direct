import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowLeft, Download, Printer, Utensils } from 'lucide-react';
import { INVOICE_SELLER } from '@/lib/invoiceConfig';
import { STATE_GST_CODES } from '@/lib/gst';
import { amountToWords } from '@/lib/numberToWords';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

interface InvoicePlan {
  name: string;
  code: string;
  price_monthly: number;
  price_annual: number;
}

interface InvoiceRow {
  id: string;
  user_id: string;
  billing_cycle: string;
  status: string;
  payment_status: string;
  payment_reference: string | null;
  amount_paid: number | null;
  billing_state: string | null;
  taxable_value: number | null;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  gst_rate: number;
  invoice_number: string | null;
  activated_at: string | null;
  created_at: string;
  plan?: InvoicePlan | null;
}

interface BuyerProfile {
  full_name: string | null;
  phone: string | null;
  email: string | null;
}

// SAC (Services Accounting Code) for the subscription/marketplace-access
// service this invoice bills for. Confirm with your accountant if a more
// specific code applies to your registration.
const SAC_CODE = '998599';

const inr = (n: number) => `Rs. ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Invoice() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<InvoiceRow | null>(null);
  const [buyer, setBuyer] = useState<BuyerProfile | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*, plan:subscription_plans(name, code, price_monthly, price_annual)')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setRow(data as unknown as InvoiceRow);

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, email')
        .eq('user_id', data.user_id)
        .maybeSingle();
      setBuyer(profile);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !row) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <p className="text-foreground font-semibold">Invoice not found</p>
            <p className="text-sm text-muted-foreground">This invoice doesn't exist or you don't have access to it.</p>
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (row.status !== 'active' || !row.invoice_number) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <p className="text-foreground font-semibold">Invoice not yet available</p>
            <p className="text-sm text-muted-foreground">
              {row.status === 'pending_payment'
                ? 'Your invoice will be generated once payment is confirmed.'
                : 'No tax invoice was generated for this subscription.'}
            </p>
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const amount = row.amount_paid ?? (row.billing_cycle === 'annual' ? row.plan?.price_annual : row.plan?.price_monthly) ?? 0;
  const taxableValue = row.taxable_value ?? 0;
  const isIntraState = row.cgst_amount > 0 || row.sgst_amount > 0;
  const invoiceDate = row.activated_at ?? row.created_at;
  const planDescription = `FoodAdda ${row.plan?.name ?? 'Subscription'} Plan — ${row.billing_cycle === 'annual' ? 'Annual' : 'Monthly'} access`;
  const placeOfSupplyCode = row.billing_state ? STATE_GST_CODES[row.billing_state] ?? '—' : '—';

  const handleDownload = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    let y = 50;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('TAX INVOICE', pageWidth / 2, y, { align: 'center' });
    y += 30;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice No: ${row.invoice_number}`, margin, y);
    doc.text(`Invoice Date: ${format(new Date(invoiceDate), 'dd MMM yyyy')}`, pageWidth - margin, y, { align: 'right' });
    y += 30;

    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 20;

    const colWidth = (pageWidth - margin * 2 - 20) / 2;

    doc.setFont('helvetica', 'bold');
    doc.text('Billed By', margin, y);
    doc.text('Billed To', margin + colWidth + 20, y);
    y += 16;

    doc.setFont('helvetica', 'normal');
    const sellerLines = [
      INVOICE_SELLER.legalName,
      INVOICE_SELLER.address,
      `GSTIN: ${INVOICE_SELLER.gstin}`,
      `PAN: ${INVOICE_SELLER.pan}`,
      `Email: ${INVOICE_SELLER.email}`,
      `Phone: ${INVOICE_SELLER.phone}`,
    ];
    const buyerLines = [
      buyer?.full_name || '—',
      buyer?.email || '—',
      buyer?.phone || '—',
      `Billing State: ${row.billing_state ?? '—'}`,
      `Place of Supply: ${row.billing_state ?? '—'} (${placeOfSupplyCode})`,
    ];

    const sellerWrapped = sellerLines.flatMap((l) => doc.splitTextToSize(l, colWidth));
    const buyerWrapped = buyerLines.flatMap((l) => doc.splitTextToSize(l, colWidth));
    const blockStartY = y;
    sellerWrapped.forEach((line, i) => doc.text(line, margin, blockStartY + i * 14));
    buyerWrapped.forEach((line, i) => doc.text(line, margin + colWidth + 20, blockStartY + i * 14));
    y = blockStartY + Math.max(sellerWrapped.length, buyerWrapped.length) * 14 + 20;

    doc.line(margin, y, pageWidth - margin, y);
    y += 25;

    // Line-item table
    const tableX = [margin, margin + 230, margin + 300, margin + 370, pageWidth - margin];
    doc.setFont('helvetica', 'bold');
    doc.text('Description', tableX[0], y);
    doc.text('SAC Code', tableX[1], y);
    doc.text('Qty', tableX[2], y);
    doc.text('Amount', tableX[4], y, { align: 'right' });
    y += 8;
    doc.line(margin, y, pageWidth - margin, y);
    y += 18;

    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(planDescription, 210);
    descLines.forEach((line: string, i: number) => doc.text(line, tableX[0], y + i * 14));
    doc.text(SAC_CODE, tableX[1], y);
    doc.text('1', tableX[2], y);
    doc.text(inr(taxableValue), tableX[4], y, { align: 'right' });
    y += Math.max(descLines.length, 1) * 14 + 10;

    doc.line(margin, y, pageWidth - margin, y);
    y += 25;

    const totalsX = pageWidth - margin;
    const totalsLabelX = pageWidth - 200;
    const addTotalLine = (label: string, value: string, bold = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.text(label, totalsLabelX, y);
      doc.text(value, totalsX, y, { align: 'right' });
      y += 18;
    };

    addTotalLine('Taxable Value', inr(taxableValue));
    if (isIntraState) {
      addTotalLine(`CGST @ ${(row.gst_rate / 2).toFixed(1)}%`, inr(row.cgst_amount));
      addTotalLine(`SGST @ ${(row.gst_rate / 2).toFixed(1)}%`, inr(row.sgst_amount));
    } else {
      addTotalLine(`IGST @ ${row.gst_rate.toFixed(1)}%`, inr(row.igst_amount));
    }
    doc.line(totalsLabelX, y, totalsX, y);
    y += 15;
    addTotalLine('Total Amount', inr(amount), true);
    y += 15;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    const wordsLines = doc.splitTextToSize(`Amount in words: ${amountToWords(amount)}`, pageWidth - margin * 2);
    wordsLines.forEach((line: string, i: number) => doc.text(line, margin, y + i * 12));
    y += wordsLines.length * 12 + 20;

    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Reference: ${row.payment_reference ?? '—'}`, margin, y);
    y += 30;

    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text('This is a computer-generated invoice and does not require a physical signature.', margin, y);
    y += 12;
    doc.text('Tax is payable on reverse charge basis: No.', margin, y);

    doc.save(`FoodAdda-Invoice-${row.invoice_number.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between print:hidden">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card className="max-w-3xl mx-auto print:shadow-none print:border-none">
        <CardContent className="p-8 md:p-10">
          <div className="flex items-start justify-between mb-8 pb-6 border-b border-border">
            <div className="flex items-center gap-2">
              <Utensils className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold text-foreground">
                Food<span className="text-primary">Adda</span>
              </span>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold tracking-wide text-foreground">TAX INVOICE</h1>
              <p className="text-sm text-muted-foreground mt-1">Invoice No: <span className="font-medium text-foreground">{row.invoice_number}</span></p>
              <p className="text-sm text-muted-foreground">Date: {format(new Date(invoiceDate), 'dd MMM yyyy')}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Billed By</p>
              <p className="font-semibold text-foreground">{INVOICE_SELLER.legalName}</p>
              <p className="text-sm text-muted-foreground">{INVOICE_SELLER.address}</p>
              <p className="text-sm text-muted-foreground mt-1">GSTIN: {INVOICE_SELLER.gstin}</p>
              <p className="text-sm text-muted-foreground">PAN: {INVOICE_SELLER.pan}</p>
              <p className="text-sm text-muted-foreground mt-1">{INVOICE_SELLER.email} · {INVOICE_SELLER.phone}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Billed To</p>
              <p className="font-semibold text-foreground">{buyer?.full_name || '—'}</p>
              <p className="text-sm text-muted-foreground">{buyer?.email || '—'}</p>
              <p className="text-sm text-muted-foreground">{buyer?.phone || '—'}</p>
              <p className="text-sm text-muted-foreground mt-1">Billing State: {row.billing_state ?? '—'}</p>
              <p className="text-sm text-muted-foreground">Place of Supply: {row.billing_state ?? '—'} ({placeOfSupplyCode})</p>
            </div>
          </div>

          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b-2 border-border text-left text-xs uppercase text-muted-foreground">
                <th className="py-2">Description</th>
                <th className="py-2">SAC Code</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-3 pr-4">{planDescription}</td>
                <td className="py-3">{SAC_CODE}</td>
                <td className="py-3 text-center">1</td>
                <td className="py-3 text-right">{inr(taxableValue)}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end mb-8">
            <div className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxable Value</span>
                <span className="text-foreground">{inr(taxableValue)}</span>
              </div>
              {isIntraState ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CGST @ {(row.gst_rate / 2).toFixed(1)}%</span>
                    <span className="text-foreground">{inr(row.cgst_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SGST @ {(row.gst_rate / 2).toFixed(1)}%</span>
                    <span className="text-foreground">{inr(row.sgst_amount)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IGST @ {row.gst_rate.toFixed(1)}%</span>
                  <span className="text-foreground">{inr(row.igst_amount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-border font-bold text-base">
                <span className="text-foreground">Total Amount</span>
                <span className="text-foreground">{inr(amount)}</span>
              </div>
            </div>
          </div>

          <p className="text-sm italic text-muted-foreground mb-6">
            Amount in words: {amountToWords(amount)}
          </p>

          <p className="text-sm text-muted-foreground mb-8">
            Payment Reference: {row.payment_reference ?? '—'}
          </p>

          <div className="pt-6 border-t border-border text-xs text-muted-foreground space-y-1">
            <p>This is a computer-generated invoice and does not require a physical signature.</p>
            <p>Tax is payable on reverse charge basis: No.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

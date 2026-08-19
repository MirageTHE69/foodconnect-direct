import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { computeSubscriptionMonths } from '@/lib/subscriptionPromo';

interface SubscriptionRow {
  id: string;
  user_id: string;
  plan_id: string;
  billing_cycle: string;
  status: string;
  starts_at: string | null;
  expires_at: string | null;
  payment_reference: string | null;
  payment_status: string;
  amount_paid: number | null;
  created_at: string;
}

interface PlanInfo {
  name: string;
  price_monthly: number;
  price_annual: number;
}

const STATUS_FILTERS = ['pending_payment', 'active', 'expired', 'cancelled', 'rejected', 'all'] as const;

export default function AdminSubscriptions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [plans, setPlans] = useState<Record<string, PlanInfo>>({});
  const [profiles, setProfiles] = useState<Record<string, { full_name: string | null; email: string | null }>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('pending_payment');
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subsRes, plansRes, profilesRes] = await Promise.all([
        supabase.from('user_subscriptions').select('*').order('created_at', { ascending: false }),
        supabase.from('subscription_plans').select('id, name, price_monthly, price_annual'),
        supabase.from('profiles').select('user_id, full_name, email'),
      ]);

      if (subsRes.data) setSubscriptions(subsRes.data as SubscriptionRow[]);
      if (plansRes.data) {
        const map: Record<string, PlanInfo> = {};
        plansRes.data.forEach((p: any) => { map[p.id] = { name: p.name, price_monthly: p.price_monthly, price_annual: p.price_annual }; });
        setPlans(map);
      }
      if (profilesRes.data) {
        const map: Record<string, { full_name: string | null; email: string | null }> = {};
        profilesRes.data.forEach((p: any) => { map[p.user_id] = { full_name: p.full_name, email: p.email }; });
        setProfiles(map);
      }
    } catch (err) {
      console.error('Error loading subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, expiresAt: string | null) => {
    const isExpired = status === 'active' && expiresAt && new Date(expiresAt) < new Date();
    if (isExpired) return <Badge variant="destructive">Expired</Badge>;
    if (status === 'active') return <Badge className="bg-green-600 text-white">Active</Badge>;
    if (status === 'pending_payment') return <Badge variant="outline" className="border-amber-400 text-amber-600">Pending</Badge>;
    if (status === 'cancelled') return <Badge variant="secondary">Cancelled</Badge>;
    if (status === 'rejected') return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  const openAction = (id: string) => {
    setActioningId(id);
    setPaymentReference('');
    setAmountPaid('');
  };

  const closeAction = () => setActioningId(null);

  const approve = async () => {
    if (!actioningId || !user) return;
    const sub = subscriptions.find((s) => s.id === actioningId);
    if (!sub) return;
    const plan = plans[sub.plan_id];
    if (!plan) return;

    setSaving(true);
    try {
      const startsAt = new Date();
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + computeSubscriptionMonths(sub.billing_cycle as 'monthly' | 'annual'));
      const price = sub.billing_cycle === 'annual' ? plan.price_annual : plan.price_monthly;

      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'active',
          payment_status: 'paid',
          payment_reference: paymentReference || null,
          amount_paid: amountPaid ? Number(amountPaid) : price,
          starts_at: startsAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          activated_by: user.id,
          activated_at: new Date().toISOString(),
        })
        .eq('id', actioningId);

      if (error) throw error;
      toast({ title: 'Subscription activated' });
      closeAction();
      fetchData();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const reject = async () => {
    if (!actioningId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ status: 'rejected', admin_notes: paymentReference || null })
        .eq('id', actioningId);
      if (error) throw error;
      toast({ title: 'Subscription request rejected' });
      closeAction();
      fetchData();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const visibleSubs = statusFilter === 'all' ? subscriptions : subscriptions.filter((s) => s.status === statusFilter);
  const actioningSub = subscriptions.find((s) => s.id === actioningId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>All User Subscriptions</CardTitle>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : visibleSubs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No subscriptions found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Billing</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Starts</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleSubs.map((sub) => {
                      const profile = profiles[sub.user_id];
                      return (
                        <TableRow key={sub.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">{profile?.full_name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">{profile?.email || sub.user_id.slice(0, 8)}</p>
                            </div>
                          </TableCell>
                          <TableCell>{plans[sub.plan_id]?.name || 'Unknown'}</TableCell>
                          <TableCell className="capitalize text-sm">{sub.billing_cycle}</TableCell>
                          <TableCell>{getStatusBadge(sub.status, sub.expires_at)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{sub.payment_status}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{sub.starts_at ? format(new Date(sub.starts_at), 'dd MMM yyyy') : '—'}</TableCell>
                          <TableCell className="text-sm">{sub.expires_at ? format(new Date(sub.expires_at), 'dd MMM yyyy') : '—'}</TableCell>
                          <TableCell>
                            {sub.status === 'pending_payment' && (
                              <Button size="sm" onClick={() => openAction(sub.id)}>Review</Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!actioningId} onOpenChange={(open) => !open && closeAction()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Subscription Request</DialogTitle>
          </DialogHeader>
          {actioningSub && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p><span className="text-foreground font-medium">Plan:</span> {plans[actioningSub.plan_id]?.name}</p>
                <p><span className="text-foreground font-medium">Billing:</span> {actioningSub.billing_cycle}</p>
                <p>
                  <span className="text-foreground font-medium">Amount:</span> ₹
                  {(actioningSub.billing_cycle === 'annual'
                    ? plans[actioningSub.plan_id]?.price_annual
                    : plans[actioningSub.plan_id]?.price_monthly
                  )?.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-reference">Payment reference (optional)</Label>
                <Input id="payment-reference" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} placeholder="UTR / transaction ID" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount-paid">Amount received (optional, defaults to plan price)</Label>
                <Input id="amount-paid" type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="e.g. 354" />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="destructive" onClick={reject} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reject'}
            </Button>
            <Button onClick={approve} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve & Activate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

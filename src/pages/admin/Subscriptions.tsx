import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

interface SubscriptionRow {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  starts_at: string;
  expires_at: string;
  payment_status: string;
  created_at: string;
}

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [plans, setPlans] = useState<Record<string, string>>({});
  const [profiles, setProfiles] = useState<Record<string, { full_name: string | null; email: string | null }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subsRes, plansRes, profilesRes] = await Promise.all([
        supabase.from('user_subscriptions').select('*').order('created_at', { ascending: false }),
        supabase.from('subscription_plans').select('id, name'),
        supabase.from('profiles').select('user_id, full_name, email'),
      ]);

      if (subsRes.data) setSubscriptions(subsRes.data as SubscriptionRow[]);
      if (plansRes.data) {
        const map: Record<string, string> = {};
        plansRes.data.forEach((p: any) => { map[p.id] = p.name; });
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

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    if (isExpired) return <Badge variant="destructive">Expired</Badge>;
    if (status === 'active') return <Badge className="bg-green-600 text-white">Active</Badge>;
    if (status === 'cancelled') return <Badge variant="secondary">Cancelled</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All User Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : subscriptions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No subscriptions found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Starts</TableHead>
                      <TableHead>Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub) => {
                      const profile = profiles[sub.user_id];
                      return (
                        <TableRow key={sub.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">{profile?.full_name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">{profile?.email || sub.user_id.slice(0, 8)}</p>
                            </div>
                          </TableCell>
                          <TableCell>{plans[sub.plan_id] || 'Unknown'}</TableCell>
                          <TableCell>{getStatusBadge(sub.status, sub.expires_at)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{sub.payment_status.replace('_', ' ')}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{format(new Date(sub.starts_at), 'dd MMM yyyy')}</TableCell>
                          <TableCell className="text-sm">{format(new Date(sub.expires_at), 'dd MMM yyyy')}</TableCell>
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
    </DashboardLayout>
  );
}

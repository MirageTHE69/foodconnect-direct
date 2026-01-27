import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, Building2, ShieldCheck, Clock, CheckCircle, TrendingUp, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useAdminStats();

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers ?? 0,
      description: `${stats?.totalBuyers ?? 0} buyers, ${stats?.totalSuppliers ?? 0} suppliers`,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Suppliers',
      value: stats?.totalSuppliers ?? 0,
      description: `${stats?.verifiedSuppliers ?? 0} verified`,
      icon: Building2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Products',
      value: stats?.totalProducts ?? 0,
      description: `${stats?.approvedProducts ?? 0} approved`,
      icon: Package,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Pending Actions',
      value: (stats?.pendingVerifications ?? 0) + (stats?.pendingProducts ?? 0),
      description: `${stats?.pendingVerifications ?? 0} suppliers, ${stats?.pendingProducts ?? 0} products`,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  const quickActions = [
    {
      title: 'Manage Users',
      description: `${stats?.totalUsers ?? 0} total users`,
      icon: Users,
      href: '/admin/users',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Supplier Verification',
      description: `${stats?.pendingVerifications ?? 0} pending`,
      icon: ShieldCheck,
      href: '/admin/suppliers',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Product Moderation',
      description: `${stats?.pendingProducts ?? 0} pending`,
      icon: Package,
      href: '/admin/products',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Analytics',
      description: 'View platform trends',
      icon: TrendingUp,
      href: '/admin',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and management</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>{stat.title}</CardDescription>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <Card 
                key={action.title}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(action.href)}
              >
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center`}>
                    <action.icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="py-8">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <CheckCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium">All caught up!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Check the moderation pages for pending items
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

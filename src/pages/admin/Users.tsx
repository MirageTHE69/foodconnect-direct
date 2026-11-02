import { useState } from 'react';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Loader2, CheckCircle2 } from 'lucide-react';
import { UserDetailsSheet } from '@/components/admin/users/UserDetailsSheet';
import { format } from 'date-fns';

type RoleFilter = 'all' | 'buyer' | 'supplier' | 'admin';

export default function AdminUsers() {
  const { users, isLoading, updateRole, isUpdating, saveDetails, isSaving } = useAdminUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  // Keep the id, not the object, so the panel shows fresh data after a save.
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const selectedUser = users.find((u) => u.user_id === selectedUserId) ?? null;

  const filteredUsers = users.filter(user => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || [
      user.full_name, user.email, user.phone,
      user.registration?.company_name, user.registration?.phone, user.registration?.gst_number,
      user.registration?.fssai_number, user.supplier?.company_name, user.supplier?.gst_number,
    ].some((v) => v?.toLowerCase().includes(q));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'supplier':
        return 'default';
      case 'buyer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">View and manage all platform users</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email, phone, company, GST or FSSAI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={(value: RoleFilter) => setRoleFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="buyer">Buyers</SelectItem>
              <SelectItem value="supplier">Suppliers</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>GST / FSSAI</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url ?? undefined} />
                            <AvatarFallback>
                              {user.full_name?.charAt(0) ?? user.email?.charAt(0) ?? 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.full_name ?? 'Unnamed User'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="text-muted-foreground">{user.email}</div>
                        {user.phone && <div className="text-muted-foreground tabular-nums">{user.phone}</div>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.registration?.company_name || user.supplier?.company_name || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(user.registration?.gst_number || user.supplier?.gst_number) && (
                            <Badge variant="outline" className="gap-1 whitespace-nowrap">
                              {user.registration?.gst_verified && <CheckCircle2 className="h-3 w-3 text-green-600" />}GST
                            </Badge>
                          )}
                          {(user.registration?.fssai_number || user.supplier?.fssai_number) && (
                            <Badge variant="outline" className="whitespace-nowrap">FSSAI</Badge>
                          )}
                          {!user.registration?.gst_number && !user.supplier?.gst_number && !user.registration?.fssai_number && !user.supplier?.fssai_number && (
                            <span className="text-sm text-muted-foreground">Missing</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role ?? 'No role'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUserId(user.user_id)}
                        >
                          View / Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <UserDetailsSheet
          user={selectedUser}
          onOpenChange={(open) => { if (!open) setSelectedUserId(null); }}
          onSave={saveDetails}
          saving={isSaving}
          onRoleChange={(role) => selectedUser && updateRole({ userId: selectedUser.user_id, newRole: role })}
          roleUpdating={isUpdating}
        />
      </div>
    </DashboardLayout>
  );
}

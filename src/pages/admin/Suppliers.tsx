import { useState } from 'react';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { useAdminSuppliers } from '@/hooks/useAdminSuppliers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Loader2, MapPin, Globe, FileText, Star, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

type StatusFilter = 'all' | 'pending' | 'verified' | 'rejected';

export default function AdminSuppliers() {
  const { suppliers, isLoading, updateStatus, toggleFeatured, isUpdating } = useAdminSuppliers();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<typeof suppliers[0] | null>(null);

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = 
      supplier.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.owner_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || supplier.verification_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Supplier Verification</h1>
          <p className="text-muted-foreground">Review and verify supplier profiles</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by company, email, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Suppliers Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No suppliers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={supplier.logo_url ?? undefined} />
                            <AvatarFallback>
                              {supplier.company_name?.charAt(0) ?? 'S'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{supplier.company_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{supplier.owner_name ?? 'Unknown'}</div>
                          <div className="text-muted-foreground">{supplier.owner_email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {supplier.city && supplier.state ? `${supplier.city}, ${supplier.state}` : 'Not specified'}
                      </TableCell>
                      <TableCell>{getStatusBadge(supplier.verification_status)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={supplier.is_featured ?? false}
                          onCheckedChange={(checked) => toggleFeatured({ supplierId: supplier.id, isFeatured: checked })}
                          disabled={isUpdating}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(supplier.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSupplier(supplier)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Supplier Details Sheet */}
        <Sheet open={!!selectedSupplier} onOpenChange={() => setSelectedSupplier(null)}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Supplier Details</SheetTitle>
              <SheetDescription>Review supplier profile and verification documents</SheetDescription>
            </SheetHeader>
            {selectedSupplier && (
              <div className="space-y-6 mt-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedSupplier.logo_url ?? undefined} />
                    <AvatarFallback className="text-lg">
                      {selectedSupplier.company_name?.charAt(0) ?? 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{selectedSupplier.company_name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedSupplier.owner_email}</p>
                    <div className="mt-2">{getStatusBadge(selectedSupplier.verification_status)}</div>
                  </div>
                </div>

                {/* Business Description */}
                {selectedSupplier.business_description && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Business Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{selectedSupplier.business_description}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Location & Contact */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Location & Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {[selectedSupplier.address, selectedSupplier.city, selectedSupplier.state, selectedSupplier.pincode]
                          .filter(Boolean)
                          .join(', ') || 'Not specified'}
                      </span>
                    </div>
                    {selectedSupplier.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a href={selectedSupplier.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {selectedSupplier.website}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Verification Documents */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Verification Documents</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">GST Number:</span>
                      <span className="text-muted-foreground">{selectedSupplier.gst_number || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">FSSAI Number:</span>
                      <span className="text-muted-foreground">{selectedSupplier.fssai_number || 'Not provided'}</span>
                    </div>
                    {selectedSupplier.certifications && selectedSupplier.certifications.length > 0 && (
                      <div className="flex items-start gap-2 text-sm">
                        <Star className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="font-medium">Certifications:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedSupplier.certifications.map((cert, i) => (
                              <Badge key={i} variant="outline">{cert}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      updateStatus({ supplierId: selectedSupplier.id, status: 'verified' });
                      setSelectedSupplier(null);
                    }}
                    disabled={isUpdating || selectedSupplier.verification_status === 'verified'}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      updateStatus({ supplierId: selectedSupplier.id, status: 'rejected' });
                      setSelectedSupplier(null);
                    }}
                    disabled={isUpdating || selectedSupplier.verification_status === 'rejected'}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
}

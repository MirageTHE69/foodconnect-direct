import { useState } from 'react';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { useEnquiries } from '@/hooks/useEnquiries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MessageSquare,
  Loader2,
  Eye,
  Package,
  User,
  Calendar,
  Mail,
} from 'lucide-react';
import { format } from 'date-fns';

export default function SupplierEnquiries() {
  const { enquiries, loading, updateEnquiryStatus } = useEnquiries();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const filteredEnquiries = enquiries.filter(enquiry => {
    return statusFilter === 'all' || enquiry.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-500',
      responded: 'bg-blue-500',
      closed: 'bg-gray-500',
    };
    return (
      <Badge className={variants[status] || 'bg-gray-500'}>
        {status}
      </Badge>
    );
  };

  const handleViewDetails = (enquiry: any) => {
    setSelectedEnquiry(enquiry);
    setDetailDialogOpen(true);
  };

  const handleStatusChange = async (enquiryId: string, newStatus: string) => {
    await updateEnquiryStatus(enquiryId, newStatus);
    if (selectedEnquiry?.id === enquiryId) {
      setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Enquiries</h1>
          <p className="text-muted-foreground">
            View and respond to buyer enquiries
          </p>
        </div>

        {/* Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Enquiries</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="text-sm text-muted-foreground">
                {filteredEnquiries.length} enquiries
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enquiries Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredEnquiries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-lg">No enquiries yet</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  When buyers contact you, their enquiries will appear here
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnquiries.map((enquiry) => (
                      <TableRow key={enquiry.id}>
                        <TableCell>
                          <p className="font-medium line-clamp-1">{enquiry.subject}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {enquiry.buyer_profile?.full_name || enquiry.buyer_profile?.email || 'Unknown'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {enquiry.products ? (
                            <div className="flex items-center gap-2">
                              {enquiry.products.images?.[0] && (
                                <img
                                  src={enquiry.products.images[0]}
                                  alt=""
                                  loading="lazy"
                                  className="w-8 h-8 rounded object-cover"
                                />
                              )}
                              <span className="text-sm line-clamp-1">{enquiry.products.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">General enquiry</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(enquiry.status)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(enquiry.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(enquiry)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{enquiries.length}</div>
              <p className="text-sm text-muted-foreground">Total Enquiries</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">
                {enquiries.filter(e => e.status === 'pending').length}
              </div>
              <p className="text-sm text-muted-foreground">Pending Response</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {enquiries.filter(e => e.status === 'responded').length}
              </div>
              <p className="text-sm text-muted-foreground">Responded</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enquiry Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
            <DialogDescription>
              View and respond to this enquiry
            </DialogDescription>
          </DialogHeader>
          
          {selectedEnquiry && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">{selectedEnquiry.subject}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedEnquiry.message}
                </p>
              </div>
              
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {selectedEnquiry.buyer_profile?.full_name || 'Unknown Buyer'}
                  </span>
                </div>
                {selectedEnquiry.buyer_profile?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedEnquiry.buyer_profile.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(new Date(selectedEnquiry.created_at), 'PPP')}
                  </span>
                </div>
                {selectedEnquiry.products && (
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedEnquiry.products.name}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <label className="text-sm font-medium mb-2 block">Update Status</label>
                <Select
                  value={selectedEnquiry.status}
                  onValueChange={(value) => handleStatusChange(selectedEnquiry.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

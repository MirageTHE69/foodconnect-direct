 import { DashboardLayout } from '@/components/shared/DashboardLayout';
 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 import { Badge } from '@/components/ui/badge';
 import { Button } from '@/components/ui/button';
 import { Loader2, Mail, Eye, Trash2, CheckCircle } from 'lucide-react';
 import { format } from 'date-fns';
 import { useToast } from '@/hooks/use-toast';
 import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
 } from '@/components/ui/alert-dialog';
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
 } from '@/components/ui/dialog';
 import { useState } from 'react';
 
 interface ContactSubmission {
   id: string;
   name: string;
   email: string;
   subject: string;
   message: string;
   status: string;
   created_at: string;
 }
 
 export default function ContactSubmissions() {
   const { toast } = useToast();
   const queryClient = useQueryClient();
   const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
 
   const { data: submissions, isLoading } = useQuery({
     queryKey: ['admin-contact-submissions'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('contact_submissions')
         .select('*')
         .order('created_at', { ascending: false });
 
       if (error) throw error;
       return data as ContactSubmission[];
     },
   });
 
   const markAsReadMutation = useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from('contact_submissions')
         .update({ status: 'read' })
         .eq('id', id);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['admin-contact-submissions'] });
       toast({ title: 'Marked as read' });
     },
   });
 
   const deleteMutation = useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from('contact_submissions')
         .delete()
         .eq('id', id);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['admin-contact-submissions'] });
       toast({ title: 'Submission deleted' });
     },
   });
 
   const getStatusBadge = (status: string) => {
     switch (status) {
       case 'new':
         return <Badge variant="default">New</Badge>;
       case 'read':
         return <Badge variant="secondary">Read</Badge>;
       default:
         return <Badge variant="outline">{status}</Badge>;
     }
   };
 
   const handleView = (submission: ContactSubmission) => {
     setSelectedSubmission(submission);
     if (submission.status === 'new') {
       markAsReadMutation.mutate(submission.id);
     }
   };
 
   if (isLoading) {
     return (
       <DashboardLayout>
         <div className="flex items-center justify-center h-[50vh]">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
       </DashboardLayout>
     );
   }
 
   const newCount = submissions?.filter(s => s.status === 'new').length ?? 0;
 
   return (
     <DashboardLayout>
       <div className="space-y-6">
         <div>
           <h1 className="text-3xl font-bold">Contact Submissions</h1>
           <p className="text-muted-foreground">
             View and manage contact form submissions
             {newCount > 0 && (
               <Badge variant="default" className="ml-2">{newCount} new</Badge>
             )}
           </p>
         </div>
 
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Mail className="h-5 w-5" />
               All Submissions
             </CardTitle>
             <CardDescription>
               {submissions?.length ?? 0} total submissions
             </CardDescription>
           </CardHeader>
           <CardContent>
             {submissions && submissions.length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Status</TableHead>
                     <TableHead>Name</TableHead>
                     <TableHead>Email</TableHead>
                     <TableHead>Subject</TableHead>
                     <TableHead>Date</TableHead>
                     <TableHead className="text-right">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {submissions.map((submission) => (
                     <TableRow key={submission.id} className={submission.status === 'new' ? 'bg-primary/5' : ''}>
                       <TableCell>{getStatusBadge(submission.status)}</TableCell>
                       <TableCell className="font-medium">{submission.name}</TableCell>
                       <TableCell>{submission.email}</TableCell>
                       <TableCell className="max-w-[200px] truncate">{submission.subject}</TableCell>
                       <TableCell>{format(new Date(submission.created_at), 'MMM d, yyyy h:mm a')}</TableCell>
                       <TableCell className="text-right space-x-2">
                         <Button
                           variant="ghost"
                           size="icon"
                           onClick={() => handleView(submission)}
                         >
                           <Eye className="h-4 w-4" />
                         </Button>
                         {submission.status === 'new' && (
                           <Button
                             variant="ghost"
                             size="icon"
                             onClick={() => markAsReadMutation.mutate(submission.id)}
                             disabled={markAsReadMutation.isPending}
                           >
                             <CheckCircle className="h-4 w-4" />
                           </Button>
                         )}
                         <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon">
                               <Trash2 className="h-4 w-4 text-destructive" />
                             </Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                             <AlertDialogHeader>
                               <AlertDialogTitle>Delete submission?</AlertDialogTitle>
                               <AlertDialogDescription>
                                 This will permanently delete this contact submission from {submission.name}.
                               </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                               <AlertDialogCancel>Cancel</AlertDialogCancel>
                               <AlertDialogAction
                                 onClick={() => deleteMutation.mutate(submission.id)}
                                 className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                               >
                                 Delete
                               </AlertDialogAction>
                             </AlertDialogFooter>
                           </AlertDialogContent>
                         </AlertDialog>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <div className="text-center py-12">
                 <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                 <h3 className="font-medium">No submissions yet</h3>
                 <p className="text-sm text-muted-foreground">
                   Contact form submissions will appear here
                 </p>
               </div>
             )}
           </CardContent>
         </Card>
 
         {/* View Submission Dialog */}
         <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
           <DialogContent className="max-w-lg">
             <DialogHeader>
               <DialogTitle>{selectedSubmission?.subject}</DialogTitle>
               <DialogDescription>
                 From {selectedSubmission?.name} ({selectedSubmission?.email})
               </DialogDescription>
             </DialogHeader>
             <div className="space-y-4">
               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                 <span>Received: {selectedSubmission && format(new Date(selectedSubmission.created_at), 'MMMM d, yyyy h:mm a')}</span>
               </div>
               <div className="p-4 bg-muted rounded-lg">
                 <p className="whitespace-pre-wrap">{selectedSubmission?.message}</p>
               </div>
               <div className="flex gap-2">
                 <Button
                   variant="outline"
                   className="flex-1"
                   onClick={() => window.open(`mailto:${selectedSubmission?.email}?subject=Re: ${selectedSubmission?.subject}`, '_blank')}
                 >
                   <Mail className="w-4 h-4 mr-2" />
                   Reply via Email
                 </Button>
               </div>
             </div>
           </DialogContent>
         </Dialog>
       </div>
     </DashboardLayout>
   );
 }
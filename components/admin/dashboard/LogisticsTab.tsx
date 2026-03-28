"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2, CheckCircle, XCircle, Eye, Clock, ShieldCheck, Download } from "lucide-react";
import { logisticsService } from "@/lib/logisticsService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function LogisticsAdminTab() {
  const [pendingSubs, setPendingSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingSubscriptions();
  }, []);

  const fetchPendingSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await logisticsService.subscriptions.getPending();
      setPendingSubs(res.data.data);
    } catch (error) {
      toast.error("Failed to load pending subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      await logisticsService.subscriptions.approve(id);
      toast.success("Subscription approved successfully!");
      fetchPendingSubscriptions();
    } catch (error) {
      toast.error("Failed to approve subscription");
    } finally {
      setProcessingId(null);
    }
  };

  const handleExport = async () => {
    try {
      const response = await logisticsService.reports.exportLogistics();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'logistics_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("Failed to export report");
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" /> Logistics Management
          </h2>
          <p className="text-muted-foreground text-sm">Approve driver subscriptions and monitor payments.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-1">
            <Download className="h-4 w-4" /> Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={fetchPendingSubscriptions}>
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Subscriptions</CardTitle>
          <CardDescription>Drivers waiting for payment verification ({pendingSubs.length})</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingSubs.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p>No pending subscription requests.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingSubs.map((sub) => (
                  <TableRow key={sub._id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{sub.driverId?.firstName} {sub.driverId?.lastName}</span>
                        <span className="text-xs text-muted-foreground">{sub.driverId?.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{sub.paymentProof?.method?.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{sub.paymentProof?.transactionId}</TableCell>
                    <TableCell className="text-xs">
                      {new Date(sub.paymentProof?.uploadedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 flex items-center gap-1">
                            <Eye className="h-4 w-4" /> View
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Payment Proof</DialogTitle>
                            <DialogDescription>
                              Transaction ID: {sub.paymentProof?.transactionId}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="mt-4 border rounded-lg overflow-hidden bg-muted flex items-center justify-center min-h-[300px]">
                            {/* In a real app, this would be the actual image URL */}
                            <div className="text-center p-10">
                              <p className="text-sm font-bold">Image Preview Placeholder</p>
                              <p className="text-xs text-muted-foreground mt-2">{sub.paymentProof?.url}</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        size="sm" 
                        variant="default" 
                        className="bg-green-600 hover:bg-green-700 h-8"
                        onClick={() => handleApprove(sub._id)}
                        disabled={processingId === sub._id}
                      >
                        {processingId === sub._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="h-8"
                        disabled={processingId === sub._id}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

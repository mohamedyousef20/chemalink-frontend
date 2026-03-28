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
import { Loader2, AlertTriangle, CheckCircle, XCircle, Eye, MessageSquare } from "lucide-react";
import { logisticsService } from "@/lib/logisticsService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function DisputesTab() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const res = await logisticsService.disputes.getAll();
      setDisputes(res.data.data);
    } catch (error) {
      toast.error("Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (outcome: string) => {
    if (!selectedDispute) return;

    try {
      setProcessingId(selectedDispute._id);
      await logisticsService.disputes.resolve(selectedDispute._id, {
        outcome,
        notes: resolutionNotes
      });
      toast.success("Dispute resolved successfully");
      setSelectedDispute(null);
      setResolutionNotes("");
      fetchDisputes();
    } catch (error) {
      toast.error("Failed to resolve dispute");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" /> Dispute Management
          </h2>
          <p className="text-muted-foreground text-sm">Review and resolve shipment conflicts between sellers and drivers.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDisputes}>
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {disputes.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p>No active disputes.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment</TableHead>
                  <TableHead>Raised By</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disputes.map((dispute) => (
                  <TableRow key={dispute._id}>
                    <TableCell className="font-medium">
                      {dispute.deliveryId?.productName || "Deleted Shipment"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{dispute.raisedBy?.firstName} {dispute.raisedBy?.lastName}</span>
                        <Badge variant="secondary" className="w-fit text-[10px] uppercase">
                          {dispute.raisedBy?.role}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {dispute.reason.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={dispute.status === 'resolved' ? 'default' : 'destructive'}
                        className="capitalize"
                      >
                        {dispute.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(dispute.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSelectedDispute(dispute)}
                          >
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Dispute Details</DialogTitle>
                            <DialogDescription>
                              Raised for: {dispute.deliveryId?.productName}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            <div className="bg-muted p-3 rounded-md text-sm">
                              <p className="font-bold mb-1">Description:</p>
                              <p>{dispute.description}</p>
                            </div>

                            {dispute.status === 'pending' && (
                              <div className="space-y-3 pt-2">
                                <Label>Resolution Notes</Label>
                                <Textarea 
                                  placeholder="Explain the reason for this decision..." 
                                  value={resolutionNotes}
                                  onChange={(e) => setResolutionNotes(e.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <Button 
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleResolve('pay_driver')}
                                    disabled={processingId === dispute._id || !resolutionNotes}
                                  >
                                    Pay Driver
                                  </Button>
                                  <Button 
                                    variant="destructive"
                                    onClick={() => handleResolve('refund_seller')}
                                    disabled={processingId === dispute._id || !resolutionNotes}
                                  >
                                    Refund Seller
                                  </Button>
                                </div>
                              </div>
                            )}

                            {dispute.status === 'resolved' && (
                              <div className="border-t pt-4 space-y-2">
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  Outcome: {dispute.resolution?.outcome.replace('_', ' ')}
                                </Badge>
                                <p className="text-sm italic">"{dispute.resolution?.notes}"</p>
                                <p className="text-[10px] text-muted-foreground">
                                  Resolved on {new Date(dispute.resolution?.resolvedAt).toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
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

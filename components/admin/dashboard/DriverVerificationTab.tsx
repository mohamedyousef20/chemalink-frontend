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
import { Loader2, ShieldCheck, CheckCircle, XCircle, Eye, UserCheck } from "lucide-react";
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
import { Label } from "@/components/ui/label";

export default function DriverVerificationTab() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await logisticsService.users.getDrivers();
      setDrivers(res.data);
    } catch (error) {
      toast.error("Failed to load drivers");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, isVerified: boolean) => {
    try {
      setProcessingId(id);
      await logisticsService.users.verifyDriver(id, isVerified);
      toast.success(`Driver ${isVerified ? 'verified' : 'unverified'} successfully`);
      fetchDrivers();
    } catch (error) {
      toast.error("Failed to update verification status");
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
            <UserCheck className="h-6 w-6 text-primary" /> Driver Verification
          </h2>
          <p className="text-muted-foreground text-sm">Review driver documents and verify their accounts.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDrivers}>
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {drivers.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <ShieldCheck className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p>No drivers found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver Name</TableHead>
                  <TableHead>Vehicle Info</TableHead>
                  <TableHead>National ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver._id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{driver.firstName} {driver.lastName}</span>
                        <span className="text-xs text-muted-foreground">{driver.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="capitalize">{driver.driverProfile?.vehicleType?.replace('_', ' ') || 'N/A'}</span>
                        <span className="text-muted-foreground">{driver.driverProfile?.vehicleNumber || 'No plate'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {driver.driverProfile?.nationalId || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={driver.driverProfile?.isVerified ? 'default' : 'secondary'}>
                        {driver.driverProfile?.isVerified ? 'Verified' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" /> View Docs
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Verification Documents</DialogTitle>
                            <DialogDescription>
                              Reviewing documents for {driver.firstName} {driver.lastName}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-4 mt-4 max-h-[400px] overflow-y-auto p-2">
                            {driver.driverProfile?.verificationDocuments && Object.entries(driver.driverProfile.verificationDocuments).map(([key, url]: [string, any]) => (
                              <div key={key} className="space-y-1">
                                <Label className="text-[10px] uppercase text-muted-foreground">{key.replace(/([A-Z])/g, ' $1')}</Label>
                                <div className="aspect-video bg-muted rounded flex items-center justify-center border text-[10px] p-2 text-center">
                                  {url ? (
                                    <img src={url} alt={key} className="object-cover w-full h-full rounded" />
                                  ) : (
                                    "No image uploaded"
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-end gap-2 mt-4">
                            <Button 
                              variant="outline" 
                              onClick={() => handleVerify(driver._id, false)}
                              disabled={processingId === driver._id}
                            >
                              Reject
                            </Button>
                            <Button 
                              onClick={() => handleVerify(driver._id, true)}
                              disabled={processingId === driver._id}
                            >
                              Verify Driver
                            </Button>
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

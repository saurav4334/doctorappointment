import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ambulance, Search, Eye, Clock, MapPin, Phone, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type RequestStatus = "pending" | "dispatched" | "in_transit" | "completed" | "cancelled";

const statusColors: Record<RequestStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  dispatched: "bg-blue-100 text-blue-800",
  in_transit: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels: Record<RequestStatus, string> = {
  pending: "Pending",
  dispatched: "Dispatched",
  in_transit: "In Transit",
  completed: "Completed",
  cancelled: "Cancelled",
};

const emergencyColors: Record<string, string> = {
  normal: "bg-green-100 text-green-800",
  urgent: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const ambulanceTypeLabels: Record<string, string> = {
  basic: "Basic",
  advanced: "Advanced (ALS)",
  icu: "ICU",
  neonatal: "Neonatal",
};

export default function AmbulanceManagement() {
  const { role } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["ambulance-requests", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("ambulance_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("ambulance_requests")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ambulance-requests"] });
      toast({ title: "Status Updated", description: "Ambulance request status has been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    },
  });

  const filtered = requests.filter((r: any) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      r.patient_name?.toLowerCase().includes(s) ||
      r.phone?.toLowerCase().includes(s) ||
      r.pickup_location?.toLowerCase().includes(s)
    );
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r: any) => r.status === "pending").length,
    active: requests.filter((r: any) => ["dispatched", "in_transit"].includes(r.status)).length,
    completed: requests.filter((r: any) => r.status === "completed").length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
            <Ambulance className="h-6 w-6 text-primary" /> Ambulance Requests
          </h1>
          <p className="text-muted-foreground mt-1">Manage incoming ambulance service requests</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "Total Requests", value: stats.total, color: "text-foreground" },
            { label: "Pending", value: stats.pending, color: "text-yellow-600" },
            { label: "Active", value: stats.active, color: "text-blue-600" },
            { label: "Completed", value: stats.completed, color: "text-green-600" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="dispatched">Dispatched</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Pickup Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Emergency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No requests found</TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((req: any) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.patient_name}</TableCell>
                        <TableCell>{req.phone}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{req.pickup_location}</TableCell>
                        <TableCell>{ambulanceTypeLabels[req.ambulance_type] || req.ambulance_type}</TableCell>
                        <TableCell>
                          <Badge className={emergencyColors[req.emergency_level] || ""} variant="secondary">
                            {req.emergency_level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={req.status}
                            onValueChange={(val) => updateStatusMutation.mutate({ id: req.id, status: val })}
                          >
                            <SelectTrigger className="h-8 w-[130px]">
                              <Badge className={statusColors[req.status as RequestStatus] || ""} variant="secondary">
                                {statusLabels[req.status as RequestStatus] || req.status}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="dispatched">Dispatched</SelectItem>
                              <SelectItem value="in_transit">In Transit</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(req.created_at), "MMM d, yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setSelectedRequest(req); setIsViewDialogOpen(true); }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Ambulance Request Details</DialogTitle>
              <DialogDescription>Full details of the ambulance request</DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Patient Name</p>
                    <p className="font-medium">{selectedRequest.patient_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedRequest.phone}</p>
                  </div>
                  {selectedRequest.email && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedRequest.email}</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pickup Location</p>
                  <p className="font-medium flex items-center gap-1"><MapPin className="h-4 w-4 text-primary" />{selectedRequest.pickup_location}</p>
                </div>
                {selectedRequest.destination && (
                  <div>
                    <p className="text-xs text-muted-foreground">Destination</p>
                    <p className="font-medium">{selectedRequest.destination}</p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="font-medium">{ambulanceTypeLabels[selectedRequest.ambulance_type]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Emergency</p>
                    <Badge className={emergencyColors[selectedRequest.emergency_level]} variant="secondary">
                      {selectedRequest.emergency_level}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge className={statusColors[selectedRequest.status as RequestStatus]} variant="secondary">
                      {statusLabels[selectedRequest.status as RequestStatus] || selectedRequest.status}
                    </Badge>
                  </div>
                </div>
                {selectedRequest.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="text-sm">{selectedRequest.notes}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Requested At</p>
                  <p className="text-sm">{format(new Date(selectedRequest.created_at), "PPpp")}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

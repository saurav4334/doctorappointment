import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Search, Eye, Edit, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CreateAppointmentDialog } from "@/components/admin/appointments/CreateAppointmentDialog";

type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";

const statusColors: Record<AppointmentStatus, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-yellow-100 text-yellow-800",
};

export default function AppointmentManagement() {
  const { role, hospitalId, doctorId } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<AppointmentStatus>("scheduled");
  const [editNotes, setEditNotes] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [editPaymentStatus, setEditPaymentStatus] = useState("");
  const [editTransactionId, setEditTransactionId] = useState("");
  const [editPaymentMethod, setEditPaymentMethod] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["admin-appointments", role, hospitalId, doctorId, statusFilter, dateFilter],
    queryFn: async () => {
      let query = supabase
        .from("appointments")
        .select(`
          *,
          doctor:doctors(id, full_name, title, photo_url),
          hospital:hospitals(id, name),
          patient:profiles!appointments_patient_id_fkey(id, full_name, phone),
          department:departments(id, name)
        `)
        .order("appointment_date", { ascending: false })
        .order("appointment_time", { ascending: false });

      // Role-based filtering is handled by RLS policies
      if (role === "hospital_admin" && hospitalId) {
        query = query.eq("hospital_id", hospitalId);
      } else if (role === "doctor" && doctorId) {
        query = query.eq("doctor_id", doctorId);
      }

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (dateFilter) {
        query = query.eq("appointment_date", dateFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
      cancellation_reason,
      payment_status,
      transaction_id,
      payment_method,
    }: {
      id: string;
      status: AppointmentStatus;
      notes?: string;
      cancellation_reason?: string;
      payment_status?: string;
      transaction_id?: string;
      payment_method?: string;
    }) => {
      const { error } = await supabase
        .from("appointments")
        .update({
          status,
          notes,
          cancellation_reason: status === "cancelled" ? cancellation_reason : null,
          payment_status,
          transaction_id,
          payment_method,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      toast({ title: "Success", description: "Appointment updated successfully" });
      setIsEditDialogOpen(false);
      setSelectedAppointment(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update appointment",
        variant: "destructive",
      });
    },
  });

  const filteredAppointments = appointments?.filter((apt) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      apt.appointment_number?.toLowerCase().includes(search) ||
      apt.patient?.full_name?.toLowerCase().includes(search) ||
      apt.doctor?.full_name?.toLowerCase().includes(search) ||
      apt.hospital?.name?.toLowerCase().includes(search)
    );
  });

  const handleViewAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsViewDialogOpen(true);
  };

  const handleEditAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setEditStatus(appointment.status || "scheduled");
    setEditNotes(appointment.notes || "");
    setCancellationReason(appointment.cancellation_reason || "");
    setEditPaymentStatus(appointment.payment_status || "pending");
    setEditTransactionId(appointment.transaction_id || "");
    setEditPaymentMethod(appointment.payment_method || "");
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedAppointment) return;
    updateAppointmentMutation.mutate({
      id: selectedAppointment.id,
      status: editStatus,
      notes: editNotes,
      cancellation_reason: cancellationReason,
      payment_status: editPaymentStatus,
      transaction_id: editTransactionId,
      payment_method: editPaymentMethod,
    });
  };

  const getStatusBadge = (status: string) => {
    const colorClass = statusColors[status as AppointmentStatus] || "bg-gray-100 text-gray-800";
    return (
      <Badge className={`${colorClass} border-0`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1).replace("_", " ")}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Appointment Management
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mt-1">
              View and manage patient appointments
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Appointment
          </Button>
        </div>

        {/* Filters Card */}
        <Card className="rounded-2xl">
          <CardHeader className="py-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient, doctor, or appointment #..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full sm:w-[160px]"
              />
              {(statusFilter !== "all" || dateFilter) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStatusFilter("all");
                    setDateFilter("");
                  }}
                  className="w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Appointment #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  {role === "super_admin" && <TableHead>Hospital</TableHead>}
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading appointments...
                    </TableCell>
                  </TableRow>
                ) : filteredAppointments?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No appointments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments?.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-mono text-sm">
                        {appointment.appointment_number || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {appointment.patient?.full_name || "Unknown"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.patient?.phone || "No phone"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {appointment.doctor?.photo_url && (
                            <img
                              src={appointment.doctor.photo_url}
                              alt=""
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium">
                              {appointment.doctor?.title} {appointment.doctor?.full_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.department?.name || "General"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      {role === "super_admin" && (
                        <TableCell>{appointment.hospital?.name || "N/A"}</TableCell>
                      )}
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {format(new Date(appointment.appointment_date), "MMM dd, yyyy")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.appointment_time?.slice(0, 5)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            appointment.payment_status === "paid" ? "default" : "secondary"
                          }
                        >
                          {appointment.payment_status || "pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewAppointment(appointment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAppointment(appointment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>
                Appointment #{selectedAppointment?.appointment_number}
              </DialogDescription>
            </DialogHeader>
            {selectedAppointment && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground">Patient</Label>
                    <p className="font-medium">
                      {selectedAppointment.patient?.full_name || "Unknown"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedAppointment.patient?.phone}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Doctor</Label>
                    <p className="font-medium">
                      {selectedAppointment.doctor?.title}{" "}
                      {selectedAppointment.doctor?.full_name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Hospital</Label>
                    <p className="font-medium">
                      {selectedAppointment.hospital?.name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Department</Label>
                    <p className="font-medium">
                      {selectedAppointment.department?.name || "General"}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground">Date & Time</Label>
                    <p className="font-medium">
                      {format(
                        new Date(selectedAppointment.appointment_date),
                        "MMMM dd, yyyy"
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedAppointment.appointment_time?.slice(0, 5)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedAppointment.status)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Payment</Label>
                    <p className="font-medium">
                      {selectedAppointment.payment_status || "Pending"} -{" "}
                      {selectedAppointment.payment_method || "N/A"}
                    </p>
                    {selectedAppointment.consultation_fee && (
                      <p className="text-sm text-muted-foreground">
                        Fee: ৳{selectedAppointment.consultation_fee}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Reason</Label>
                    <p className="font-medium">
                      {selectedAppointment.reason || "Not specified"}
                    </p>
                  </div>
                </div>
                {selectedAppointment.symptoms && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Symptoms</Label>
                    <p>{selectedAppointment.symptoms}</p>
                  </div>
                )}
                {selectedAppointment.notes && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Notes</Label>
                    <p>{selectedAppointment.notes}</p>
                  </div>
                )}
                {selectedAppointment.cancellation_reason && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">
                      Cancellation Reason
                    </Label>
                    <p className="text-red-600">
                      {selectedAppointment.cancellation_reason}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Appointment</DialogTitle>
              <DialogDescription>
                Update status and notes for appointment #
                {selectedAppointment?.appointment_number}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editStatus}
                  onValueChange={(v) => setEditStatus(v as AppointmentStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editStatus === "cancelled" && (
                <div className="space-y-2">
                  <Label>Cancellation Reason</Label>
                  <Textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Enter reason for cancellation..."
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select value={editPaymentStatus} onValueChange={setEditPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Input
                  value={editPaymentMethod}
                  onChange={(e) => setEditPaymentMethod(e.target.value)}
                  placeholder="e.g. bKash, Cash, Card..."
                />
              </div>
              <div className="space-y-2">
                <Label>Transaction ID</Label>
                <Input
                  value={editTransactionId}
                  onChange={(e) => setEditTransactionId(e.target.value)}
                  placeholder="Enter transaction ID..."
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add notes about this appointment..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={updateAppointmentMutation.isPending}
              >
                {updateAppointmentMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Appointment Dialog */}
        <CreateAppointmentDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["admin-appointments"] })}
        />
      </div>
    </AdminLayout>
  );
}

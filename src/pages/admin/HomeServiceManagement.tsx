import { useState } from "react";
import { ImageUpload } from "@/components/admin/common/ImageUpload";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Home,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function HomeServiceManagement() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Home Services</h1>
          <p className="text-muted-foreground">Manage home service offerings and incoming requests.</p>
        </div>

        <Tabs defaultValue="requests">
          <TabsList>
            <TabsTrigger value="requests">Service Requests</TabsTrigger>
            <TabsTrigger value="services">Manage Services</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-4">
            <RequestsTab />
          </TabsContent>
          <TabsContent value="services" className="mt-4">
            <ServicesTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

/* ─── Requests Tab ─── */
function RequestsTab() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewRequest, setViewRequest] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["admin-home-service-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("home_service_requests")
        .select("*, home_services(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("home_service_requests")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-home-service-requests"] });
      toast.success("Request status updated");
    },
  });

  const deleteRequest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("home_service_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-home-service-requests"] });
      toast.success("Request deleted");
    },
  });

  const filtered = statusFilter === "all" ? requests : requests.filter((r: any) => r.status === statusFilter);

  const statusColor = (s: string) => {
    switch (s) {
      case "pending": return "secondary";
      case "confirmed": return "default";
      case "completed": return "outline";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} requests</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">No requests found.</div>
      ) : (
        <div className="rounded-xl border bg-card overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((req: any) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.patient_name}</TableCell>
                  <TableCell>{req.home_services?.name || "—"}</TableCell>
                  <TableCell>{req.phone}</TableCell>
                  <TableCell>
                    {req.preferred_date ? format(new Date(req.preferred_date), "dd MMM yyyy") : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColor(req.status) as any} className="capitalize">
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setViewRequest(req)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => deleteRequest.mutate(req.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* View / Update Dialog */}
      <Dialog open={!!viewRequest} onOpenChange={() => setViewRequest(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {viewRequest && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-medium text-foreground">Patient:</span>
                  <span>{viewRequest.patient_name}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-0.5 text-primary" />
                  <span>{viewRequest.phone}</span>
                </div>
                {viewRequest.email && (
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 mt-0.5 text-primary" />
                    <span>{viewRequest.email}</span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <Home className="h-4 w-4 mt-0.5 text-primary" />
                  <span>{viewRequest.home_services?.name || "N/A"}</span>
                </div>
                <div className="flex items-start gap-2 sm:col-span-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                  <span>{viewRequest.address}</span>
                </div>
                {viewRequest.preferred_date && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 mt-0.5 text-primary" />
                    <span>{format(new Date(viewRequest.preferred_date), "dd MMM yyyy")}</span>
                  </div>
                )}
                {viewRequest.preferred_time && (
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-0.5 text-primary" />
                    <span>{viewRequest.preferred_time}</span>
                  </div>
                )}
              </div>
              {viewRequest.notes && (
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <p className="font-medium text-foreground mb-1">Notes:</p>
                  <p className="text-muted-foreground">{viewRequest.notes}</p>
                </div>
              )}
              <div>
                <Label>Update Status</Label>
                <Select
                  value={viewRequest.status}
                  onValueChange={(val) => {
                    updateStatus.mutate({ id: viewRequest.id, status: val });
                    setViewRequest({ ...viewRequest, status: val });
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Services Tab ─── */
function ServicesTab() {
  const [editService, setEditService] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["admin-home-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("home_services")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (formData.id) {
        const { error } = await supabase.from("home_services").update(formData).eq("id", formData.id);
        if (error) throw error;
      } else {
        const { id, ...rest } = formData;
        const { error } = await supabase.from("home_services").insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-home-services"] });
      queryClient.invalidateQueries({ queryKey: ["home-services"] });
      toast.success("Service saved");
      setShowForm(false);
      setEditService(null);
    },
    onError: () => toast.error("Failed to save service"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("home_services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-home-services"] });
      queryClient.invalidateQueries({ queryKey: ["home-services"] });
      toast.success("Service deleted");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    saveMutation.mutate({
      id: editService?.id || undefined,
      name: form.get("name") as string,
      description: form.get("description") as string || null,
      image_url: imageUrl,
      sort_order: parseInt(form.get("sort_order") as string) || 0,
      is_active: editService?.is_active ?? true,
      updated_at: new Date().toISOString(),
    });
  };

  const openEdit = (svc: any) => {
    setEditService(svc);
    setImageUrl(svc.image_url || null);
    setShowForm(true);
  };

  const openNew = () => {
    setEditService(null);
    setImageUrl(null);
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Add Service
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : services.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">No services yet.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc: any) => (
            <div key={svc.id} className="rounded-xl border bg-card overflow-hidden">
              {svc.image_url && (
                <img src={svc.image_url} alt={svc.name} className="h-36 w-full object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-foreground">{svc.name}</h3>
                  <Badge variant={svc.is_active ? "default" : "secondary"}>
                    {svc.is_active ? "Active" : "Hidden"}
                  </Badge>
                </div>
                {svc.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{svc.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Order: {svc.sort_order}</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(svc)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => deleteMutation.mutate(svc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditService(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editService ? "Edit Service" : "Add Service"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="svc-name">Service Name *</Label>
              <Input id="svc-name" name="name" required defaultValue={editService?.name || ""} />
            </div>
            <div>
              <Label htmlFor="svc-desc">Description</Label>
              <Textarea id="svc-desc" name="description" rows={2} defaultValue={editService?.description || ""} />
            </div>
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              label="Service Image"
              folder="home-services"
            />
            <div>
              <Label htmlFor="svc-order">Sort Order</Label>
              <Input id="svc-order" name="sort_order" type="number" defaultValue={editService?.sort_order || 0} />
            </div>
            {editService && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={editService.is_active}
                  onCheckedChange={(checked) => setEditService({ ...editService, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editService ? "Update Service" : "Create Service"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

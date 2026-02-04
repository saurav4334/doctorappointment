import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Search, Plus, Edit, Trash2, Building2, MapPin, Phone, Globe } from "lucide-react";

interface Hospital {
  id: string;
  name: string;
  slug: string | null;
  type: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  status: string | null;
  emergency_services: boolean | null;
  facilities: string[] | null;
}

const emptyHospital: Partial<Hospital> = {
  name: "",
  type: "hospital",
  description: "",
  address: "",
  city: "",
  state: "",
  postal_code: "",
  phone: "",
  email: "",
  website: "",
  logo_url: "",
  status: "pending",
  emergency_services: false,
  facilities: [],
};

const HOSPITAL_TYPES = [
  { value: "hospital", label: "Hospital" },
  { value: "clinic", label: "Clinic" },
  { value: "diagnostic", label: "Diagnostic Center" },
  { value: "specialized", label: "Specialized Hospital" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "secondary" },
  { value: "approved", label: "Approved", color: "default" },
  { value: "rejected", label: "Rejected", color: "destructive" },
  { value: "suspended", label: "Suspended", color: "outline" },
];

export default function HospitalManagement() {
  const { toast } = useToast();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Partial<Hospital> | null>(null);
  const [saving, setSaving] = useState(false);
  const [facilitiesInput, setFacilitiesInput] = useState("");

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    setLoading(true);

    // Select only necessary columns for the list view
    const { data, error } = await supabase
      .from("hospitals")
      .select("id, name, slug, type, description, address, city, state, postal_code, phone, email, website, logo_url, status, emergency_services, facilities")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setHospitals(data || []);
    }
    setLoading(false);
  };

  const handleOpenDialog = (hospital?: Hospital) => {
    if (hospital) {
      setEditingHospital(hospital);
      setFacilitiesInput(hospital.facilities?.join(", ") || "");
    } else {
      setEditingHospital({ ...emptyHospital });
      setFacilitiesInput("");
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingHospital?.name) {
      toast({ title: "Error", description: "Hospital name is required", variant: "destructive" });
      return;
    }

    setSaving(true);

    const slug = editingHospital.slug || editingHospital.name.toLowerCase().replace(/\s+/g, "-");

    const payload = {
      name: editingHospital.name,
      slug,
      type: editingHospital.type || "hospital",
      description: editingHospital.description || null,
      address: editingHospital.address || null,
      city: editingHospital.city || null,
      state: editingHospital.state || null,
      postal_code: editingHospital.postal_code || null,
      phone: editingHospital.phone || null,
      email: editingHospital.email || null,
      website: editingHospital.website || null,
      logo_url: editingHospital.logo_url || null,
      status: editingHospital.status || "pending",
      emergency_services: editingHospital.emergency_services ?? false,
      facilities: facilitiesInput
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
    };

    let error;
    if (editingHospital.id) {
      const result = await supabase.from("hospitals").update(payload).eq("id", editingHospital.id);
      error = result.error;
    } else {
      const result = await supabase.from("hospitals").insert([payload]);
      error = result.error;
    }

    setSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: `Hospital ${editingHospital.id ? "updated" : "created"}` });
    setDialogOpen(false);
    setEditingHospital(null);
    fetchHospitals();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hospital?")) return;

    const { error } = await supabase.from("hospitals").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Hospital removed successfully" });
      fetchHospitals();
    }
  };

  const handleStatusChange = async (hospital: Hospital, newStatus: string) => {
    const { error } = await supabase
      .from("hospitals")
      .update({ status: newStatus })
      .eq("id", hospital.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Status updated to ${newStatus}` });
      fetchHospitals();
    }
  };

  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string | null) => {
    const opt = STATUS_OPTIONS.find((s) => s.value === status);
    return (
      <Badge variant={opt?.color as "default" | "secondary" | "destructive" | "outline" || "outline"}>
        {opt?.label || status || "Unknown"}
      </Badge>
    );
  };

  return (
    <AdminLayout allowedRoles={["super_admin"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Hospital Management</h1>
            <p className="text-muted-foreground">Manage hospitals, clinics, and diagnostic centers</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Hospital
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Hospitals</CardTitle>
                <CardDescription>{hospitals.length} hospitals registered</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search hospitals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHospitals.map((hospital) => (
                    <TableRow key={hospital.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={hospital.logo_url || ""} />
                            <AvatarFallback>
                              <Building2 className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{hospital.name}</p>
                            {hospital.emergency_services && (
                              <Badge variant="destructive" className="text-xs">
                                24/7 Emergency
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {HOSPITAL_TYPES.find((t) => t.value === hospital.type)?.label ||
                            hospital.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {hospital.city || hospital.address || "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {hospital.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {hospital.phone}
                            </div>
                          )}
                          {hospital.website && (
                            <div className="flex items-center gap-1">
                              <Globe className="h-3 w-3 text-muted-foreground" />
                              <a
                                href={hospital.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                Website
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={hospital.status || "pending"}
                          onValueChange={(v) => handleStatusChange(hospital, v)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue>{getStatusBadge(hospital.status)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(hospital)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(hospital.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingHospital?.id ? "Edit Hospital" : "Add New Hospital"}
              </DialogTitle>
              <DialogDescription>
                Fill in the hospital information below.
              </DialogDescription>
            </DialogHeader>

            {editingHospital && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hospital Name *</Label>
                    <Input
                      value={editingHospital.name || ""}
                      onChange={(e) =>
                        setEditingHospital({ ...editingHospital, name: e.target.value })
                      }
                      placeholder="Enter hospital name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={editingHospital.type || "hospital"}
                      onValueChange={(v) =>
                        setEditingHospital({ ...editingHospital, type: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HOSPITAL_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={editingHospital.description || ""}
                    onChange={(e) =>
                      setEditingHospital({ ...editingHospital, description: e.target.value })
                    }
                    placeholder="Brief description..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={editingHospital.address || ""}
                    onChange={(e) =>
                      setEditingHospital({ ...editingHospital, address: e.target.value })
                    }
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={editingHospital.city || ""}
                      onChange={(e) =>
                        setEditingHospital({ ...editingHospital, city: e.target.value })
                      }
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State/Division</Label>
                    <Input
                      value={editingHospital.state || ""}
                      onChange={(e) =>
                        setEditingHospital({ ...editingHospital, state: e.target.value })
                      }
                      placeholder="State"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Postal Code</Label>
                    <Input
                      value={editingHospital.postal_code || ""}
                      onChange={(e) =>
                        setEditingHospital({ ...editingHospital, postal_code: e.target.value })
                      }
                      placeholder="Postal code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={editingHospital.phone || ""}
                      onChange={(e) =>
                        setEditingHospital({ ...editingHospital, phone: e.target.value })
                      }
                      placeholder="+880..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={editingHospital.email || ""}
                      onChange={(e) =>
                        setEditingHospital({ ...editingHospital, email: e.target.value })
                      }
                      placeholder="hospital@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input
                      value={editingHospital.website || ""}
                      onChange={(e) =>
                        setEditingHospital({ ...editingHospital, website: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Logo URL</Label>
                    <Input
                      value={editingHospital.logo_url || ""}
                      onChange={(e) =>
                        setEditingHospital({ ...editingHospital, logo_url: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Facilities (comma-separated)</Label>
                  <Input
                    value={facilitiesInput}
                    onChange={(e) => setFacilitiesInput(e.target.value)}
                    placeholder="ICU, Emergency, Pharmacy, Parking, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={editingHospital.status || "pending"}
                      onValueChange={(v) =>
                        setEditingHospital({ ...editingHospital, status: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 pt-8">
                    <Switch
                      checked={editingHospital.emergency_services ?? false}
                      onCheckedChange={(v) =>
                        setEditingHospital({ ...editingHospital, emergency_services: v })
                      }
                    />
                    <Label>24/7 Emergency Services</Label>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingHospital?.id ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

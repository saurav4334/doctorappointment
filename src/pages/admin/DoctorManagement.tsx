import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
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
import { Loader2, Search, Plus, Edit, Trash2, Star } from "lucide-react";

interface Doctor {
  id: string;
  full_name: string;
  title: string | null;
  specializations: string[] | null;
  qualifications: string[] | null;
  experience_years: number | null;
  consultation_fee: number | null;
  photo_url: string | null;
  bio: string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  rating: number | null;
  total_reviews: number | null;
  gender: string | null;
}

const emptyDoctor: Partial<Doctor> = {
  full_name: "",
  title: "Dr.",
  specializations: [],
  qualifications: [],
  experience_years: 0,
  consultation_fee: 0,
  photo_url: "",
  bio: "",
  is_active: true,
  is_featured: false,
  gender: "",
};

export default function DoctorManagement() {
  const { toast } = useToast();
  const { role, hospitalId } = useAdminAuth(["super_admin", "hospital_admin"]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Partial<Doctor> | null>(null);
  const [saving, setSaving] = useState(false);
  const [specializationsInput, setSpecializationsInput] = useState("");
  const [qualificationsInput, setQualificationsInput] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, [hospitalId]);

  const fetchDoctors = async () => {
    setLoading(true);

    // Select only necessary columns for the list view
    let query = supabase
      .from("doctors")
      .select("id, full_name, title, specializations, qualifications, experience_years, consultation_fee, photo_url, bio, is_active, is_featured, rating, total_reviews, gender")
      .order("created_at", { ascending: false });

    // Hospital admins see only their hospital's doctors
    if (role === "hospital_admin" && hospitalId) {
      const { data: doctorHospitals } = await supabase
        .from("doctor_hospitals")
        .select("doctor_id")
        .eq("hospital_id", hospitalId);

      const doctorIds = doctorHospitals?.map((dh) => dh.doctor_id) || [];
      if (doctorIds.length > 0) {
        query = query.in("id", doctorIds);
      } else {
        setDoctors([]);
        setLoading(false);
        return;
      }
    }

    const { data, error } = await query;

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setDoctors(data || []);
    }
    setLoading(false);
  };

  const handleOpenDialog = (doctor?: Doctor) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setSpecializationsInput(doctor.specializations?.join(", ") || "");
      setQualificationsInput(doctor.qualifications?.join(", ") || "");
    } else {
      setEditingDoctor({ ...emptyDoctor });
      setSpecializationsInput("");
      setQualificationsInput("");
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingDoctor?.full_name) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }

    setSaving(true);

    const payload = {
      full_name: editingDoctor.full_name,
      title: editingDoctor.title || "Dr.",
      specializations: specializationsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      qualifications: qualificationsInput
        .split(",")
        .map((q) => q.trim())
        .filter(Boolean),
      experience_years: editingDoctor.experience_years || 0,
      consultation_fee: editingDoctor.consultation_fee || 0,
      photo_url: editingDoctor.photo_url || null,
      bio: editingDoctor.bio || null,
      is_active: editingDoctor.is_active ?? true,
      is_featured: editingDoctor.is_featured ?? false,
      gender: editingDoctor.gender || null,
    };

    let error;
    if (editingDoctor.id) {
      const result = await supabase.from("doctors").update(payload).eq("id", editingDoctor.id);
      error = result.error;
    } else {
      const result = await supabase.from("doctors").insert([payload]);
      error = result.error;
    }

    setSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: `Doctor ${editingDoctor.id ? "updated" : "created"}` });
    setDialogOpen(false);
    setEditingDoctor(null);
    fetchDoctors();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return;

    const { error } = await supabase.from("doctors").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Doctor removed successfully" });
      fetchDoctors();
    }
  };

  const handleToggleActive = async (doctor: Doctor) => {
    const { error } = await supabase
      .from("doctors")
      .update({ is_active: !doctor.is_active })
      .eq("id", doctor.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      fetchDoctors();
    }
  };

  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specializations?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AdminLayout allowedRoles={["super_admin", "hospital_admin"]}>
      <div className="space-y-4 md:space-y-6">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Doctor Management</h1>
            <p className="text-muted-foreground text-sm md:text-base">Manage doctor profiles and information</p>
          </div>
          {role === "super_admin" && (
            <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Doctor
            </Button>
          )}
        </div>

        {/* Search & Filters Card */}
        <Card className="rounded-2xl">
          <CardHeader className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">All Doctors</CardTitle>
                <CardDescription>{doctors.length} doctors registered</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search doctors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Specializations</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Fee</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDoctors.map((doctor) => (
                        <TableRow key={doctor.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={doctor.photo_url || ""} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {doctor.full_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {doctor.title} {doctor.full_name}
                                </p>
                                {doctor.is_featured && (
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    <Star className="h-3 w-3 mr-1" />
                                    Featured
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {doctor.specializations?.slice(0, 2).map((spec) => (
                                <Badge key={spec} variant="outline" className="text-xs">
                                  {spec}
                                </Badge>
                              ))}
                              {(doctor.specializations?.length || 0) > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{(doctor.specializations?.length || 0) - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{doctor.experience_years || 0} years</TableCell>
                          <TableCell>৳{doctor.consultation_fee || 0}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              <span>{doctor.rating || 0}</span>
                              <span className="text-muted-foreground text-xs">
                                ({doctor.total_reviews || 0})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={doctor.is_active ?? false}
                              onCheckedChange={() => handleToggleActive(doctor)}
                            />
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(doctor)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {role === "super_admin" && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(doctor.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden divide-y">
                  {filteredDoctors.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="font-medium">No doctors found</p>
                      <p className="text-sm">Try adjusting your search</p>
                    </div>
                  ) : (
                    filteredDoctors.map((doctor) => (
                      <div key={doctor.id} className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12 shrink-0">
                            <AvatarImage src={doctor.photo_url || ""} />
                            <AvatarFallback className="bg-primary/10 text-primary text-lg">
                              {doctor.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold truncate">
                                  {doctor.title} {doctor.full_name}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {doctor.specializations?.slice(0, 2).map((spec) => (
                                    <Badge key={spec} variant="outline" className="text-xs">
                                      {spec}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <Switch
                                checked={doctor.is_active ?? false}
                                onCheckedChange={() => handleToggleActive(doctor)}
                              />
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                              <span>{doctor.experience_years || 0} yrs exp</span>
                              <span>৳{doctor.consultation_fee || 0}</span>
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                {doctor.rating || 0}
                              </span>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDialog(doctor)}
                                className="flex-1"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              {role === "super_admin" && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDelete(doctor.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDoctor?.id ? "Edit Doctor" : "Add New Doctor"}
              </DialogTitle>
              <DialogDescription>
                Fill in the doctor's information below.
              </DialogDescription>
            </DialogHeader>

            {editingDoctor && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Select
                      value={editingDoctor.title || "Dr."}
                      onValueChange={(v) =>
                        setEditingDoctor({ ...editingDoctor, title: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dr.">Dr.</SelectItem>
                        <SelectItem value="Prof.">Prof.</SelectItem>
                        <SelectItem value="Assoc. Prof.">Assoc. Prof.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={editingDoctor.full_name || ""}
                      onChange={(e) =>
                        setEditingDoctor({ ...editingDoctor, full_name: e.target.value })
                      }
                      placeholder="Enter full name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select
                      value={editingDoctor.gender || ""}
                      onValueChange={(v) =>
                        setEditingDoctor({ ...editingDoctor, gender: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Photo URL</Label>
                    <Input
                      value={editingDoctor.photo_url || ""}
                      onChange={(e) =>
                        setEditingDoctor({ ...editingDoctor, photo_url: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Specializations (comma-separated)</Label>
                  <Input
                    value={specializationsInput}
                    onChange={(e) => setSpecializationsInput(e.target.value)}
                    placeholder="Cardiology, Internal Medicine, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Qualifications (comma-separated)</Label>
                  <Input
                    value={qualificationsInput}
                    onChange={(e) => setQualificationsInput(e.target.value)}
                    placeholder="MBBS, MD, FCPS, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Experience (years)</Label>
                    <Input
                      type="number"
                      value={editingDoctor.experience_years || 0}
                      onChange={(e) =>
                        setEditingDoctor({
                          ...editingDoctor,
                          experience_years: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Consultation Fee (৳)</Label>
                    <Input
                      type="number"
                      value={editingDoctor.consultation_fee || 0}
                      onChange={(e) =>
                        setEditingDoctor({
                          ...editingDoctor,
                          consultation_fee: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    value={editingDoctor.bio || ""}
                    onChange={(e) =>
                      setEditingDoctor({ ...editingDoctor, bio: e.target.value })
                    }
                    placeholder="Brief description about the doctor..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingDoctor.is_active ?? true}
                      onCheckedChange={(v) =>
                        setEditingDoctor({ ...editingDoctor, is_active: v })
                      }
                    />
                    <Label>Active</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingDoctor.is_featured ?? false}
                      onCheckedChange={(v) =>
                        setEditingDoctor({ ...editingDoctor, is_featured: v })
                      }
                    />
                    <Label>Featured</Label>
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
                {editingDoctor?.id ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

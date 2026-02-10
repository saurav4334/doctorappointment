import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Building2, Stethoscope, Link2 } from "lucide-react";

export default function DoctorHospitalAssignment() {
  const { loading, role, hospitalId } = useAdminAuth(["super_admin", "hospital_admin"]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [filterDoctor, setFilterDoctor] = useState("all");
  const [filterHospital, setFilterHospital] = useState("all");

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["doctor-hospital-assignments", role, hospitalId, filterDoctor, filterHospital],
    queryFn: async () => {
      let query = supabase
        .from("doctor_hospitals")
        .select(`
          *,
          doctors:doctor_id (id, full_name, title),
          hospitals:hospital_id (id, name),
          departments:department_id (id, name)
        `)
        .order("created_at", { ascending: false });

      if (role === "hospital_admin" && hospitalId) {
        query = query.eq("hospital_id", hospitalId);
      }
      if (filterDoctor !== "all") query = query.eq("doctor_id", filterDoctor);
      if (filterHospital !== "all") query = query.eq("hospital_id", filterHospital);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !loading,
  });

  const { data: doctors } = useQuery({
    queryKey: ["all-doctors-for-assign"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("id, full_name, title")
        .eq("is_active", true)
        .order("full_name");
      if (error) throw error;
      return data;
    },
    enabled: !loading,
  });

  const { data: hospitals } = useQuery({
    queryKey: ["all-hospitals-for-assign", role, hospitalId],
    queryFn: async () => {
      let query = supabase.from("hospitals").select("id, name").order("name");
      if (role === "hospital_admin" && hospitalId) {
        query = query.eq("id", hospitalId);
      } else {
        query = query.eq("status", "approved");
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !loading,
  });

  const { data: departments } = useQuery({
    queryKey: ["all-departments-for-assign"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !loading,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("doctor_hospitals").insert({
        doctor_id: selectedDoctor,
        hospital_id: selectedHospital,
        department_id: selectedDepartment || null,
        is_primary: isPrimary,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-hospital-assignments"] });
      toast({ title: "Success", description: "Doctor assigned to hospital successfully." });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("doctor_hospitals")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-hospital-assignments"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("doctor_hospitals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-hospital-assignments"] });
      toast({ title: "Deleted", description: "Assignment removed." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedDoctor("");
    setSelectedHospital("");
    setSelectedDepartment("");
    setIsPrimary(false);
  };

  const handleSubmit = () => {
    if (!selectedDoctor || !selectedHospital) {
      toast({ title: "Validation Error", description: "Select both doctor and hospital.", variant: "destructive" });
      return;
    }
    createMutation.mutate();
  };

  if (loading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout allowedRoles={["super_admin", "hospital_admin"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Doctor-Hospital Assignments</h1>
            <p className="text-muted-foreground">Assign doctors to hospitals and departments</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Assign Doctor
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Filters</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="w-full sm:w-64">
                <Label>Doctor</Label>
                <Select value={filterDoctor} onValueChange={setFilterDoctor}>
                  <SelectTrigger><SelectValue placeholder="All Doctors" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    {doctors?.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.title} {d.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {role === "super_admin" && (
                <div className="w-full sm:w-64">
                  <Label>Hospital</Label>
                  <Select value={filterHospital} onValueChange={setFilterHospital}>
                    <SelectTrigger><SelectValue placeholder="All Hospitals" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Hospitals</SelectItem>
                      {hospitals?.map((h) => (
                        <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assignments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Assignments ({assignments?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Primary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Link2 className="h-8 w-8" />
                        <p>No assignments found</p>
                        <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
                          Create first assignment
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  assignments?.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-muted-foreground" />
                          {a.doctors?.title} {a.doctors?.full_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {a.hospitals?.name}
                        </div>
                      </TableCell>
                      <TableCell>{a.departments?.name || "—"}</TableCell>
                      <TableCell>
                        {a.is_primary && <Badge variant="secondary">Primary</Badge>}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={a.is_active ?? true}
                          onCheckedChange={(checked) =>
                            toggleActiveMutation.mutate({ id: a.id, is_active: checked })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Remove this assignment?")) deleteMutation.mutate(a.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Assign Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Doctor to Hospital</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Doctor</Label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                  <SelectContent>
                    {doctors?.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.title} {d.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hospital</Label>
                <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                  <SelectTrigger><SelectValue placeholder="Select hospital" /></SelectTrigger>
                  <SelectContent>
                    {hospitals?.map((h) => (
                      <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department (optional)</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {departments?.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Primary Hospital</Label>
                <Switch checked={isPrimary} onCheckedChange={setIsPrimary} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Assigning..." : "Assign Doctor"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

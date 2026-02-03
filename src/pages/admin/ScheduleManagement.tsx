import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Clock, Building2, Calendar } from "lucide-react";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

interface ScheduleFormData {
  doctor_id: string;
  hospital_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  max_patients_per_slot: number;
  is_active: boolean;
}

const defaultFormData: ScheduleFormData = {
  doctor_id: "",
  hospital_id: "",
  day_of_week: 1,
  start_time: "09:00",
  end_time: "17:00",
  slot_duration_minutes: 30,
  max_patients_per_slot: 1,
  is_active: true,
};

export default function ScheduleManagement() {
  const { loading, role, hospitalId, doctorId } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>(defaultFormData);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [selectedHospital, setSelectedHospital] = useState<string>("all");

  // Set default doctor for doctor role
  useEffect(() => {
    if (role === "doctor" && doctorId) {
      setSelectedDoctor(doctorId);
      setFormData((prev) => ({ ...prev, doctor_id: doctorId }));
    }
  }, [role, doctorId]);

  // Fetch schedules based on role
  const { data: schedules, isLoading: schedulesLoading } = useQuery({
    queryKey: ["schedules", role, hospitalId, doctorId, selectedDoctor, selectedHospital],
    queryFn: async () => {
      let query = supabase
        .from("doctor_schedules")
        .select(`
          *,
          doctors:doctor_id (id, full_name, title),
          hospitals:hospital_id (id, name)
        `)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });

      if (role === "doctor" && doctorId) {
        query = query.eq("doctor_id", doctorId);
      } else if (role === "hospital_admin" && hospitalId) {
        query = query.eq("hospital_id", hospitalId);
      } else if (selectedDoctor !== "all") {
        query = query.eq("doctor_id", selectedDoctor);
      }

      if (selectedHospital !== "all" && role !== "hospital_admin") {
        query = query.eq("hospital_id", selectedHospital);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !loading,
  });

  // Fetch doctors for dropdown
  const { data: doctors } = useQuery({
    queryKey: ["doctors-list", role, hospitalId],
    queryFn: async () => {
      let query = supabase.from("doctors").select("id, full_name, title").eq("is_active", true);

      if (role === "hospital_admin" && hospitalId) {
        const { data: doctorHospitals } = await supabase
          .from("doctor_hospitals")
          .select("doctor_id")
          .eq("hospital_id", hospitalId)
          .eq("is_active", true);

        const doctorIds = doctorHospitals?.map((dh) => dh.doctor_id) || [];
        query = query.in("id", doctorIds);
      }

      const { data, error } = await query.order("full_name");
      if (error) throw error;
      return data;
    },
    enabled: !loading && role !== "doctor",
  });

  // Fetch hospitals for dropdown
  const { data: hospitals } = useQuery({
    queryKey: ["hospitals-list", role, hospitalId, formData.doctor_id],
    queryFn: async () => {
      if (role === "hospital_admin" && hospitalId) {
        const { data, error } = await supabase
          .from("hospitals")
          .select("id, name")
          .eq("id", hospitalId);
        if (error) throw error;
        return data;
      }

      // Get hospitals where the selected doctor works
      if (formData.doctor_id) {
        const { data: doctorHospitals, error: dhError } = await supabase
          .from("doctor_hospitals")
          .select("hospital_id, hospitals:hospital_id(id, name)")
          .eq("doctor_id", formData.doctor_id)
          .eq("is_active", true);

        if (dhError) throw dhError;
        return doctorHospitals?.map((dh) => dh.hospitals).filter(Boolean) || [];
      }

      const { data, error } = await supabase
        .from("hospitals")
        .select("id, name")
        .eq("status", "approved")
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !loading,
  });

  // Create/Update schedule mutation
  const scheduleMutation = useMutation({
    mutationFn: async (data: ScheduleFormData) => {
      if (editingSchedule) {
        const { error } = await supabase
          .from("doctor_schedules")
          .update({
            day_of_week: data.day_of_week,
            start_time: data.start_time,
            end_time: data.end_time,
            slot_duration_minutes: data.slot_duration_minutes,
            max_patients_per_slot: data.max_patients_per_slot,
            is_active: data.is_active,
          })
          .eq("id", editingSchedule);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("doctor_schedules").insert({
          doctor_id: data.doctor_id,
          hospital_id: data.hospital_id,
          day_of_week: data.day_of_week,
          start_time: data.start_time,
          end_time: data.end_time,
          slot_duration_minutes: data.slot_duration_minutes,
          max_patients_per_slot: data.max_patients_per_slot,
          is_active: data.is_active,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast({
        title: editingSchedule ? "Schedule Updated" : "Schedule Created",
        description: `The schedule has been ${editingSchedule ? "updated" : "created"} successfully.`,
      });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete schedule mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("doctor_schedules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast({
        title: "Schedule Deleted",
        description: "The schedule has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleOpenDialog = (schedule?: any) => {
    if (schedule) {
      setEditingSchedule(schedule.id);
      setFormData({
        doctor_id: schedule.doctor_id,
        hospital_id: schedule.hospital_id,
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        slot_duration_minutes: schedule.slot_duration_minutes || 30,
        max_patients_per_slot: schedule.max_patients_per_slot || 1,
        is_active: schedule.is_active ?? true,
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        ...defaultFormData,
        doctor_id: role === "doctor" && doctorId ? doctorId : "",
        hospital_id: role === "hospital_admin" && hospitalId ? hospitalId : "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSchedule(null);
    setFormData({
      ...defaultFormData,
      doctor_id: role === "doctor" && doctorId ? doctorId : "",
      hospital_id: role === "hospital_admin" && hospitalId ? hospitalId : "",
    });
  };

  const handleSubmit = () => {
    if (!formData.doctor_id || !formData.hospital_id) {
      toast({
        title: "Validation Error",
        description: "Please select both a doctor and hospital.",
        variant: "destructive",
      });
      return;
    }

    if (formData.start_time >= formData.end_time) {
      toast({
        title: "Validation Error",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }

    scheduleMutation.mutate(formData);
  };

  const getDayLabel = (dayValue: number) => {
    return DAYS_OF_WEEK.find((d) => d.value === dayValue)?.label || "";
  };

  if (loading || schedulesLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {role === "doctor" ? "My Schedule" : "Schedule Management"}
            </h1>
            <p className="text-muted-foreground">
              {role === "doctor"
                ? "Manage your availability across hospitals"
                : "Manage doctor schedules and availability"}
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Schedule
          </Button>
        </div>

        {/* Filters */}
        {role !== "doctor" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="w-full sm:w-64">
                  <Label>Doctor</Label>
                  <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Doctors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Doctors</SelectItem>
                      {doctors?.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.title} {doctor.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {role === "super_admin" && (
                  <div className="w-full sm:w-64">
                    <Label>Hospital</Label>
                    <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Hospitals" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Hospitals</SelectItem>
                        {hospitals?.map((hospital: any) => (
                          <SelectItem key={hospital.id} value={hospital.id}>
                            {hospital.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schedules Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedules ({schedules?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {role !== "doctor" && <TableHead>Doctor</TableHead>}
                  <TableHead>Hospital</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Slot Duration</TableHead>
                  <TableHead>Max Patients</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={role !== "doctor" ? 8 : 7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Clock className="h-8 w-8" />
                        <p>No schedules found</p>
                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog()}>
                          Add your first schedule
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  schedules?.map((schedule: any) => (
                    <TableRow key={schedule.id}>
                      {role !== "doctor" && (
                        <TableCell className="font-medium">
                          {schedule.doctors?.title} {schedule.doctors?.full_name}
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {schedule.hospitals?.name}
                        </div>
                      </TableCell>
                      <TableCell>{getDayLabel(schedule.day_of_week)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {schedule.start_time} - {schedule.end_time}
                        </div>
                      </TableCell>
                      <TableCell>{schedule.slot_duration_minutes} mins</TableCell>
                      <TableCell>{schedule.max_patients_per_slot}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            schedule.is_active
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {schedule.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(schedule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this schedule?")) {
                                deleteMutation.mutate(schedule.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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

        {/* Add/Edit Schedule Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? "Edit Schedule" : "Add New Schedule"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {role !== "doctor" && (
                <div className="space-y-2">
                  <Label>Doctor</Label>
                  <Select
                    value={formData.doctor_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, doctor_id: value, hospital_id: "" })
                    }
                    disabled={!!editingSchedule}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors?.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.title} {doctor.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Hospital</Label>
                <Select
                  value={formData.hospital_id}
                  onValueChange={(value) => setFormData({ ...formData, hospital_id: value })}
                  disabled={!!editingSchedule || (role === "hospital_admin" && !!hospitalId)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals?.map((hospital: any) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select
                  value={formData.day_of_week.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, day_of_week: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Slot Duration (mins)</Label>
                  <Input
                    type="number"
                    min={5}
                    max={120}
                    value={formData.slot_duration_minutes}
                    onChange={(e) =>
                      setFormData({ ...formData, slot_duration_minutes: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Patients/Slot</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.max_patients_per_slot}
                    onChange={(e) =>
                      setFormData({ ...formData, max_patients_per_slot: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={scheduleMutation.isPending}>
                {scheduleMutation.isPending
                  ? "Saving..."
                  : editingSchedule
                  ? "Update Schedule"
                  : "Add Schedule"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

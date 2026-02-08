import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Save, UserCog } from "lucide-react";
import { toast } from "sonner";

interface DoctorData {
  id: string;
  full_name: string;
  title: string | null;
  bio: string | null;
  qualifications: string[] | null;
  specializations: string[] | null;
  experience_years: number | null;
  consultation_fee: number | null;
  languages: string[] | null;
  photo_url: string | null;
}

export default function DoctorProfileSettings() {
  const { role, doctorId } = useAdminAuth(["doctor"]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<DoctorData | null>(null);

  useEffect(() => {
    if (doctorId) {
      fetchDoctorData();
    } else {
      setLoading(false);
    }
  }, [doctorId]);

  const fetchDoctorData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("doctors")
      .select("id, full_name, title, bio, qualifications, specializations, experience_years, consultation_fee, languages, photo_url")
      .eq("id", doctorId)
      .single();

    if (error) {
      toast.error("Failed to load profile data");
    } else {
      setFormData(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setSaving(true);
    const { error } = await supabase
      .from("doctors")
      .update({
        full_name: formData.full_name,
        title: formData.title,
        bio: formData.bio,
        qualifications: formData.qualifications,
        specializations: formData.specializations,
        experience_years: formData.experience_years,
        consultation_fee: formData.consultation_fee,
        languages: formData.languages,
        photo_url: formData.photo_url,
      })
      .eq("id", doctorId);

    if (error) {
      toast.error("Failed to update profile: " + error.message);
    } else {
      toast.success("Profile updated successfully");
    }
    setSaving(false);
  };

  const handleArrayChange = (field: "qualifications" | "specializations" | "languages", value: string) => {
    if (!formData) return;
    const items = value.split(",").map((item) => item.trim()).filter(Boolean);
    setFormData({ ...formData, [field]: items.length > 0 ? items : null });
  };

  if (loading) {
    return (
      <AdminLayout allowedRoles={["doctor"]}>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (!formData) {
    return (
      <AdminLayout allowedRoles={["doctor"]}>
        <div className="text-center py-16">
          <UserCog className="h-12 w-12 mx-auto text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No Doctor Profile</h2>
          <p className="text-muted-foreground">Your doctor profile has not been created yet.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout allowedRoles={["doctor"]}>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">Update your doctor profile information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your professional details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Professional Title</Label>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="MBBS, MD (Cardiology)"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio || ""}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  placeholder="Brief introduction about yourself..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo_url">Photo URL</Label>
                <Input
                  id="photo_url"
                  type="url"
                  value={formData.photo_url || ""}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
              <CardDescription>Experience and fees</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="experience_years">Years of Experience</Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  value={formData.experience_years || ""}
                  onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || null })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consultation_fee">Consultation Fee (৳)</Label>
                <Input
                  id="consultation_fee"
                  type="number"
                  min="0"
                  value={formData.consultation_fee || ""}
                  onChange={(e) => setFormData({ ...formData, consultation_fee: parseInt(e.target.value) || null })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Qualifications & Specializations</CardTitle>
              <CardDescription>Comma-separated lists</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qualifications">Qualifications</Label>
                <Textarea
                  id="qualifications"
                  value={formData.qualifications?.join(", ") || ""}
                  onChange={(e) => handleArrayChange("qualifications", e.target.value)}
                  placeholder="MBBS - Medical College 2010, MD - Cardiology 2015"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specializations">Specializations</Label>
                <Textarea
                  id="specializations"
                  value={formData.specializations?.join(", ") || ""}
                  onChange={(e) => handleArrayChange("specializations", e.target.value)}
                  placeholder="Cardiology, Heart Surgery, ECG"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="languages">Languages Spoken</Label>
                <Input
                  id="languages"
                  value={formData.languages?.join(", ") || ""}
                  onChange={(e) => handleArrayChange("languages", e.target.value)}
                  placeholder="Bengali, English, Hindi"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

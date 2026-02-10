import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2, Star, MessageSquareQuote } from "lucide-react";
import { toast } from "sonner";
import { DataCard, EmptyState } from "@/components/admin/common/DataCard";

interface Testimonial {
  id: string;
  patient_name: string;
  content: string;
  rating: number | null;
  patient_photo_url: string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
}

const emptyForm = {
  patient_name: "",
  content: "",
  rating: 5,
  patient_photo_url: "",
  is_active: true,
  is_featured: false,
};

export default function CMSTestimonials() {
  useAdminAuth(["super_admin"]);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Testimonial[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
    if (error) toast.error("Failed to load testimonials");
    else setItems(data || []);
    setLoading(false);
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({ patient_name: t.patient_name, content: t.content, rating: t.rating ?? 5, patient_photo_url: t.patient_photo_url || "", is_active: t.is_active ?? true, is_featured: t.is_featured ?? false });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.patient_name.trim() || !form.content.trim()) { toast.error("Name and content required"); return; }
    setSaving(true);
    const payload = { ...form, patient_photo_url: form.patient_photo_url || null };
    if (editing) {
      const { error } = await supabase.from("testimonials").update(payload).eq("id", editing.id);
      error ? toast.error("Failed to update") : toast.success("Updated");
    } else {
      const { error } = await supabase.from("testimonials").insert(payload);
      error ? toast.error("Failed to create") : toast.success("Created");
    }
    setSaving(false);
    setDialogOpen(false);
    fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    error ? toast.error("Failed to delete") : (toast.success("Deleted"), fetch());
  };

  if (loading) {
    return <AdminLayout allowedRoles={["super_admin"]}><div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></AdminLayout>;
  }

  return (
    <AdminLayout allowedRoles={["super_admin"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Testimonials</h1>
            <p className="text-muted-foreground">Manage patient testimonials</p>
          </div>
          <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Testimonial</Button>
        </div>

        {items.length === 0 ? (
          <DataCard><EmptyState icon={<MessageSquareQuote className="h-8 w-8 text-muted-foreground" />} title="No testimonials" action={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add</Button>} /></DataCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <Card key={t.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {t.patient_photo_url && <img src={t.patient_photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />}
                      <div>
                        <p className="font-semibold text-sm text-foreground">{t.patient_name}</p>
                        <div className="flex gap-0.5">{Array.from({ length: t.rating || 5 }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {t.is_featured && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Featured</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${t.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{t.is_active ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{t.content}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(t)}><Pencil className="h-3 w-3 mr-1" />Edit</Button>
                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Patient Name *</Label><Input value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Content *</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Rating (1-5)</Label><Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) || 5 })} /></div>
                <div className="space-y-2"><Label>Photo URL</Label><Input value={form.patient_photo_url} onChange={(e) => setForm({ ...form, patient_photo_url: e.target.value })} /></div>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label>Active</Label></div>
                <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} /><Label>Featured</Label></div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{editing ? "Update" : "Create"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

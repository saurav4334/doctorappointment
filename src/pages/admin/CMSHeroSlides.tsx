import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2, Image } from "lucide-react";
import { toast } from "sonner";
import { DataCard, EmptyState } from "@/components/admin/common/DataCard";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  sort_order: number;
  is_active: boolean;
}

const emptySlide: Omit<HeroSlide, "id"> = {
  title: "",
  subtitle: "",
  image_url: "",
  cta_text: "",
  cta_link: "",
  sort_order: 0,
  is_active: true,
};

export default function CMSHeroSlides() {
  useAdminAuth(["super_admin"]);
  const [loading, setLoading] = useState(true);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [form, setForm] = useState(emptySlide);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    const { data, error } = await supabase
      .from("cms_hero_slides")
      .select("*")
      .order("sort_order");
    if (error) toast.error("Failed to load slides");
    else setSlides(data || []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptySlide, sort_order: slides.length });
    setDialogOpen(true);
  };

  const openEdit = (s: HeroSlide) => {
    setEditing(s);
    setForm({ title: s.title, subtitle: s.subtitle, image_url: s.image_url, cta_text: s.cta_text, cta_link: s.cta_link, sort_order: s.sort_order, is_active: s.is_active });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    if (editing) {
      const { error } = await supabase.from("cms_hero_slides").update(form).eq("id", editing.id);
      if (error) toast.error("Failed to update slide");
      else toast.success("Slide updated");
    } else {
      const { error } = await supabase.from("cms_hero_slides").insert(form);
      if (error) toast.error("Failed to create slide");
      else toast.success("Slide created");
    }
    setSaving(false);
    setDialogOpen(false);
    fetchSlides();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this slide?")) return;
    const { error } = await supabase.from("cms_hero_slides").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Deleted"); fetchSlides(); }
  };

  if (loading) {
    return (
      <AdminLayout allowedRoles={["super_admin"]}>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout allowedRoles={["super_admin"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Hero Slides</h1>
            <p className="text-muted-foreground">Manage homepage hero banner slides</p>
          </div>
          <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Slide</Button>
        </div>

        {slides.length === 0 ? (
          <DataCard>
            <EmptyState icon={<Image className="h-8 w-8 text-muted-foreground" />} title="No slides yet" description="Add your first hero slide" action={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Slide</Button>} />
          </DataCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {slides.map((s) => (
              <Card key={s.id} className="overflow-hidden">
                {s.image_url && (
                  <div className="h-32 bg-muted">
                    <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{s.title}</h3>
                      {s.subtitle && <p className="text-sm text-muted-foreground">{s.subtitle}</p>}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${s.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {s.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(s)}><Pencil className="h-3 w-3 mr-1" />Edit</Button>
                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Slide" : "Add New Slide"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Textarea value={form.subtitle || ""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input value={form.image_url || ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CTA Text</Label>
                  <Input value={form.cta_text || ""} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} placeholder="Book Now" />
                </div>
                <div className="space-y-2">
                  <Label>CTA Link</Label>
                  <Input value={form.cta_link || ""} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} placeholder="/doctors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                  <Label>Active</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editing ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

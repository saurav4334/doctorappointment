import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2, FileText, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { DataCard, EmptyState } from "@/components/admin/common/DataCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  featured_image_url: string | null;
  page_type: string;
  status: string;
  meta_title: string | null;
  meta_description: string | null;
  is_featured: boolean;
  published_at: string | null;
  created_at: string | null;
}

const emptyForm = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  featured_image_url: "",
  page_type: "page" as string,
  status: "draft" as string,
  meta_title: "",
  meta_description: "",
  is_featured: false,
};

export default function CMSPages() {
  const { user } = useAdminAuth(["super_admin"]);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CMSPage | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => { fetchPages(); }, []);

  const fetchPages = async () => {
    const { data, error } = await supabase.from("cms_pages").select("*").order("created_at", { ascending: false });
    if (error) toast.error("Failed to load pages");
    else setPages(data || []);
    setLoading(false);
  };

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: CMSPage) => {
    setEditing(p);
    setForm({
      title: p.title, slug: p.slug, content: p.content || "", excerpt: p.excerpt || "",
      featured_image_url: p.featured_image_url || "", page_type: p.page_type, status: p.status,
      meta_title: p.meta_title || "", meta_description: p.meta_description || "", is_featured: p.is_featured,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) { toast.error("Title and slug required"); return; }
    setSaving(true);
    const payload = {
      ...form,
      featured_image_url: form.featured_image_url || null,
      excerpt: form.excerpt || null,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      published_at: form.status === "published" ? new Date().toISOString() : null,
      author_id: user?.id || null,
    };
    if (editing) {
      const { error } = await supabase.from("cms_pages").update(payload).eq("id", editing.id);
      error ? toast.error("Failed to update: " + error.message) : toast.success("Page updated");
    } else {
      const { error } = await supabase.from("cms_pages").insert(payload);
      error ? toast.error("Failed to create: " + error.message) : toast.success("Page created");
    }
    setSaving(false);
    setDialogOpen(false);
    fetchPages();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this page?")) return;
    const { error } = await supabase.from("cms_pages").delete().eq("id", id);
    error ? toast.error("Failed to delete") : (toast.success("Deleted"), fetchPages());
  };

  const toggleStatus = async (p: CMSPage) => {
    const newStatus = p.status === "published" ? "draft" : "published";
    const { error } = await supabase.from("cms_pages").update({
      status: newStatus,
      published_at: newStatus === "published" ? new Date().toISOString() : null,
    }).eq("id", p.id);
    error ? toast.error("Failed to update") : (toast.success(`${newStatus === "published" ? "Published" : "Unpublished"}`), fetchPages());
  };

  const filtered = filter === "all" ? pages : pages.filter((p) => p.page_type === filter);

  if (loading) {
    return <AdminLayout allowedRoles={["super_admin"]}><div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></AdminLayout>;
  }

  return (
    <AdminLayout allowedRoles={["super_admin"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pages & Blog</h1>
            <p className="text-muted-foreground">Create and manage pages and blog posts</p>
          </div>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="page">Pages</SelectItem>
                <SelectItem value="blog">Blog</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add New</Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <DataCard><EmptyState icon={<FileText className="h-8 w-8 text-muted-foreground" />} title="No pages yet" description="Create your first page or blog post" action={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Create</Button>} /></DataCard>
        ) : (
          <DataCard noPadding>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{p.title}</p>
                        <p className="text-xs text-muted-foreground">/{p.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{p.page_type}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={p.status === "published" ? "default" : "secondary"}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.created_at ? format(new Date(p.created_at), "MMM dd, yyyy") : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => toggleStatus(p)} title={p.status === "published" ? "Unpublish" : "Publish"}>
                          {p.status === "published" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataCard>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Create"} {form.page_type === "blog" ? "Blog Post" : "Page"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={(e) => {
                    setForm({ ...form, title: e.target.value, slug: editing ? form.slug : generateSlug(e.target.value) });
                  }} />
                </div>
                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.page_type} onValueChange={(v) => setForm({ ...form, page_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="page">Page</SelectItem>
                      <SelectItem value="blog">Blog Post</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} placeholder="Brief summary..." />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} placeholder="Write your content here..." className="font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label>Featured Image URL</Label>
                <Input value={form.featured_image_url} onChange={(e) => setForm({ ...form, featured_image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Meta Title</Label><Input value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} /></div>
                <div className="space-y-2"><Label>Meta Description</Label><Input value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} /></div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
                <Label>Featured</Label>
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

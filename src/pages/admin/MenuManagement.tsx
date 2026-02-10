import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Pencil, Trash2, Menu, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { DataCard, EmptyState } from "@/components/admin/common/DataCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface MenuItem {
  id: string;
  label: string;
  url: string;
  sort_order: number;
  parent_id: string | null;
  is_active: boolean;
  open_in_new_tab: boolean;
  icon: string | null;
  created_at: string;
}

const emptyForm = {
  label: "",
  url: "",
  sort_order: 0,
  parent_id: null as string | null,
  is_active: true,
  open_in_new_tab: false,
  icon: "",
};

export default function MenuManagement() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) toast.error("Failed to load menu items");
    else setItems(data || []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditing(item);
    setForm({
      label: item.label,
      url: item.url,
      sort_order: item.sort_order,
      parent_id: item.parent_id,
      is_active: item.is_active,
      open_in_new_tab: item.open_in_new_tab,
      icon: item.icon || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.label.trim() || !form.url.trim()) {
      toast.error("Label and URL are required");
      return;
    }
    setSaving(true);
    const payload = {
      label: form.label,
      url: form.url,
      sort_order: form.sort_order,
      parent_id: form.parent_id || null,
      is_active: form.is_active,
      open_in_new_tab: form.open_in_new_tab,
      icon: form.icon || null,
    };

    if (editing) {
      const { error } = await supabase.from("menu_items").update(payload).eq("id", editing.id);
      error ? toast.error("Failed to update") : toast.success("Menu item updated");
    } else {
      const { error } = await supabase.from("menu_items").insert(payload);
      error ? toast.error("Failed to create: " + error.message) : toast.success("Menu item created");
    }
    setSaving(false);
    setDialogOpen(false);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this menu item?")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    error ? toast.error("Failed to delete") : (toast.success("Deleted"), fetchItems());
  };

  const toggleActive = async (item: MenuItem) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ is_active: !item.is_active })
      .eq("id", item.id);
    error ? toast.error("Failed to update") : fetchItems();
  };

  const topLevelItems = items.filter((i) => !i.parent_id);
  const getChildren = (parentId: string) => items.filter((i) => i.parent_id === parentId);

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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Menu Management</h1>
            <p className="text-muted-foreground">Manage header navigation menu items</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Menu Item
          </Button>
        </div>

        {items.length === 0 ? (
          <DataCard>
            <EmptyState
              icon={<Menu className="h-8 w-8 text-muted-foreground" />}
              title="No menu items"
              description="Add menu items to customize your header navigation"
              action={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Item</Button>}
            />
          </DataCard>
        ) : (
          <DataCard noPadding>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topLevelItems.map((item) => (
                  <>
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.sort_order}</TableCell>
                      <TableCell className="font-medium">{item.label}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.url}</TableCell>
                      <TableCell>—</TableCell>
                      <TableCell>
                        <Badge variant={item.is_active ? "default" : "secondary"}>
                          {item.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => toggleActive(item)}>
                            <Switch checked={item.is_active} className="pointer-events-none" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {getChildren(item.id).map((child) => (
                      <TableRow key={child.id} className="bg-muted/30">
                        <TableCell className="font-mono text-sm pl-8">↳ {child.sort_order}</TableCell>
                        <TableCell className="font-medium pl-8">{child.label}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{child.url}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.label}</TableCell>
                        <TableCell>
                          <Badge variant={child.is_active ? "default" : "secondary"}>
                            {child.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(child)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(child.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ))}
              </TableBody>
            </Table>
          </DataCard>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "Add"} Menu Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Label *</Label>
                  <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Home" />
                </div>
                <div className="space-y-2">
                  <Label>URL *</Label>
                  <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="/" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>Parent Item</Label>
                  <Select value={form.parent_id || "none"} onValueChange={(v) => setForm({ ...form, parent_id: v === "none" ? null : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Top Level)</SelectItem>
                      {topLevelItems
                        .filter((i) => i.id !== editing?.id)
                        .map((i) => (
                          <SelectItem key={i.id} value={i.id}>{i.label}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Icon (optional)</Label>
                <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="e.g. phone, mail" />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                  <Label>Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.open_in_new_tab} onCheckedChange={(v) => setForm({ ...form, open_in_new_tab: v })} />
                  <Label>Open in new tab</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
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

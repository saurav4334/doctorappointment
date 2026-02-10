import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/admin/common/ImageUpload";

interface SettingRow {
  id: string;
  setting_key: string;
  setting_value: string | null;
  setting_type: string;
  category: string;
  label: string | null;
}

export default function CMSSiteSettings() {
  useAdminAuth(["super_admin"]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingRow[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .order("category");
    if (error) {
      toast.error("Failed to load settings");
    } else {
      setSettings(data || []);
    }
    setLoading(false);
  };

  const updateValue = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.setting_key === key ? { ...s, setting_value: value } : s))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const promises = settings.map((s) =>
      supabase
        .from("site_settings")
        .update({ setting_value: s.setting_value })
        .eq("id", s.id)
    );
    const results = await Promise.all(promises);
    const hasError = results.some((r) => r.error);
    if (hasError) {
      toast.error("Some settings failed to save");
    } else {
      toast.success("Settings saved successfully");
    }
    setSaving(false);
  };

  const getByCategory = (cat: string) => settings.filter((s) => s.category === cat);

  if (loading) {
    return (
      <AdminLayout allowedRoles={["super_admin"]}>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  const categories = [
    { key: "general", label: "General" },
    { key: "contact", label: "Contact" },
    { key: "social", label: "Social Links" },
    { key: "seo", label: "SEO" },
  ];

  return (
    <AdminLayout allowedRoles={["super_admin"]}>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Site Settings</h1>
            <p className="text-muted-foreground">Manage global site configuration</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save All
          </Button>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-4">
            {categories.map((c) => (
              <TabsTrigger key={c.key} value={c.key}>{c.label}</TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.key} value={cat.key}>
              <Card>
                <CardHeader>
                  <CardTitle>{cat.label} Settings</CardTitle>
                  <CardDescription>Configure {cat.label.toLowerCase()} settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {getByCategory(cat.key).map((s) => (
                    <div key={s.id}>
                      {s.setting_type === "image" ? (
                        <ImageUpload
                          value={s.setting_value || null}
                          onChange={(url) => updateValue(s.setting_key, url || "")}
                          label={s.label || s.setting_key}
                          folder="site"
                        />
                      ) : (
                        <div className="space-y-2">
                          <Label>{s.label || s.setting_key}</Label>
                          <Input
                            value={s.setting_value || ""}
                            onChange={(e) => updateValue(s.setting_key, e.target.value)}
                            placeholder={`Enter ${s.label?.toLowerCase() || s.setting_key}`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  {getByCategory(cat.key).length === 0 && (
                    <p className="text-muted-foreground text-sm">No settings in this category.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AdminLayout>
  );
}

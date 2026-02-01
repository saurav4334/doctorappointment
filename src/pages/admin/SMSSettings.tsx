import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Edit, MessageSquare, Send, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type SMSProvider = {
  id: string;
  name: string;
  provider_type: string;
  api_url: string;
  api_key: string;
  secret_key: string | null;
  sender_id: string | null;
  client_trans_id: string | null;
  additional_config: Record<string, unknown>;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

const PROVIDER_CONFIGS: Record<string, { label: string; fields: string[]; defaultUrl: string }> = {
  khudebarta: {
    label: "Khudebarta",
    fields: ["api_key", "secret_key", "client_trans_id"],
    defaultUrl: "https://portal.khudebarta.com:3770/api/v3/sendsms",
  },
  ssl_wireless: {
    label: "SSL Wireless",
    fields: ["api_key", "sender_id"],
    defaultUrl: "https://smsplus.sslwireless.com/api/v3/send-sms",
  },
  bdbulksms: {
    label: "BD Bulk SMS",
    fields: ["api_key", "sender_id"],
    defaultUrl: "https://api.bdbulksms.com/api.php",
  },
  muthofun: {
    label: "Muthofun",
    fields: ["api_key", "sender_id"],
    defaultUrl: "https://sms.muthofun.com/api/sendsms",
  },
  infobip: {
    label: "Infobip",
    fields: ["api_key", "sender_id"],
    defaultUrl: "https://api.infobip.com/sms/2/text/advanced",
  },
  custom: {
    label: "Custom Provider",
    fields: ["api_key", "secret_key", "sender_id", "client_trans_id"],
    defaultUrl: "",
  },
};

const emptyProvider: Partial<SMSProvider> = {
  name: "",
  provider_type: "khudebarta",
  api_url: PROVIDER_CONFIGS.khudebarta.defaultUrl,
  api_key: "",
  secret_key: "",
  sender_id: "",
  client_trans_id: "",
  is_active: true,
  is_default: false,
  additional_config: {},
};

export default function SMSSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [providers, setProviders] = useState<SMSProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Partial<SMSProvider> | null>(null);
  const [saving, setSaving] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testingId, setTestingId] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role_key")
      .eq("user_id", user.id)
      .eq("is_active", true);

    const isAdmin = roles?.some(r => r.role_key === "super_admin");
    setIsSuperAdmin(!!isAdmin);

    if (!isAdmin) {
      toast({ title: "Access Denied", description: "You don't have permission to access this page.", variant: "destructive" });
      navigate("/");
      return;
    }

    fetchProviders();
  };

  const fetchProviders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sms_providers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProviders((data as unknown as SMSProvider[]) || []);
    }
    setLoading(false);
  };

  const handleProviderTypeChange = (type: string) => {
    setEditingProvider(prev => ({
      ...prev,
      provider_type: type,
      api_url: PROVIDER_CONFIGS[type]?.defaultUrl || "",
    }));
  };

  const handleSave = async () => {
    if (!editingProvider?.name || !editingProvider?.api_url || !editingProvider?.api_key) {
      toast({ title: "Validation Error", description: "Name, API URL and API Key are required", variant: "destructive" });
      return;
    }

    setSaving(true);

    // If setting as default, unset other defaults first
    if (editingProvider.is_default) {
      await supabase
        .from("sms_providers")
        .update({ is_default: false } as Record<string, unknown>)
        .neq("id", editingProvider.id || "");
    }

    const payload = {
      name: editingProvider.name,
      provider_type: editingProvider.provider_type as "khudebarta" | "ssl_wireless" | "bdbulksms" | "muthofun" | "infobip" | "custom",
      api_url: editingProvider.api_url,
      api_key: editingProvider.api_key,
      secret_key: editingProvider.secret_key || null,
      sender_id: editingProvider.sender_id || null,
      client_trans_id: editingProvider.client_trans_id || null,
      additional_config: JSON.parse(JSON.stringify(editingProvider.additional_config || {})),
      is_active: editingProvider.is_active ?? true,
      is_default: editingProvider.is_default ?? false,
    };

    let error;
    if (editingProvider.id) {
      const result = await supabase
        .from("sms_providers")
        .update(payload)
        .eq("id", editingProvider.id);
      error = result.error;
    } else {
      const result = await supabase
        .from("sms_providers")
        .insert([payload]);
      error = result.error;
    }

    setSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Provider ${editingProvider.id ? "updated" : "created"} successfully` });
      setShowDialog(false);
      setEditingProvider(null);
      fetchProviders();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this provider?")) return;

    const { error } = await supabase.from("sms_providers").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Provider removed successfully" });
      fetchProviders();
    }
  };

  const handleTestSMS = async (provider: SMSProvider) => {
    if (!testPhone) {
      toast({ title: "Enter Phone", description: "Please enter a phone number to test", variant: "destructive" });
      return;
    }

    setTestingId(provider.id);
    try {
      const { data, error } = await supabase.functions.invoke("send-sms", {
        body: {
          phone: testPhone,
          message: "Test SMS from Doctor Appointment System - ডাক্তার অ্যাপয়েন্টমেন্ট সিস্টেম থেকে টেস্ট মেসেজ",
          providerId: provider.id,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({ title: "SMS Sent!", description: `Test message sent to ${testPhone}` });
      } else {
        toast({ title: "Failed", description: data?.error || "Failed to send SMS", variant: "destructive" });
      }
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to send test SMS", variant: "destructive" });
    }
    setTestingId(null);
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">SMS Provider Settings</h1>
            <p className="text-muted-foreground">Manage SMS gateway configurations for appointment notifications</p>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                SMS Providers
              </CardTitle>
              <CardDescription>Configure Bangladeshi SMS gateways</CardDescription>
            </div>
            <Button onClick={() => { setEditingProvider({ ...emptyProvider }); setShowDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : providers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No SMS providers configured. Add one to enable SMS notifications.
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center gap-2">
                  <Input
                    placeholder="Enter phone for testing (e.g., 01712345678)"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Default</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {providers.map((provider) => (
                      <TableRow key={provider.id}>
                        <TableCell className="font-medium">{provider.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {PROVIDER_CONFIGS[provider.provider_type]?.label || provider.provider_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={provider.is_active ? "default" : "outline"}>
                            {provider.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {provider.is_default && <Badge variant="default">Default</Badge>}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestSMS(provider)}
                            disabled={testingId === provider.id || !provider.is_active}
                          >
                            {testingId === provider.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setEditingProvider(provider); setShowDialog(true); }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(provider.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingProvider?.id ? "Edit Provider" : "Add SMS Provider"}</DialogTitle>
            </DialogHeader>
            {editingProvider && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Provider Name</Label>
                  <Input
                    value={editingProvider.name || ""}
                    onChange={(e) => setEditingProvider({ ...editingProvider, name: e.target.value })}
                    placeholder="e.g., My Khudebarta Account"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Provider Type</Label>
                  <Select
                    value={editingProvider.provider_type}
                    onValueChange={handleProviderTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROVIDER_CONFIGS).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>API URL</Label>
                  <Input
                    value={editingProvider.api_url || ""}
                    onChange={(e) => setEditingProvider({ ...editingProvider, api_url: e.target.value })}
                    placeholder="https://api.example.com/sms"
                  />
                </div>

                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    value={editingProvider.api_key || ""}
                    onChange={(e) => setEditingProvider({ ...editingProvider, api_key: e.target.value })}
                    placeholder="Your API key"
                  />
                </div>

                {PROVIDER_CONFIGS[editingProvider.provider_type || ""]?.fields.includes("secret_key") && (
                  <div className="space-y-2">
                    <Label>Secret Key</Label>
                    <Input
                      value={editingProvider.secret_key || ""}
                      onChange={(e) => setEditingProvider({ ...editingProvider, secret_key: e.target.value })}
                      placeholder="Your secret key"
                    />
                  </div>
                )}

                {PROVIDER_CONFIGS[editingProvider.provider_type || ""]?.fields.includes("sender_id") && (
                  <div className="space-y-2">
                    <Label>Sender ID</Label>
                    <Input
                      value={editingProvider.sender_id || ""}
                      onChange={(e) => setEditingProvider({ ...editingProvider, sender_id: e.target.value })}
                      placeholder="e.g., MYAPP"
                    />
                  </div>
                )}

                {PROVIDER_CONFIGS[editingProvider.provider_type || ""]?.fields.includes("client_trans_id") && (
                  <div className="space-y-2">
                    <Label>Client Transaction ID / Username</Label>
                    <Input
                      value={editingProvider.client_trans_id || ""}
                      onChange={(e) => setEditingProvider({ ...editingProvider, client_trans_id: e.target.value })}
                      placeholder="Your username or transaction ID"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingProvider.is_active ?? true}
                      onCheckedChange={(checked) => setEditingProvider({ ...editingProvider, is_active: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingProvider.is_default ?? false}
                      onCheckedChange={(checked) => setEditingProvider({ ...editingProvider, is_default: checked })}
                    />
                    <Label>Set as Default</Label>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingProvider?.id ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

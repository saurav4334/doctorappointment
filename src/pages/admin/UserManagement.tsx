import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Loader2, Search, UserPlus, Edit, Shield } from "lucide-react";
import { Label } from "@/components/ui/label";

interface UserWithRoles {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string | null;
  roles: { role_key: string; is_active: boolean }[];
}

const AVAILABLE_ROLES = [
  { key: "super_admin", label: "Super Admin", color: "destructive" },
  { key: "hospital_admin", label: "Hospital Admin", color: "default" },
  { key: "doctor", label: "Doctor", color: "secondary" },
  { key: "patient", label: "Patient", color: "outline" },
];

export default function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [newRole, setNewRole] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, phone, created_at")
      .order("created_at", { ascending: false });

    if (profilesError) {
      toast({ title: "Error", description: profilesError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role_key, is_active");

    if (rolesError) {
      toast({ title: "Error", description: rolesError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const usersWithRoles: UserWithRoles[] = (profiles || []).map((profile) => ({
      ...profile,
      roles: (roles || [])
        .filter((r) => r.user_id === profile.id)
        .map((r) => ({ role_key: r.role_key, is_active: r.is_active ?? true })),
    }));

    setUsers(usersWithRoles);
    setLoading(false);
  };

  const handleAddRole = async () => {
    if (!selectedUser || !newRole) return;

    setSaving(true);
    const { error } = await supabase.from("user_roles").insert({
      user_id: selectedUser.id,
      role_key: newRole,
      is_active: true,
    });

    setSaving(false);

    if (error) {
      if (error.code === "23505") {
        toast({ title: "Error", description: "User already has this role", variant: "destructive" });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
      return;
    }

    toast({ title: "Success", description: "Role added successfully" });
    setRoleDialogOpen(false);
    setNewRole("");
    fetchUsers();
  };

  const handleToggleRole = async (userId: string, roleKey: string, currentActive: boolean) => {
    const { error } = await supabase
      .from("user_roles")
      .update({ is_active: !currentActive })
      .eq("user_id", userId)
      .eq("role_key", roleKey);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: `Role ${currentActive ? "disabled" : "enabled"}` });
    fetchUsers();
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery)
  );

  const getRoleBadgeVariant = (roleKey: string) => {
    const role = AVAILABLE_ROLES.find((r) => r.key === roleKey);
    return (role?.color || "outline") as "default" | "secondary" | "destructive" | "outline";
  };

  return (
    <AdminLayout allowedRoles={["super_admin"]}>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">User Management</h1>
            <p className="text-muted-foreground text-sm md:text-base">Manage users and their roles</p>
          </div>
        </div>

        <Card className="rounded-2xl">
          <CardHeader className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">All Users</CardTitle>
                <CardDescription>{users.length} users registered</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
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
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.full_name || "No name"}
                          </TableCell>
                          <TableCell>{user.phone || "—"}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.roles.map((role) => (
                                <Badge
                                  key={role.role_key}
                                  variant={getRoleBadgeVariant(role.role_key)}
                                  className={!role.is_active ? "opacity-50" : "cursor-pointer"}
                                  onClick={() =>
                                    handleToggleRole(user.id, role.role_key, role.is_active)
                                  }
                                >
                                  {AVAILABLE_ROLES.find((r) => r.key === role.role_key)?.label ||
                                    role.role_key}
                                </Badge>
                              ))}
                              {user.roles.length === 0 && (
                                <span className="text-muted-foreground text-sm">No roles</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.created_at
                              ? new Date(user.created_at).toLocaleDateString()
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setRoleDialogOpen(true);
                              }}
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              Manage Roles
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="font-medium">No users found</p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div key={user.id} className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">
                              {user.full_name || "No name"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {user.phone || "No phone"}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {user.roles.map((role) => (
                                <Badge
                                  key={role.role_key}
                                  variant={getRoleBadgeVariant(role.role_key)}
                                  className={`text-xs ${!role.is_active ? "opacity-50" : ""}`}
                                >
                                  {AVAILABLE_ROLES.find((r) => r.key === role.role_key)?.label ||
                                    role.role_key}
                                </Badge>
                              ))}
                              {user.roles.length === 0 && (
                                <span className="text-muted-foreground text-xs">No roles</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setRoleDialogOpen(true);
                            }}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Roles</DialogTitle>
              <DialogDescription>
                Add or modify roles for {selectedUser?.full_name || "this user"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Current Roles</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedUser?.roles.map((role) => (
                    <Badge
                      key={role.role_key}
                      variant={getRoleBadgeVariant(role.role_key)}
                      className={!role.is_active ? "opacity-50 line-through" : ""}
                    >
                      {AVAILABLE_ROLES.find((r) => r.key === role.role_key)?.label ||
                        role.role_key}
                    </Badge>
                  ))}
                  {(!selectedUser?.roles || selectedUser.roles.length === 0) && (
                    <span className="text-muted-foreground text-sm">No roles assigned</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Add New Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_ROLES.filter(
                      (r) => !selectedUser?.roles.some((ur) => ur.role_key === r.key)
                    ).map((role) => (
                      <SelectItem key={role.key} value={role.key}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRole} disabled={!newRole || saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

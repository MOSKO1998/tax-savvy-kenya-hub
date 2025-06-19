
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Shield,
  Users,
  Eye,
  Settings,
  FileText
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  user_roles?: {
    role: string;
    department: string;
    status: string;
    permissions: string[];
  };
  created_at: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  const [newUser, setNewUser] = useState({
    role: "",
    department: "",
    permissions: [] as string[]
  });

  const roles = [
    { value: "admin", label: "Admin", permissions: ["all"] },
    { value: "tax_staff", label: "Tax Staff", permissions: ["tax_management", "client_management", "document_view"] },
    { value: "readonly", label: "Readonly", permissions: ["view_only"] },
    { value: "it", label: "IT", permissions: ["system_settings", "user_management"] }
  ];

  const departments = ["management", "tax", "audit", "it", "finance", "legal"];

  const permissionsList = [
    { id: "all", label: "Full Access", icon: Shield },
    { id: "tax_management", label: "Tax Management", icon: FileText },
    { id: "client_management", label: "Client Management", icon: Users },
    { id: "document_view", label: "Document View", icon: Eye },
    { id: "system_settings", label: "System Settings", icon: Settings },
    { id: "user_management", label: "User Management", icon: User },
    { id: "view_only", label: "View Only", icon: Eye }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          created_at,
          user_roles (
            role,
            department,
            status,
            permissions
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.user_roles?.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleUpdateUserRole = async (userId: string, roleData: any) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: roleData.role,
          department: roleData.department,
          permissions: roleData.permissions,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully",
      });

      fetchUsers();
      setEditingUser(null);
      setNewUser({ role: "", department: "", permissions: [] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setNewUser({
      role: user.user_roles?.role || "",
      department: user.user_roles?.department || "",
      permissions: user.user_roles?.permissions || []
    });
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    
    const roleData = roles.find(r => r.value === newUser.role);
    handleUpdateUserRole(editingUser.id, {
      role: newUser.role,
      department: newUser.department,
      permissions: roleData?.permissions || []
    });
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ status: newStatus })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "tax_staff": return "bg-blue-100 text-blue-800";
      case "readonly": return "bg-gray-100 text-gray-800";
      case "it": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const UserForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Role</Label>
          <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map(role => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Department</Label>
          <Select value={newUser.department} onValueChange={(value) => setNewUser({ ...newUser, department: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>
                  {dept.charAt(0).toUpperCase() + dept.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {newUser.role && (
        <div className="space-y-2">
          <Label>Permissions (Auto-assigned based on role)</Label>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex flex-wrap gap-2">
              {roles.find(r => r.value === newUser.role)?.permissions.map(permission => {
                const permissionData = permissionsList.find(p => p.id === permission);
                return permissionData ? (
                  <Badge key={permission} variant="secondary" className="flex items-center space-x-1">
                    <permissionData.icon className="h-3 w-3" />
                    <span>{permissionData.label}</span>
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          variant="outline" 
          onClick={() => {
            setEditingUser(null);
            setNewUser({ role: "", department: "", permissions: [] });
          }}
        >
          Cancel
        </Button>
        <Button onClick={handleUpdateUser}>
          Update User
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage system users, roles, and permissions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.user_roles?.status === "active").length}
                </p>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <User className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.user_roles?.role === "admin").length}
                </p>
                <p className="text-sm text-gray-600">Administrators</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Settings className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{roles.length}</p>
                <p className="text-sm text-gray-600">User Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{user.full_name}</h3>
                      <Badge 
                        variant={user.user_roles?.status === "active" ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {user.user_roles?.status || "Unknown"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getRoleColor(user.user_roles?.role || "")}>
                        {user.user_roles?.role || "No Role"}
                      </Badge>
                      <Badge variant="outline">
                        {user.user_roles?.department || "No Department"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {user.user_roles?.permissions?.slice(0, 3).map(permission => {
                        const permissionData = permissionsList.find(p => p.id === permission);
                        return permissionData ? (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {permissionData.label}
                          </Badge>
                        ) : null;
                      })}
                      {(user.user_roles?.permissions?.length || 0) > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{(user.user_roles?.permissions?.length || 0) - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleUserStatus(user.id, user.user_roles?.status || "active")}
                  >
                    {user.user_roles?.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                  <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => {
                    if (!open) {
                      setEditingUser(null);
                      setNewUser({ role: "", department: "", permissions: [] });
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit User: {user.full_name}</DialogTitle>
                      </DialogHeader>
                      <UserForm />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

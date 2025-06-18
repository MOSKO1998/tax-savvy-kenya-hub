
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'Active' | 'Inactive';
  permissions: string[];
  createdAt: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "John Admin",
      email: "admin@taxtrucker.com",
      role: "Admin",
      department: "Management",
      status: "Active",
      permissions: ["all"],
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      name: "Jane Tax Officer",
      email: "taxstaff@taxtrucker.com",
      role: "Tax Staff",
      department: "Tax",
      status: "Active",
      permissions: ["tax_management", "client_management", "document_view"],
      createdAt: "2024-02-10"
    },
    {
      id: 3,
      name: "Mike Viewer",
      email: "readonly@taxtrucker.com",
      role: "Readonly",
      department: "Audit",
      status: "Active",
      permissions: ["view_only"],
      createdAt: "2024-02-20"
    },
    {
      id: 4,
      name: "Sarah IT Support",
      email: "it@taxtrucker.com",
      role: "IT",
      department: "IT",
      status: "Active",
      permissions: ["system_settings", "user_management"],
      createdAt: "2024-01-30"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    permissions: [] as string[]
  });

  const roles = [
    { value: "Admin", label: "Admin", permissions: ["all"] },
    { value: "Tax Staff", label: "Tax Staff", permissions: ["tax_management", "client_management", "document_view"] },
    { value: "Readonly", label: "Readonly", permissions: ["view_only"] },
    { value: "IT", label: "IT", permissions: ["system_settings", "user_management"] }
  ];

  const departments = ["Management", "Tax", "Audit", "IT", "Finance", "Legal"];

  const permissionsList = [
    { id: "all", label: "Full Access", icon: Shield },
    { id: "tax_management", label: "Tax Management", icon: FileText },
    { id: "client_management", label: "Client Management", icon: Users },
    { id: "document_view", label: "Document View", icon: Eye },
    { id: "system_settings", label: "System Settings", icon: Settings },
    { id: "user_management", label: "User Management", icon: User },
    { id: "view_only", label: "View Only", icon: Eye }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = () => {
    const roleData = roles.find(r => r.value === newUser.role);
    const user: User = {
      id: users.length + 1,
      ...newUser,
      status: "Active",
      permissions: roleData?.permissions || [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setUsers([...users, user]);
    setNewUser({ name: "", email: "", role: "", department: "", permissions: [] });
    setIsAddUserOpen(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      permissions: user.permissions
    });
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    
    const roleData = roles.find(r => r.value === newUser.role);
    const updatedUser: User = {
      ...editingUser,
      ...newUser,
      permissions: roleData?.permissions || []
    };
    
    setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
    setEditingUser(null);
    setNewUser({ name: "", email: "", role: "", department: "", permissions: [] });
  };

  const handleDeleteUser = (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const toggleUserStatus = (id: number) => {
    setUsers(users.map(u => 
      u.id === id 
        ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" as 'Active' | 'Inactive' }
        : u
    ));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin": return "bg-red-100 text-red-800";
      case "Tax Staff": return "bg-blue-100 text-blue-800";
      case "Readonly": return "bg-gray-100 text-gray-800";
      case "IT": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const UserForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            placeholder="Enter full name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            placeholder="Enter email address"
          />
        </div>
      </div>
      
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
                  {dept}
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
            setIsAddUserOpen(false);
            setEditingUser(null);
            setNewUser({ name: "", email: "", role: "", department: "", permissions: [] });
          }}
        >
          Cancel
        </Button>
        <Button onClick={editingUser ? handleUpdateUser : handleAddUser}>
          {editingUser ? "Update User" : "Add User"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage system users, roles, and permissions</p>
        </div>
        <Dialog open={isAddUserOpen || !!editingUser} onOpenChange={(open) => {
          if (!open) {
            setIsAddUserOpen(false);
            setEditingUser(null);
            setNewUser({ name: "", email: "", role: "", department: "", permissions: [] });
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddUserOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
            </DialogHeader>
            <UserForm />
          </DialogContent>
        </Dialog>
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
                <p className="text-2xl font-bold">{users.filter(u => u.status === "Active").length}</p>
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
                <p className="text-2xl font-bold">{users.filter(u => u.role === "Admin").length}</p>
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
                      <h3 className="font-medium">{user.name}</h3>
                      <Badge 
                        variant={user.status === "Active" ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {user.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                      <Badge variant="outline">
                        {user.department}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {user.permissions.slice(0, 3).map(permission => {
                        const permissionData = permissionsList.find(p => p.id === permission);
                        return permissionData ? (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {permissionData.label}
                          </Badge>
                        ) : null;
                      })}
                      {user.permissions.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{user.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleUserStatus(user.id)}
                  >
                    {user.status === "Active" ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditUser(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

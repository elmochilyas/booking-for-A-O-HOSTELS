"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Edit, Trash2, Search, Loader2, Key, X, Building2, Shield, UserCheck, UserX } from "lucide-react";
import { adminApi } from "../../services/api";
import { AdminLayout, PageHeader, Card, DataTable, Button, Input, Select, Modal, Badge } from "../components/AdminComponents";

interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  property?: string;
  property_name?: string;
  admin_role_id?: number;
  admin_role_name?: string;
  two_factor_enabled: boolean;
  last_login_at?: string;
  created_at: string;
}

interface Role {
  id: number;
  name: string;
  slug: string;
  level: number;
  description?: string;
}

interface Property {
  id: string;
  name: string;
  location: string;
}

const roleOptions = [
  { value: "superadmin", label: "Super Admin" },
  { value: "regional_admin", label: "Regional Admin" },
  { value: "property_admin", label: "Property Admin" },
  { value: "reception", label: "Reception Staff" },
  { value: "housekeeping", label: "Housekeeping" },
  { value: "maintenance", label: "Maintenance" },
  { value: "manager", label: "Property Manager" },
];

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("");
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "by_property" | "by_role">("all");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "reception",
    property_id: "",
    admin_role_id: "",
    is_active: true,
    two_factor_enabled: false,
  });

  useEffect(() => {
    fetchStaff();
    fetchRoles();
    fetchProperties();
  }, [pagination.current_page, search, roleFilter, propertyFilter]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(pagination.current_page) };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (propertyFilter) params.property = propertyFilter;
      
      const response = await adminApi.getAllStaff(params);
      const staffData = response.data.data.map((s: any) => ({
        ...s,
        property_name: s.property,
        admin_role_name: s.admin_role,
        role: s.role || s.admin_role?.toLowerCase().replace(/\s+/g, '_')
      }));
      setStaff(staffData);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await adminApi.getRoles();
      setRoles(response.data.data);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await adminApi.getProperties({ page: 1 });
      setProperties(response.data.data.map((p: any) => ({ id: p.id, name: p.name, location: p.location })));
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingStaff) {
        const updateData: any = { ...formData };
        if (!formData.password) delete updateData.password;
        await adminApi.updateStaff(editingStaff.id, updateData);
      } else {
        await adminApi.createStaff(formData);
      }
      setModalOpen(false);
      setEditingStaff(null);
      fetchStaff();
    } catch (error) {
      console.error("Failed to save staff:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setFormData({
      first_name: staffMember.first_name,
      last_name: staffMember.last_name,
      email: staffMember.email,
      password: "",
      role: staffMember.role || "reception",
      property_id: "",
      admin_role_id: String(staffMember.admin_role_id || ""),
      is_active: staffMember.is_active,
      two_factor_enabled: staffMember.two_factor_enabled,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this staff member?")) return;
    try {
      await adminApi.deleteStaff(id);
      fetchStaff();
    } catch (error) {
      console.error("Failed to delete staff:", error);
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      await adminApi.updateStaff(id, { is_active: true });
      fetchStaff();
    } catch (error) {
      console.error("Failed to reactivate staff:", error);
    }
  };

  const handleForceLogout = async (id: string) => {
    if (!confirm("Are you sure you want to force logout this user?")) return;
    try {
      await adminApi.forceLogout(id);
      alert("User logged out successfully");
    } catch (error) {
      console.error("Failed to force logout:", error);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleVariants: Record<string, any> = {
      superadmin: "danger",
      regional_admin: "danger",
      property_admin: "warning",
      manager: "info",
      reception: "success",
      housekeeping: "default",
      maintenance: "default",
    };
    const roleLabels: Record<string, string> = {
      superadmin: "Super Admin",
      regional_admin: "Regional Admin",
      property_admin: "Property Admin",
      manager: "Manager",
      reception: "Reception",
      housekeeping: "Housekeeping",
      maintenance: "Maintenance",
    };
    return <Badge variant={roleVariants[role] || "default"}>{roleLabels[role] || role}</Badge>;
  };

  const columns = [
    { 
      key: "name", 
      label: "Name",
      render: (item: Staff) => (
        <div>
          <p className="font-medium">{item.first_name} {item.last_name}</p>
          <p className="text-xs text-gray-500">{item.email}</p>
        </div>
      )
    },
    { 
      key: "role", 
      label: "Role",
      render: (item: Staff) => getRoleBadge(item.role)
    },
    { key: "property_name", label: "Property" },
    { 
      key: "status", 
      label: "Status",
      render: (item: Staff) => (
        <div className="flex items-center gap-2">
          <Badge variant={item.is_active ? "success" : "danger"}>
            {item.is_active ? "Active" : "Inactive"}
          </Badge>
          {item.two_factor_enabled && <Badge variant="info">2FA</Badge>}
        </div>
      )
    },
    { 
      key: "last_login", 
      label: "Last Login",
      render: (item: Staff) => item.last_login_at || "Never"
    },
  ];

  return (
    <AdminLayout>
      <PageHeader 
        title="Staff Management" 
        subtitle="Manage all workers and their permissions"
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setViewMode("all"); }}>
            All Staff
          </Button>
          <Button variant="outline" onClick={() => { setViewMode("by_property"); }}>
            By Property
          </Button>
          <Button onClick={() => { setEditingStaff(null); setFormData({
            first_name: "", last_name: "", email: "", password: "",
            role: "reception", property_id: "", admin_role_id: "", is_active: true, two_factor_enabled: false
          }); setModalOpen(true); }}>
            <Plus className="w-4 h-4" /> Add Staff
          </Button>
        </div>
      </PageHeader>

      {/* Role Hierarchy Legend */}
      <Card className="mb-6">
        <div className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5" /> Role Hierarchy
          </h3>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1 px-3 py-1 bg-red-50 rounded-full text-xs">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              Super Admin (Level 100)
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-orange-50 rounded-full text-xs">
              <span className="w-2 h-2 bg-orange-500 rounded-full" />
              Regional Admin (Level 75)
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-yellow-50 rounded-full text-xs">
              <span className="w-2 h-2 bg-yellow-500 rounded-full" />
              Property Admin (Level 50)
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 rounded-full text-xs">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              Manager (Level 25)
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-green-50 rounded-full text-xs">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Reception (Level 25)
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-gray-50 rounded-full text-xs">
              <span className="w-2 h-2 bg-gray-500 rounded-full" />
              Housekeeping (Level 10)
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-gray-50 rounded-full text-xs">
              <span className="w-2 h-2 bg-gray-500 rounded-full" />
              Maintenance (Level 10)
            </div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4 border-b">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-lg text-sm"
              />
            </div>
            <Select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: "", label: "All Roles" },
                ...roleOptions
              ]}
            />
            <Select 
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              options={[
                { value: "", label: "All Properties" },
                ...properties.map(p => ({ value: p.id, label: p.name }))
              ]}
            />
            {(roleFilter || propertyFilter) && (
              <Button variant="outline" size="sm" onClick={() => { setRoleFilter(""); setPropertyFilter(""); }}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
        
        <DataTable
          columns={columns}
          data={staff}
          loading={loading}
          pagination={pagination}
          onPageChange={(page: number) => setPagination(p => ({ ...p, current_page: page }))}
          actions={(item: any) => (
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => handleEdit(item)} 
                className="p-1 hover:bg-gray-100 rounded"
                title="Edit"
              >
                <Edit className="w-4 h-4 text-gray-500" />
              </button>
              {item.is_active ? (
                <button 
                  onClick={() => handleDelete(item.id)} 
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Deactivate"
                >
                  <UserX className="w-4 h-4 text-red-500" />
                </button>
              ) : (
                <button 
                  onClick={() => handleReactivate(item.id)} 
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Reactivate"
                >
                  <UserCheck className="w-4 h-4 text-green-500" />
                </button>
              )}
              <button 
                onClick={() => handleForceLogout(item.id)} 
                className="p-1 hover:bg-gray-100 rounded"
                title="Force Logout"
              >
                <Key className="w-4 h-4 text-orange-500" />
              </button>
            </div>
          )}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingStaff ? "Edit Staff Member" : "Add Staff Member"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="First Name" 
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
            <Input 
              label="Last Name" 
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
          </div>
          
          <Input 
            label="Email" 
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          
          {!editingStaff && (
            <Input 
              label="Password" 
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          )}
          
          <Select 
            label="Role" 
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={roleOptions}
          />
          
          <Select 
            label="Assigned Property" 
            value={formData.property_id}
            onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
            options={[
              { value: "", label: "No property assigned" },
              ...properties.map(p => ({ value: p.id, label: `${p.name} - ${p.location}` }))
            ]}
          />
          
          <Select 
            label="Admin Role (for permissions)" 
            value={formData.admin_role_id}
            onChange={(e) => setFormData({ ...formData, admin_role_id: e.target.value })}
            options={[
              { value: "", label: "Select admin role" },
              ...roles.map(r => ({ value: String(r.id), label: r.name }))
            ]}
          />
          
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={formData.two_factor_enabled}
                onChange={(e) => setFormData({ ...formData, two_factor_enabled: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Require 2FA</span>
            </label>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium mb-2">Permission Summary</p>
            <div className="text-xs text-gray-600">
              {formData.role === "superadmin" && "Full system access - can manage everything"}
              {formData.role === "regional_admin" && "Can manage multiple properties, view financials, manage bookings"}
              {formData.role === "property_admin" && "Can manage single property, bookings, guests"}
              {formData.role === "reception" && "Can check-in/check-out guests, view bookings"}
              {formData.role === "housekeeping" && "Can update room status"}
              {formData.role === "maintenance" && "Can mark rooms for maintenance"}
              {formData.role === "manager" && "Can view analytics, manage property settings"}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingStaff ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
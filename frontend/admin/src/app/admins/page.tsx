"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Loader2, Key, UserCheck, UserX } from "lucide-react";
import { AdminLayout, PageHeader, Card, DataTable, Button, Input, Select, Modal, Badge } from "../components/AdminComponents";
import { adminApi } from "../../services/api";

interface Admin {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  property?: string;
  admin_role?: any;
  two_factor_enabled: boolean;
  created_at: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "", last_name: "", email: "", password: "", role: "", admin_role_id: "", property_id: "", is_active: true, two_factor_enabled: false,
  });

  useEffect(() => {
    fetchAdmins();
  }, [pagination.current_page, search]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAdmins({ page: pagination.current_page, search: search || undefined });
      const data = response.data.data;
      setAdmins(data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingAdmin) {
        await adminApi.updateStaff(editingAdmin.id, formData);
      } else {
        await adminApi.createStaff(formData);
      }
      await fetchAdmins();
      setModalOpen(false);
      setEditingAdmin(null);
      setFormData({ first_name: "", last_name: "", email: "", password: "", role: "", admin_role_id: "", property_id: "", is_active: true, two_factor_enabled: false });
    } catch (error) {
      console.error("Failed to save admin:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      first_name: admin.first_name,
      last_name: admin.last_name,
      email: admin.email,
      password: "",
      role: admin.role,
      admin_role_id: admin.admin_role?.id || "",
      property_id: "",
      is_active: admin.is_active,
      two_factor_enabled: admin.two_factor_enabled,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this admin?")) return;
    try {
      await adminApi.deleteStaff(id);
      await fetchAdmins();
    } catch (error) {
      console.error("Failed to delete admin:", error);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      const admin = admins.find(a => a.id === id);
      if (admin) {
        await adminApi.updateStaff(id, { ...admin, is_active: true });
        await fetchAdmins();
      }
    } catch (error) {
      console.error("Failed to activate admin:", error);
    }
  };

  const columns = [
    { key: "name", label: "Name", render: (item: Admin) => <div><p className="font-medium">{item.first_name} {item.last_name}</p><p className="text-xs text-gray-500">{item.email}</p></div> },
    { key: "role", label: "Role", render: (item: Admin) => <Badge variant={item.role === "superadmin" ? "danger" : "warning"}>{item.admin_role?.name || item.role}</Badge> },
    { key: "property", label: "Property" },
    { key: "status", label: "Status", render: (item: Admin) => <div className="flex gap-2"><Badge variant={item.is_active ? "success" : "danger"}>{item.is_active ? "Active" : "Inactive"}</Badge>{item.two_factor_enabled && <Badge variant="info">2FA</Badge>}</div> },
    { key: "created_at", label: "Created" },
  ];

  return (
    <AdminLayout>
      <PageHeader title="Admin Management" subtitle="Manage admin accounts and permissions">
        <Button onClick={() => { setEditingAdmin(null); setFormData({ first_name: "", last_name: "", email: "", password: "", role: "", admin_role_id: "", property_id: "", is_active: true, two_factor_enabled: false }); setModalOpen(true); }}>
          <Plus className="w-4 h-4" /> Add Admin
        </Button>
      </PageHeader>

      <Card>
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search admins..." value={search} onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, current_page: 1 })); }} className="pl-10 pr-4 py-2 w-full border rounded-lg text-sm" />
          </div>
        </div>
        <DataTable columns={columns} data={admins} loading={loading} pagination={pagination} onPageChange={(page: number) => setPagination(p => ({ ...p, current_page: page }))} actions={(item: Admin) => (
          <div className="flex gap-2 justify-end">
            <button onClick={() => handleEdit(item)} className="p-1 hover:bg-gray-100 rounded"><Edit className="w-4 h-4 text-gray-500" /></button>
            {item.is_active ? <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-gray-100 rounded"><UserX className="w-4 h-4 text-red-500" /></button> : <button onClick={() => handleActivate(item.id)} className="p-1 hover:bg-gray-100 rounded"><UserCheck className="w-4 h-4 text-green-500" /></button>}
            <button className="p-1 hover:bg-gray-100 rounded"><Key className="w-4 h-4 text-orange-500" /></button>
          </div>
        )} />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingAdmin ? "Edit Admin" : "Add Admin"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required />
            <Input label="Last Name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} required />
          </div>
          <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          {!editingAdmin && <Input label="Password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />}
          <Select label="Role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} options={[{ value: "superadmin", label: "Super Admin" }, { value: "regional_admin", label: "Regional Admin" }, { value: "property_admin", label: "Property Admin" }, { value: "manager", label: "Manager" }, { value: "reception", label: "Reception" }]} />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="rounded" /><span className="text-sm">Active</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.two_factor_enabled} onChange={(e) => setFormData({ ...formData, two_factor_enabled: e.target.checked })} className="rounded" /><span className="text-sm">Require 2FA</span></label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingAdmin ? "Update" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
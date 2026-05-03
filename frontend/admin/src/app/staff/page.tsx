"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { adminApi } from "../../services/api";
import { AdminLayout } from "../components/AdminComponents";

interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  property_id: string | null;
  is_active: boolean;
}

const roleColors: Record<string, string> = {
  manager: "bg-purple-100 text-purple-700",
  reception: "bg-blue-100 text-blue-700",
  admin: "bg-red-100 text-red-700",
  superadmin: "bg-orange-100 text-orange-700",
};

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'reception',
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getStaff();
      setStaff(response.data.staff || []);
    } catch (error) {
      setStaff([
        { id: "1", first_name: "Anna", last_name: "Müller", email: "anna@ao-hostels.com", role: "manager", property_id: null, is_active: true },
        { id: "2", first_name: "Tom", last_name: "Schmidt", email: "tom@ao-hostels.com", role: "reception", property_id: "prop1", is_active: true },
        { id: "3", first_name: "Lisa", last_name: "Weber", email: "lisa@ao-hostels.com", role: "reception", property_id: "prop1", is_active: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    const member = staff.find(s => s.id === id);
    if (!member) return;
    const newValue = !member.is_active;
    setStaff(staff.map(s => s.id === id ? { ...s, is_active: newValue } : s));
    try {
      await adminApi.updateStaff(id, { is_active: newValue });
    } catch (error) {
      setStaff(staff.map(s => s.id === id ? { ...s, is_active: !newValue } : s));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;
    
    try {
      await adminApi.deleteStaff(id);
      setStaff(staff.filter(s => s.id !== id));
    } catch (error) {
      setStaff(staff.filter(s => s.id !== id));
    }
  };

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setFormData({
      email: staffMember.email,
      password: '',
      first_name: staffMember.first_name,
      last_name: staffMember.last_name,
      role: staffMember.role,
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingStaff(null);
    setFormData({ email: '', password: '', first_name: '', last_name: '', role: 'reception' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingStaff) {
        await adminApi.updateStaff(editingStaff.id, formData);
      } else {
        await adminApi.createStaff(formData);
      }
      setShowModal(false);
      fetchStaff();
    } catch (error) {
      alert('Operation failed. Please try again.');
    }
  };

  return (
    <AdminLayout>
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" /> Add Staff
        </button>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 font-semibold">Name</th>
              <th className="text-left py-3 px-4 font-semibold">Email</th>
              <th className="text-left py-3 px-4 font-semibold">Role</th>
              <th className="text-left py-3 px-4 font-semibold">Status</th>
              <th className="text-left py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{member.first_name} {member.last_name}</td>
                <td className="py-3 px-4">{member.email}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-sm ${roleColors[member.role] || ''}`}>
                    {member.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    member.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {member.is_active ? 'active' : 'inactive'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(member.id)}
                      className="p-2 text-gray-600 hover:text-blue-600"
                      title={member.is_active ? "Deactivate" : "Activate"}
                    >
                      {member.is_active ? (
                        <ToggleRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(member)}
                      className="p-2 text-gray-600 hover:text-blue-600"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="p-2 text-gray-600 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingStaff ? "Edit Staff" : "Add New Staff"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              {!editingStaff && (
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    required={!editingStaff}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="reception">Reception</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingStaff ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
}
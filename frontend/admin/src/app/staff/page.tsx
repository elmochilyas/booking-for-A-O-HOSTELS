"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  property: string;
  status: string;
}

const mockStaff: Staff[] = [
  { id: "1", name: "Anna Müller", email: "anna@ao-hostels.com", role: "Manager", property: "Berlin Hauptbahnhof", status: "active" },
  { id: "2", name: "Tom Schmidt", email: "tom@ao-hostels.com", role: "Reception", property: "Berlin Hauptbahnhof", status: "active" },
  { id: "3", name: "Lisa Weber", email: "lisa@ao-hostels.com", role: "Reception", property: "Berlin Hauptbahnhof", status: "active" },
  { id: "4", name: "Mark Huber", email: "mark@ao-hostels.com", role: "Admin", property: "All Properties", status: "active" },
  { id: "5", name: "Julia Fischer", email: "julia@ao-hostels.com", role: "Reception", property: "Berlin Hauptbahnhof", status: "inactive" },
];

const roleColors: Record<string, string> = {
  Manager: "bg-purple-100 text-purple-700",
  Reception: "bg-blue-100 text-blue-700",
  Admin: "bg-red-100 text-red-700",
};

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>(mockStaff);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const handleToggleActive = (id: string) => {
    setStaff(staff.map(s => s.id === id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s));
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      setStaff(staff.filter(s => s.id !== id));
    }
  };

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingStaff(null);
    setShowModal(true);
  };

  return (
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
              <th className="text-left py-3 px-4 font-semibold">Property</th>
              <th className="text-left py-3 px-4 font-semibold">Status</th>
              <th className="text-left py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{member.name}</td>
                <td className="py-3 px-4">{member.email}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-sm ${roleColors[member.role]}`}>
                    {member.role}
                  </span>
                </td>
                <td className="py-3 px-4">{member.property}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    member.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {member.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(member.id)}
                      className="p-2 text-gray-600 hover:text-blue-600"
                      title={member.status === "active" ? "Deactivate" : "Activate"}
                    >
                      {member.status === "active" ? (
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
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  defaultValue={editingStaff?.name}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  defaultValue={editingStaff?.email}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select className="w-full p-2 border rounded-lg">
                  <option value="reception">Reception</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Property</label>
                <select className="w-full p-2 border rounded-lg">
                  <option>Berlin Hauptbahnhof</option>
                  <option>München Hauptbahnhof</option>
                  <option>All Properties</option>
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
  );
}
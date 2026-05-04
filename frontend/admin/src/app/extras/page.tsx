"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { adminApi } from "../../services/api";
import { AdminLayout, PageHeader, Card, DataTable, Button, Modal, Badge } from "../components/AdminComponents";

interface Extra {
  id: string;
  name: string;
  price: number;
  price_type: string;
  property_id: string;
  is_active: boolean;
}

export default function ExtrasPage() {
  const [extras, setExtras] = useState<Extra[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExtra, setEditingExtra] = useState<Extra | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", price: "", price_type: "per_stay", property_id: "" });

  useEffect(() => {
    fetchExtras();
  }, [pagination.current_page]);

  const fetchExtras = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getExtras({ page: pagination.current_page });
      setExtras(response.data.data || []);
      if (response.data.pagination) setPagination(response.data.pagination);
    } catch {
      console.error("Failed to fetch extras");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingExtra(null);
    setFormData({ name: "", price: "", price_type: "per_stay", property_id: "" });
    setModalOpen(true);
  };

  const openEdit = (extra: Extra) => {
    setEditingExtra(extra);
    setFormData({ name: extra.name, price: String(extra.price), price_type: extra.price_type, property_id: extra.property_id });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      const payload = { ...formData, price: parseFloat(formData.price) };
      if (editingExtra) {
        await adminApi.updateExtra(editingExtra.id, payload);
      } else {
        await adminApi.createExtra(payload);
      }
      setModalOpen(false);
      fetchExtras();
    } catch {
      console.error("Failed to save extra");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this extra?")) return;
    try {
      await adminApi.deleteExtra(id);
      fetchExtras();
    } catch {
      console.error("Failed to delete extra");
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "price", label: "Price", render: (item: Extra) => `€${item.price}` },
    { key: "price_type", label: "Type", render: (item: Extra) => item.price_type.replace("_", " ") },
    { key: "is_active", label: "Status", render: (item: Extra) => <Badge variant={item.is_active ? "success" : "default"}>{item.is_active ? "Active" : "Inactive"}</Badge> },
  ];

  return (
    <AdminLayout>
      <PageHeader title="Extras" subtitle="Manage optional add-ons for bookings">
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Extra</Button>
      </PageHeader>

      <Card>
        <DataTable
          columns={columns}
          data={extras}
          loading={loading}
          pagination={pagination}
          onPageChange={(page: number) => setPagination(p => ({ ...p, current_page: page }))}
          actions={(item: any) => (
            <div className="flex gap-2">
              <button onClick={() => openEdit(item)} className="text-blue-600 hover:underline text-sm flex items-center gap-1"><Edit className="w-3 h-3" /> Edit</button>
              <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline text-sm flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</button>
            </div>
          )}
        />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingExtra ? "Edit Extra" : "Add Extra"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price (€)</label>
            <input type="number" step="0.01" className="w-full border rounded-lg px-3 py-2 text-sm" value={formData.price} onChange={e => setFormData(f => ({ ...f, price: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price Type</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm" value={formData.price_type} onChange={e => setFormData(f => ({ ...f, price_type: e.target.value }))}>
              <option value="per_stay">Per Stay</option>
              <option value="per_night">Per Night</option>
              <option value="per_person">Per Person</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={actionLoading} className="flex-1">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}

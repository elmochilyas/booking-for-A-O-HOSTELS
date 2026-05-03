"use client";

import { useState, useEffect } from "react";
import { Tag, Plus, Edit, Trash2, Search, Loader2, Calendar, Percent } from "lucide-react";
import { adminApi } from "../../services/api";
import { AdminLayout, PageHeader, Card, DataTable, Button, Input, Select, Modal, Badge } from "../components/AdminComponents";

interface Promotion {
  id: string;
  code: string;
  description: string;
  discount_type: string;
  discount_value: number;
  property_id?: string;
  valid_from: string;
  valid_until: string;
  uses_count: number;
  max_uses?: number;
  is_active: boolean;
  created_at: string;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: 0,
    property_id: "",
    valid_from: "",
    valid_until: "",
    min_booking_value: 0,
    max_uses: 0,
  });

  useEffect(() => {
    fetchPromotions();
  }, [pagination.current_page]);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getPromotions({ page: pagination.current_page });
      setPromotions(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch promotions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPromotion) {
        await adminApi.updatePromotion(editingPromotion.id, formData);
      } else {
        await adminApi.createPromotion(formData);
      }
      setModalOpen(false);
      setEditingPromotion(null);
      fetchPromotions();
    } catch (error) {
      console.error("Failed to save promotion:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this promotion?")) return;
    try {
      await adminApi.deletePromotion(id);
      fetchPromotions();
    } catch (error) {
      console.error("Failed to delete promotion:", error);
    }
  };

  const columns = [
    { key: "code", label: "Code" },
    { key: "description", label: "Description" },
    { 
      key: "discount", 
      label: "Discount",
      render: (item: Promotion) => (
        <span className="font-medium">
          {item.discount_type === "percentage" ? `${item.discount_value}%` : `€${item.discount_value}`}
        </span>
      )
    },
    { 
      key: "valid", 
      label: "Valid Period",
      render: (item: Promotion) => `${item.valid_from} - ${item.valid_until}`
    },
    { 
      key: "uses", 
      label: "Uses",
      render: (item: Promotion) => item.max_uses ? `${item.uses_count}/${item.max_uses}` : item.uses_count
    },
    { 
      key: "status", 
      label: "Status",
      render: (item: Promotion) => <Badge variant={item.is_active ? "success" : "danger"}>{item.is_active ? "Active" : "Inactive"}</Badge>
    },
  ];

  return (
    <AdminLayout>
      <PageHeader title="Promotions" subtitle="Manage discount codes and offers">
        <Button onClick={() => { setEditingPromotion(null); setFormData({
          code: "", description: "", discount_type: "percentage", discount_value: 0,
          property_id: "", valid_from: "", valid_until: "", min_booking_value: 0, max_uses: 0
        }); setModalOpen(true); }}>
          <Plus className="w-4 h-4" /> Create Promotion
        </Button>
      </PageHeader>

      <Card>
        <DataTable
          columns={columns}
          data={promotions}
          loading={loading}
          pagination={pagination}
          onPageChange={(page: number) => setPagination(p => ({ ...p, current_page: page }))}
          actions={(item: any) => (
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setEditingPromotion(item); setFormData({
                code: item.code,
                description: item.description || "",
                discount_type: item.discount_type,
                discount_value: item.discount_value,
                property_id: item.property_id || "",
                valid_from: item.valid_from,
                valid_until: item.valid_until,
                min_booking_value: 0,
                max_uses: item.max_uses || 0,
              }); setModalOpen(true); }} className="p-1 hover:bg-gray-100 rounded">
                <Edit className="w-4 h-4 text-gray-500" />
              </button>
              <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-gray-100 rounded">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          )}
        />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingPromotion ? "Edit Promotion" : "Create Promotion"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Promo Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required />
          <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Discount Type" 
              value={formData.discount_type}
              onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
              options={[
                { value: "percentage", label: "Percentage %" },
                { value: "fixed", label: "Fixed Amount €" }
              ]}
            />
            <Input label="Discount Value" type="number" value={formData.discount_value} onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Valid From" type="date" value={formData.valid_from} onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })} required />
            <Input label="Valid Until" type="date" value={formData.valid_until} onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Min Booking Value (€)" type="number" value={formData.min_booking_value} onChange={(e) => setFormData({ ...formData, min_booking_value: parseFloat(e.target.value) })} />
            <Input label="Max Uses (0 = unlimited)" type="number" value={formData.max_uses} onChange={(e) => setFormData({ ...formData, max_uses: parseInt(e.target.value) })} />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingPromotion ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
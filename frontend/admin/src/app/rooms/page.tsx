"use client";

import { useState, useEffect } from "react";
import { Bed, Plus, Edit, Trash2, Search, Loader2, DollarSign, Users, Home, ToggleLeft, ToggleRight } from "lucide-react";
import { adminApi } from "../../services/api";
import { AdminLayout, PageHeader, Card, DataTable, Button, Input, Select, Modal, Badge, StatsCard } from "../components/AdminComponents";

interface Room {
  id: string;
  room_number: string;
  floor: number;
  room_type: string;
  property: string;
  status: string;
  base_price: number;
}

interface RoomType {
  id: string;
  name: string;
  capacity: number;
  base_price: number;
  description?: string;
}

interface Property {
  id: string;
  name: string;
  location: string;
}

const roomStatuses = ["available", "booked", "maintenance", "cleaning", "out_of_service"];

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [statusCounts, setStatusCounts] = useState({ available: 0, booked: 0, maintenance: 0, cleaning: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [roomTypeModalOpen, setRoomTypeModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    room_number: "",
    floor: 1,
    room_type_id: "",
    property_id: "",
    status: "available",
    base_price: 0,
    is_active: true,
  });
  const [roomTypeData, setRoomTypeData] = useState({
    name: "",
    capacity: 1,
    base_price: 0,
    description: "",
  });

  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
    fetchProperties();
  }, [pagination.current_page, search, propertyFilter, statusFilter]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params: any = { page: pagination.current_page };
      if (search) params.search = search;
      if (propertyFilter) params.property = propertyFilter;
      if (statusFilter) params.status = statusFilter;
      
      const response = await adminApi.getRooms(params);
      setRooms(response.data.data);
      setPagination(response.data.pagination);
      if (response.data.status_counts) {
        setStatusCounts(response.data.status_counts);
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const response = await adminApi.getRoomTypes();
      setRoomTypes(response.data.data);
    } catch (error) {
      console.error("Failed to fetch room types:", error);
      setRoomTypes([
        { id: "1", name: "Single Room", capacity: 1, base_price: 59 },
        { id: "2", name: "Double Room", capacity: 2, base_price: 89 },
        { id: "3", name: "Dorm Bed", capacity: 1, base_price: 35 },
        { id: "4", name: "Family Room", capacity: 4, base_price: 149 },
      ]);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await adminApi.getProperties({ page: 1 });
      setProperties(response.data.data.map((p: any) => ({ id: p.id, name: p.name, location: p.location })));
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      setProperties([{ id: "1", name: "A&O Berlin", location: "Berlin" }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingRoom) {
        await adminApi.updateRoom(editingRoom.id, formData);
      } else {
        await adminApi.createRoom(formData);
      }
      setModalOpen(false);
      setEditingRoom(null);
      fetchRooms();
    } catch (error) {
      console.error("Failed to save room:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleRoomTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingRoomType) {
        await adminApi.updateRoomType(editingRoomType.id, roomTypeData);
      } else {
        await adminApi.createRoomType(roomTypeData);
      }
      setRoomTypeModalOpen(false);
      setEditingRoomType(null);
      fetchRoomTypes();
    } catch (error) {
      console.error("Failed to save room type:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      room_number: room.room_number,
      floor: room.floor,
      room_type_id: "",
      property_id: "",
      status: room.status,
      base_price: room.base_price,
      is_active: room.status !== "out_of_service",
    });
    setModalOpen(true);
  };

  const handleStatusChange = async (room: Room, newStatus: string) => {
    try {
      await adminApi.updateRoomStatus(room.id, { status: newStatus });
      fetchRooms();
    } catch (error) {
      console.error("Failed to update room status:", error);
    }
  };

  const getStatusVariant = (status: string) => {
    const variants: Record<string, any> = {
      available: "success",
      booked: "info",
      maintenance: "warning",
      cleaning: "warning",
      out_of_service: "danger",
    };
    return variants[status] || "default";
  };

  const columns = [
    { key: "room_number", label: "Room #" },
    { key: "floor", label: "Floor" },
    { key: "room_type", label: "Room Type" },
    { key: "property", label: "Property" },
    { 
      key: "status", 
      label: "Status",
      render: (item: Room) => <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
    },
    { 
      key: "price", 
      label: "Price",
      render: (item: Room) => `€${item.base_price}/night`
    },
  ];

  return (
    <AdminLayout>
      <PageHeader 
        title="Room & Inventory Management" 
        subtitle="Manage rooms, room types, and availability"
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setEditingRoomType(null); setRoomTypeData({ name: "", capacity: 1, base_price: 0, description: "" }); setRoomTypeModalOpen(true); }}>
            <Plus className="w-4 h-4" /> Add Room Type
          </Button>
          <Button onClick={() => { setEditingRoom(null); setFormData({ room_number: "", floor: 1, room_type_id: "", property_id: "", status: "available", base_price: 0, is_active: true }); setModalOpen(true); }}>
            <Plus className="w-4 h-4" /> Add Room
          </Button>
        </div>
      </PageHeader>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Rooms" value={pagination.total || 0} icon={<Home className="w-5 h-5" />} />
        <StatsCard title="Available" value={statusCounts.available} icon={<Bed className="w-5 h-5" />} />
        <StatsCard title="Occupied" value={statusCounts.booked} icon={<Users className="w-5 h-5" />} />
        <StatsCard title="Maintenance" value={statusCounts.maintenance} icon={<ToggleLeft className="w-5 h-5" />} />
      </div>

      <Card className="mb-6">
        <div className="p-4 border-b">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search rooms..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-lg text-sm"
              />
            </div>
            <Select 
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              options={[
                { value: "", label: "All Properties" },
                ...properties.map(p => ({ value: p.id, label: p.name }))
              ]}
            />
            <Select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "", label: "All Statuses" },
                { value: "available", label: "Available" },
                { value: "booked", label: "Booked" },
                { value: "maintenance", label: "Maintenance" },
                { value: "cleaning", label: "Cleaning" },
                { value: "out_of_service", label: "Out of Service" },
              ]}
            />
          </div>
        </div>
        
        <DataTable
          columns={columns}
          data={rooms}
          loading={loading}
          pagination={pagination}
          onPageChange={(page: number) => setPagination(p => ({ ...p, current_page: page }))}
          actions={(item: any) => (
            <div className="flex gap-2 justify-end">
              <select 
                value={item.status}
                onChange={(e) => handleStatusChange(item, e.target.value)}
                className="text-xs border rounded px-2 py-1"
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="maintenance">Maintenance</option>
                <option value="cleaning">Cleaning</option>
                <option value="out_of_service">Out of Service</option>
              </select>
              <button onClick={() => handleEdit(item)} className="p-1 hover:bg-gray-100 rounded">
                <Edit className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          )}
        />
      </Card>

      {/* Room Types */}
      <Card>
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Room Types</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roomTypes.map((rt) => (
              <div key={rt.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{rt.name}</h4>
                  <button onClick={() => { setEditingRoomType(rt); setRoomTypeData({ name: rt.name, capacity: rt.capacity, base_price: rt.base_price, description: rt.description || "" }); setRoomTypeModalOpen(true); }}>
                    <Edit className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <p className="text-sm text-gray-500">Capacity: {rt.capacity} guests</p>
                <p className="text-lg font-bold text-blue-600">€{rt.base_price}/night</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Add/Edit Room Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingRoom ? "Edit Room" : "Add Room"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Room Number" 
              value={formData.room_number}
              onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
              required
            />
            <Input 
              label="Floor" 
              type="number"
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
              required
            />
          </div>
          
          <Select 
            label="Property" 
            value={formData.property_id}
            onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
            options={[
              { value: "", label: "Select property" },
              ...properties.map(p => ({ value: p.id, label: p.name }))
            ]}
          />
          
          <Select 
            label="Room Type" 
            value={formData.room_type_id}
            onChange={(e) => setFormData({ ...formData, room_type_id: e.target.value })}
            options={[
              { value: "", label: "Select room type" },
              ...roomTypes.map(rt => ({ value: rt.id, label: rt.name }))
            ]}
          />
          
          <Input 
            label="Base Price (€)" 
            type="number"
            value={formData.base_price}
            onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
          />
          
          <Select 
            label="Status" 
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: "available", label: "Available" },
              { value: "maintenance", label: "Maintenance" },
              { value: "out_of_service", label: "Out of Service" },
            ]}
          />
          
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingRoom ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add/Edit Room Type Modal */}
      <Modal open={roomTypeModalOpen} onClose={() => setRoomTypeModalOpen(false)} title={editingRoomType ? "Edit Room Type" : "Add Room Type"}>
        <form onSubmit={handleRoomTypeSubmit} className="space-y-4">
          <Input 
            label="Room Type Name" 
            value={roomTypeData.name}
            onChange={(e) => setRoomTypeData({ ...roomTypeData, name: e.target.value })}
            placeholder="e.g., Double Room, Dorm Bed, Family Room"
            required
          />
          
          <Input 
            label="Capacity (max guests)" 
            type="number"
            value={roomTypeData.capacity}
            onChange={(e) => setRoomTypeData({ ...roomTypeData, capacity: parseInt(e.target.value) })}
          />
          
          <Input 
            label="Base Price (€)" 
            type="number"
            value={roomTypeData.base_price}
            onChange={(e) => setRoomTypeData({ ...roomTypeData, base_price: parseFloat(e.target.value) })}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              value={roomTypeData.description}
              onChange={(e) => setRoomTypeData({ ...roomTypeData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm h-24 resize-none"
              placeholder="Describe the room type..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setRoomTypeModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingRoomType ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
"use client";

import { useState, useEffect } from "react";
import { adminApi } from "../../services/api";
import { AdminLayout, PageHeader, Card, DataTable } from "../components/AdminComponents";

interface AuditLog {
  id: string;
  staff: string;
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
  ip_address?: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [pagination.current_page, actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAuditLogs({
        action: actionFilter || undefined,
        page: pagination.current_page,
      });
      setLogs(response.data.data || []);
      if (response.data.pagination) setPagination(response.data.pagination);
    } catch {
      console.error("Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "created_at", label: "Time", render: (item: AuditLog) => new Date(item.created_at).toLocaleString('de-DE') },
    { key: "staff", label: "Staff" },
    { key: "action", label: "Action" },
    { key: "entity_type", label: "Entity" },
    { key: "entity_id", label: "Entity ID", render: (item: AuditLog) => <span className="font-mono text-xs">{item.entity_id}</span> },
    { key: "ip_address", label: "IP", render: (item: AuditLog) => item.ip_address || "—" },
  ];

  return (
    <AdminLayout>
      <PageHeader title="Audit Log" subtitle="Staff activity trail">
        <select
          value={actionFilter}
          onChange={e => { setActionFilter(e.target.value); setPagination(p => ({ ...p, current_page: 1 })); }}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Actions</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
        </select>
      </PageHeader>

      <Card>
        <DataTable
          columns={columns}
          data={logs}
          loading={loading}
          pagination={pagination}
          onPageChange={(page: number) => setPagination(p => ({ ...p, current_page: page }))}
        />
      </Card>
    </AdminLayout>
  );
}

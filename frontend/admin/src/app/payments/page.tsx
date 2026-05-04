"use client";

import { useState, useEffect } from "react";
import { CreditCard, Search, Loader2, DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { adminApi } from "../../services/api";
import { AdminLayout, PageHeader, Card, DataTable, Button, Input, Select, StatsCard, Badge } from "../components/AdminComponents";

interface Payment {
  id: string;
  booking: string;
  guest: string;
  amount: number;
  payment_method: string;
  status: string;
  stripe_payment_id: string;
  created_at: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [revenue, setRevenue] = useState<any>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchPayments();
    fetchRevenue();
  }, [pagination.current_page, dateFrom, dateTo, statusFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getPayments({ 
        date_from: dateFrom, 
        date_to: dateTo,
        status: statusFilter,
        page: pagination.current_page 
      });
      setPayments(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenue = async () => {
    try {
      const response = await adminApi.getRevenueDashboard(undefined, dateFrom, dateTo);
      setRevenue(response.data);
    } catch (error) {
      console.error("Failed to fetch revenue:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "success": return "success";
      case "pending": return "warning";
      case "failed": return "danger";
      case "refunded": return "info";
      default: return "default";
    }
  };

  const columns = [
    { key: "booking", label: "Booking ID" },
    { key: "guest", label: "Guest" },
    { 
      key: "amount", 
      label: "Amount",
      render: (item: Payment) => <span className="font-medium">{formatCurrency(item.amount)}</span>
    },
    { key: "payment_method", label: "Method" },
    { 
      key: "status", 
      label: "Status",
      render: (item: Payment) => <Badge variant={getStatusVariant(item.status) as any}>{item.status}</Badge>
    },
    { key: "stripe_payment_id", label: "Stripe ID" },
    { key: "created_at", label: "Date" },
  ];

  return (
    <AdminLayout>
      <PageHeader 
        title="Payments & Revenue" 
        subtitle="Transaction logs and financial overview"
      />

      {revenue && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatsCard title="Total Revenue" value={formatCurrency(revenue.total_revenue || 0)} icon={<DollarSign className="w-5 h-5" />} />
          <StatsCard title="Transactions" value={revenue.transactions_count || 0} icon={<CreditCard className="w-5 h-5" />} />
          <StatsCard title="Avg Transaction" value={formatCurrency(revenue.average_transaction || 0)} icon={<TrendingUp className="w-5 h-5" />} />
          <StatsCard title="This Month" value={formatCurrency(revenue.total_revenue || 0)} icon={<Calendar className="w-5 h-5" />} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 p-5">
          <h3 className="font-semibold mb-4">Daily Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenue?.daily_revenue || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Line type="monotone" dataKey="total" stroke="#2563EB" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Filters</h3>
          <div className="space-y-4">
            <Input 
              type="date" 
              label="From Date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <Input 
              type="date" 
              label="To Date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
            <Select 
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "", label: "All" },
                { value: "success", label: "Success" },
                { value: "pending", label: "Pending" },
                { value: "failed", label: "Failed" },
                { value: "refunded", label: "Refunded" },
              ]}
            />
            <Button onClick={() => { setDateFrom(""); setDateTo(""); setStatusFilter(""); }} variant="outline" className="w-full">
              Clear Filters
            </Button>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b">
          <h3 className="font-semibold">Recent Transactions</h3>
        </div>
        <DataTable
          columns={columns}
          data={payments}
          loading={loading}
          pagination={pagination}
          onPageChange={(page: number) => setPagination(p => ({ ...p, current_page: page }))}
        />
      </Card>
    </AdminLayout>
  );
}
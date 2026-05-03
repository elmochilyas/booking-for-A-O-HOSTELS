"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, Building2, Bed, Calendar, CreditCard, 
  Star, Tag, Package, Bell, Settings, BarChart3, FileText, 
  Shield, ChevronDown, Menu, X, LogOut, Search, Loader2,
  Home, Key, DollarSign, Plus
} from "lucide-react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const userData = localStorage.getItem("staff");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        if (parsed && parsed.id) setUser(parsed);
      } catch {}
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("staff");
    router.push("/login");
  };

  const pathname = typeof window !== "undefined" ? window.location.pathname : "";

  const navItems = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: "/admins", label: "Admins", icon: <Shield className="w-5 h-5" /> },
    { href: "/properties", label: "Properties", icon: <Building2 className="w-5 h-5" /> },
    { href: "/rooms", label: "Rooms", icon: <Bed className="w-5 h-5" /> },
    { href: "/bookings", label: "Bookings", icon: <Calendar className="w-5 h-5" />, badge: 12 },
    { href: "/guests", label: "Guests", icon: <Users className="w-5 h-5" /> },
    { href: "/payments", label: "Payments", icon: <CreditCard className="w-5 h-5" /> },
    { href: "/reviews", label: "Reviews", icon: <Star className="w-5 h-5" />, badge: 3 },
    { href: "/promotions", label: "Promotions", icon: <Tag className="w-5 h-5" /> },
    { href: "/extras", label: "Extras", icon: <Package className="w-5 h-5" /> },
    { href: "/analytics", label: "Analytics", icon: <BarChart3 className="w-5 h-5" /> },
    { href: "/audit-log", label: "Audit Log", icon: <FileText className="w-5 h-5" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center"><Home className="w-5 h-5" /></div>
            <span className="font-bold text-lg">A&O Admin</span>
          </div>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <a key={item.href} href={item.href} className={`flex items-center justify-between px-3 py-2.5 rounded-lg ${active ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}>
                <div className="flex items-center gap-3">{item.icon}<span className="text-sm">{item.label}</span></div>
                {item.badge && <span className="bg-red-500 text-white text-xs px-2 rounded-full">{item.badge}</span>}
              </a>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button className="md:hidden" onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
            <div className="relative hidden md:block">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 w-80 border rounded-lg text-sm" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-5 h-5 text-gray-600" /><span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">{(user?.first_name?.[0] || "")}{(user?.last_name?.[0] || "")}</div>
                <span className="text-sm hidden md:block">{user?.first_name || "User"}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <p className="text-xs text-blue-600">{user?.admin_role?.name || user?.role}</p>
                  </div>
                  <button onClick={logout} className="w-full px-4 py-2 text-left text-sm text-red-600 flex items-center gap-2"><LogOut className="w-4 h-4" />Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}
      {userMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />}
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div><h1 className="text-2xl font-bold text-gray-900">{title}</h1>{subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}</div>
      {children}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-xl border shadow-sm ${className}`}>{children}</div>;
}

export function DataTable({ columns, data, loading, pagination, onPageChange, actions }: any) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>{columns.map((col: any) => <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{col.label}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={columns.length} className="px-4 py-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" /></td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">No data</td></tr>
            ) : (
              data.map((item: any, idx: number) => (
                <tr key={item.id || idx} className="hover:bg-gray-50">
                  {columns.map((col: any) => <td key={col.key} className="px-4 py-3 text-sm">{col.render ? col.render(item) : item[col.key]}</td>)}
                  {actions && <td className="px-4 py-3 text-right">{actions(item)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && pagination.last_page > 1 && (
        <div className="px-4 py-3 border-t flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {pagination.current_page} of {pagination.last_page}</p>
          <div className="flex gap-2">
            <button onClick={() => onPageChange?.(pagination.current_page - 1)} disabled={pagination.current_page === 1} className="px-3 py-1 text-sm border rounded disabled:opacity-50">Previous</button>
            <button onClick={() => onPageChange?.(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page} className="px-3 py-1 text-sm border rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: string }) {
  const variants: Record<string, string> = { default: "bg-gray-100 text-gray-700", success: "bg-green-100 text-green-700", danger: "bg-red-100 text-red-700", warning: "bg-yellow-100 text-yellow-700", info: "bg-blue-100 text-blue-700" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>{children}</span>;
}

export function Button({ children, variant = "primary", size = "md", className = "", ...props }: any) {
  const variants: Record<string, string> = { primary: "bg-blue-600 text-white hover:bg-blue-700", secondary: "bg-gray-600 text-white", danger: "bg-red-600 text-white", outline: "border border-gray-300" };
  const sizes: Record<string, string> = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2", lg: "px-6 py-3" };
  return <button className={`inline-flex items-center gap-2 rounded-lg font-medium ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
}

export function Input({ label, error, className = "", onChange, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; className?: string }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input onChange={onChange} className={`w-full px-3 py-2 border rounded-lg text-sm ${error ? "border-red-300" : "border-gray-300"}`} {...props} />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function Select({ label, options, className = "", onChange, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; options: { value: string; label: string }[]; className?: string }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" {...props}>
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export function StatsCard({ title, value, change, icon }: { title: string; value: string | number; change?: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-5 rounded-xl border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{title}</span>
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">{icon}</div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {change && <p className="text-sm text-green-600 mt-1">{change}</p>}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><FileText className="w-8 h-8 text-gray-400" /></div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {description && <p className="text-gray-500 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
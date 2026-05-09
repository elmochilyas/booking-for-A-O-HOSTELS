"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Building2, Bed, Calendar, CreditCard,
  Star, Tag, Package, Bell, Settings, BarChart3, FileText,
  Shield, ChevronDown, Menu, X, LogOut, Search, Loader2,
  Home, Key, DollarSign, Plus, TrendingUp, Activity, ChevronRight,
  UserCircle, HelpCircle, Sun, Moon
} from "lucide-react";

// ==================== AdminLayout ====================
export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    const userData = localStorage.getItem("staff");
    if (userData) { try { setUser(JSON.parse(userData)); } catch {} }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("staff");
    router.push("/login");
  };

  const pathname = typeof window !== "undefined" ? window.location.pathname : "";

  const navItems = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: "/properties", label: "Properties", icon: <Building2 className="w-5 h-5" /> },
    { href: "/rooms", label: "Rooms", icon: <Bed className="w-5 h-5" /> },
    { href: "/bookings", label: "Bookings", icon: <Calendar className="w-5 h-5" />, badge: 12 },
    { href: "/guests", label: "Guests", icon: <Users className="w-5 h-5" /> },
    { href: "/payments", label: "Payments", icon: <CreditCard className="w-5 h-5" /> },
    { href: "/reviews", label: "Reviews", icon: <Star className="w-5 h-5" />, badge: 3 },
    { href: "/promotions", label: "Promotions", icon: <Tag className="w-5 h-5" /> },
    { href: "/extras", label: "Extras", icon: <Package className="w-5 h-5" /> },
    { href: "/analytics", label: "Analytics", icon: <BarChart3 className="w-5 h-5" /> },
    { href: "/staff-management", label: "Staff", icon: <Shield className="w-5 h-5" /> },
    { href: "/admins", label: "Admins", icon: <Shield className="w-5 h-5" /> },
    { href: "/audit-log", label: "Audit Log", icon: <FileText className="w-5 h-5" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const notifications = [
    { id: 1, title: "New booking #1234", time: "2 min ago", unread: true },
    { id: 2, title: "Payment received €500", time: "15 min ago", unread: true },
    { id: 3, title: "Room 204 checked out", time: "1 hour ago", unread: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[hsl(var(--sidebar-bg))] flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-fg))] transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[hsl(var(--sidebar-hover))]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">A&O Admin</span>
          </div>
          <button className="md:hidden hover:bg-[hsl(var(--sidebar-hover))] p-1 rounded" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  active
                    ? "bg-[hsl(var(--sidebar-active))] text-white shadow-lg shadow-blue-500/25"
                    : "text-slate-300 hover:bg-[hsl(var(--sidebar-hover))] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${active ? "text-white" : "text-slate-400 group-hover:text-white"} transition-colors`}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[hsl(var(--sidebar-hover))]">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-[hsl(var(--sidebar-hover))] hover:text-white transition-all duration-200"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="text-sm">{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-[hsl(var(--card))] border-b border-gray-200 dark:border-[hsl(var(--sidebar-hover))] flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 backdrop-blur-sm bg-white/80 dark:bg-[hsl(var(--card))]/80">
          <div className="flex items-center gap-4">
            <button className="md:hidden hover:bg-gray-100 dark:hover:bg-[hsl(var(--sidebar-hover))] p-2 rounded-lg" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="relative hidden md:block">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings, guests, rooms..."
                className="pl-10 pr-4 py-2 w-80 border border-gray-200 dark:border-[hsl(var(--sidebar-hover))] rounded-xl text-sm bg-gray-50 dark:bg-[hsl(var(--sidebar-hover))] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Quick Actions */}
            <button className="hidden md:flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
              <span>New Booking</span>
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-[hsl(var(--sidebar-hover))] rounded-xl relative">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse-dot" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[hsl(var(--card))] rounded-xl shadow-xl border border-gray-200 dark:border-[hsl(var(--sidebar-hover))] py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-[hsl(var(--sidebar-hover))]">
                    <h3 className="font-semibold text-sm dark:text-white">Notifications</h3>
                  </div>
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-[hsl(var(--sidebar-hover))] cursor-pointer ${notif.unread ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{notif.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notif.time}</p>
                    </div>
                  ))}
                  <div className="px-4 py-2 border-t border-gray-100 dark:border-[hsl(var(--sidebar-hover))]">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all notifications</button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-[hsl(var(--sidebar-hover))] rounded-xl transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {(user?.first_name?.[0] || "")}{(user?.last_name?.[0] || "")}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.first_name || "User"}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">{user?.admin_role?.name || user?.role}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[hsl(var(--card))] rounded-xl shadow-xl border border-gray-200 dark:border-[hsl(var(--sidebar-hover))] py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-[hsl(var(--sidebar-hover))]">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                  <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[hsl(var(--sidebar-hover))] flex items-center gap-2">
                    <UserCircle className="w-4 h-4" /> Profile
                  </button>
                  <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[hsl(var(--sidebar-hover))] flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" /> Help & Support
                  </button>
                  <div className="border-t border-gray-100 dark:border-[hsl(var(--sidebar-hover))] my-1" />
                  <button onClick={logout} className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-[1600px] w-full mx-auto">{children}</main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}

// ==================== PageHeader ====================
export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

// ==================== Card ====================
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-[hsl(var(--card))] rounded-2xl border border-gray-200 dark:border-[hsl(var(--sidebar-hover))] shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      {children}
    </div>
  );
}

// ==================== StatsCard ====================
export function StatsCard({
  title,
  value,
  change,
  changeType = "positive",
  icon,
  accentColor = "blue",
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  accentColor?: "blue" | "green" | "yellow" | "red" | "purple";
}) {
  const accentColors: Record<string, string> = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  };

  const changeColors: Record<string, string> = {
    positive: "text-green-600 dark:text-green-400",
    negative: "text-red-600 dark:text-red-400",
    neutral: "text-gray-600 dark:text-gray-400",
  };

  return (
    <div className="bg-white dark:bg-[hsl(var(--card))] rounded-2xl border border-gray-200 dark:border-[hsl(var(--sidebar-hover))] p-5 shadow-sm card-hover group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentColors[accentColor]} group-hover:scale-110 transition-transform duration-200`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
      {change && (
        <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${changeColors[changeType]}`}>
          {changeType === "positive" && <TrendingUp className="w-4 h-4" />}
          {changeType === "negative" && <TrendingUp className="w-4 h-4 rotate-180" />}
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}

// ==================== DataTable ====================
export function DataTable({ columns, data, loading, pagination, onPageChange, actions }: any) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-[hsl(var(--sidebar-hover))] border-b border-gray-200 dark:border-[hsl(var(--sidebar-hover))]">
            <tr>
              {columns.map((col: any) => (
                <th key={col.key} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
              {actions && <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-[hsl(var(--sidebar-hover))]">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((item: any, idx: number) => (
                <tr key={item.id || idx} className="hover:bg-gray-50 dark:hover:bg-[hsl(var(--sidebar-hover))]/50 transition-colors">
                  {columns.map((col: any) => (
                    <td key={col.key} className="px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300">
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3.5 text-right">
                      {actions(item)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && pagination.last_page > 1 && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-[hsl(var(--sidebar-hover))] flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {pagination.current_page} of {pagination.last_page}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange?.(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="px-4 py-2 text-sm border border-gray-200 dark:border-[hsl(var(--sidebar-hover))] rounded-lg hover:bg-gray-50 dark:hover:bg-[hsl(var(--sidebar-hover))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange?.(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
              className="px-4 py-2 text-sm border border-gray-200 dark:border-[hsl(var(--sidebar-hover))] rounded-lg hover:bg-gray-50 dark:hover:bg-[hsl(var(--sidebar-hover))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ==================== Badge ====================
export function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: string }) {
  const variants: Record<string, string> = {
    default: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
}

// ==================== Button ====================
export function Button({ children, variant = "primary", size = "md", className = "", ...props }: any) {
  const variants: Record<string, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow",
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 dark:border-[hsl(var(--sidebar-hover))] hover:bg-gray-50 dark:hover:bg-[hsl(var(--sidebar-hover))]",
    ghost: "hover:bg-gray-100 dark:hover:bg-[hsl(var(--sidebar-hover))]",
    success: "bg-green-600 text-white hover:bg-green-700",
  };
  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-xl font-medium transition-all duration-200 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// ==================== Input ====================
export function Input({ label, error, className = "", onChange, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; className?: string }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>}
      <input
        onChange={onChange}
        className={`w-full px-3.5 py-2.5 border rounded-xl text-sm bg-white dark:bg-[hsl(var(--sidebar-hover))] dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
          error ? "border-red-300 focus:ring-red-500" : "border-gray-200 dark:border-[hsl(var(--sidebar-hover))]"
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

// ==================== Select ====================
export function Select({ label, options, className = "", onChange, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; options: { value: string; label: string }[]; className?: string }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>}
      <select
        onChange={onChange}
        className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-[hsl(var(--sidebar-hover))] rounded-xl text-sm bg-white dark:bg-[hsl(var(--sidebar-hover))] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// ==================== Modal ====================
export function Modal({ open, onClose, title, children, size = "md" }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: "sm" | "md" | "lg" | "xl" }) {
  if (!open) return null;
  const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white dark:bg-[hsl(var(--card))] rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-[hsl(var(--sidebar-hover))]">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-[hsl(var(--sidebar-hover))] rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ==================== EmptyState ====================
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-20 h-20 bg-gray-100 dark:bg-[hsl(var(--sidebar-hover))] rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Activity className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      {description && <p className="text-gray-500 dark:text-gray-400 mt-1.5 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// ==================== Skeleton ====================
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[hsl(var(--card))] rounded-2xl border border-gray-200 dark:border-[hsl(var(--sidebar-hover))] p-5">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

// ==================== ProgressBar ====================
export function ProgressBar({ value, max = 100, color = "blue", className = "" }: { value: number; max?: number; color?: string; className?: string }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const colors: Record<string, string> = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    red: "bg-red-600",
    yellow: "bg-yellow-600",
  };
  return (
    <div className={`w-full bg-gray-200 dark:bg-[hsl(var(--sidebar-hover))] rounded-full h-2 ${className}`}>
      <div className={`h-2 rounded-full ${colors[color] || colors.blue} transition-all duration-500`} style={{ width: `${percentage}%` }} />
    </div>
  );
}

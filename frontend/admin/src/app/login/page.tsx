"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, AlertCircle, ChevronDown, UserCircle } from "lucide-react";
import { authApi } from "../../services/api";

const TEST_ACCOUNTS = [
  { role: "Super Admin", email: "superadmin@ao.com", password: "super123" },
  { role: "Regional Manager", email: "regional@ao.com", password: "regional123" },
  { role: "Property Manager", email: "property@ao.com", password: "property123" },
  { role: "Hotel Manager", email: "manager@ao.com", password: "manager123" },
  { role: "Reception", email: "reception@ao.com", password: "reception123" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAccounts(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.login(email, password);
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("staff", JSON.stringify(response.data.staff));
      router.push("/");
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (account: typeof TEST_ACCOUNTS[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    setShowAccounts(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden relative">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">A&O Admin</h1>
            <p className="text-blue-100 text-sm">Sign in to your account</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="admin@ao.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647.z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-4 relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowAccounts(!showAccounts)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all"
              >
                <UserCircle className="w-3.5 h-3.5" />
                Test Accounts
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAccounts ? 'rotate-180' : ''}`} />
              </button>

              {showAccounts && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-10 max-h-64 overflow-y-auto">
                  <div className="p-1.5">
                    {TEST_ACCOUNTS.map((account) => (
                      <button
                        key={account.email}
                        type="button"
                        onClick={() => fillCredentials(account)}
                        className="w-full flex items-center gap-2.5 p-2.5 hover:bg-blue-50 rounded-lg transition-all text-left group"
                      >
                        <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                          <span className="text-[10px] font-bold text-blue-700">{account.role.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{account.role}</p>
                          <p className="text-[10px] text-gray-500 truncate">{account.email}</p>
                        </div>
                        <span className="text-[10px] font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          Use
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-blue-200/60 mt-4">
          A&O Hotel Management System
        </p>
      </div>
    </div>
  );
}
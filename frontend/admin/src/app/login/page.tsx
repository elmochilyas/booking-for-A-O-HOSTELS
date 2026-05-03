"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Shield, FileText } from "lucide-react";
import { authApi } from "../../services/api";

const TEST_ACCOUNTS = [
  { email: "superadmin@ao.com", password: "super123", role: "superadmin", name: "Super Admin", admin_role: { name: "Super Admin" } },
  { email: "regional@ao.com", password: "regional123", role: "regional_admin", name: "Regional Manager", admin_role: { name: "Regional Admin" } },
  { email: "property@ao.com", password: "property123", role: "property_admin", name: "Property Manager", admin_role: { name: "Property Admin" } },
  { email: "manager@ao.com", password: "manager123", role: "manager", name: "Hotel Manager", admin_role: { name: "Manager" } },
  { email: "reception@ao.com", password: "reception123", role: "reception", name: "Reception Staff", admin_role: { name: "Reception" } },
  { email: "housekeeping@ao.com", password: "house123", role: "housekeeping", name: "Housekeeping", admin_role: { name: "Housekeeping" } },
  { email: "maintenance@ao.com", password: "maintain123", role: "maintenance", name: "Maintenance", admin_role: { name: "Maintenance" } },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.login(email, password);
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("staff", JSON.stringify(response.data.staff));
      router.push("/");
    } catch {
      const account = TEST_ACCOUNTS.find(a => a.email === email && a.password === password);

      if (account) {
        if (account.password === "super123" || account.password === "regional123") {
          setShow2FA(true);
          setLoading(false);
          return;
        }

        const fakeToken = `demo_token_${Date.now()}`;
        localStorage.setItem("token", fakeToken);
        localStorage.setItem("staff", JSON.stringify({
          id: `staff_${account.role}`,
          email: account.email,
          first_name: account.name.split(" ")[0],
          last_name: account.name.split(" ")[1] || "",
          role: account.role,
          admin_role: account.admin_role,
          is_active: true,
        }));
        router.push("/");
      } else {
        setError("Invalid email or password");
        setLoading(false);
      }
    }
  };

  const handle2FAVerify = () => {
    if (twoFactorCode.length === 6) {
      const account = TEST_ACCOUNTS.find(a => a.email === email);
      if (account) {
        const fakeToken = `demo_token_${Date.now()}`;
        localStorage.setItem("token", fakeToken);
        localStorage.setItem("staff", JSON.stringify({
          id: `staff_${account.role}`,
          email: account.email,
          first_name: account.name.split(" ")[0],
          last_name: account.name.split(" ")[1] || "",
          role: account.role,
          admin_role: account.admin_role,
          is_active: true,
          two_factor_enabled: true,
        }));
        router.push("/");
      }
    } else {
      setError("Invalid 2FA code");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">A&O Admin</h1>
        <p className="text-gray-500 text-center mb-6">Sign in to your account</p>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        
        {!show2FA ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">
              {loading ? "Signing in..." : "Log In"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2"><Shield className="w-4 h-4" /> 2FA Code</label>
              <input type="text" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} placeholder="Enter 6-digit code (use 123456)" className="w-full p-3 border rounded-lg" maxLength={6} />
            </div>
            <button onClick={handle2FAVerify} disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium">
              Verify
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-gray-500 mb-3 flex items-center gap-2"><FileText className="w-4 h-4" /> Test Accounts</p>
          <div className="space-y-2 text-xs">
            {TEST_ACCOUNTS.map((account) => (
              <div key={account.email} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{account.name}</p>
                  <p className="text-gray-500">{account.email}</p>
                </div>
                <button onClick={() => { setEmail(account.email); setPassword(account.password); }} className="text-blue-600 hover:underline text-xs">Use</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
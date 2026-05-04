"use client";

import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { adminApi } from "../../services/api";
import { AdminLayout, PageHeader, Card, Button } from "../components/AdminComponents";

interface ConfigItem {
  key: string;
  value: string;
  type: string;
  category: string;
  description: string;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getSystemConfig();
      const items: ConfigItem[] = response.data.data || [];
      setConfig(items);
      const initial: Record<string, string> = {};
      items.forEach(item => { initial[item.key] = item.value; });
      setEdits(initial);
    } catch {
      console.error("Failed to fetch system config");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (item: ConfigItem) => {
    setSaving(item.key);
    try {
      await adminApi.updateSystemConfig({ key: item.key, value: edits[item.key], type: item.type, category: item.category });
      setConfig(cfg => cfg.map(c => c.key === item.key ? { ...c, value: edits[item.key] } : c));
    } catch {
      console.error("Failed to save config");
    } finally {
      setSaving(null);
    }
  };

  const byCategory = config.reduce<Record<string, ConfigItem[]>>((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  return (
    <AdminLayout>
      <PageHeader title="Settings" subtitle="System configuration" />

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : config.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">No configuration settings found.</Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(byCategory).map(([category, items]) => (
            <Card key={category} className="overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b">
                <h3 className="font-semibold capitalize">{category.replace(/_/g, " ")}</h3>
              </div>
              <div className="divide-y">
                {items.map(item => (
                  <div key={item.key} className="px-5 py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.key}</p>
                      {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                    </div>
                    <input
                      type={item.type === "boolean" ? "text" : item.type === "number" ? "number" : "text"}
                      value={edits[item.key] ?? item.value}
                      onChange={e => setEdits(ed => ({ ...ed, [item.key]: e.target.value }))}
                      className="border rounded-lg px-3 py-1.5 text-sm w-56"
                    />
                    <Button
                      onClick={() => handleSave(item)}
                      disabled={saving === item.key || edits[item.key] === item.value}
                      className="shrink-0"
                    >
                      {saving === item.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

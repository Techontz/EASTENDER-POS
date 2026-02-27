import { Settings as SettingsIcon, User, Bell, Shield, Database, Globe } from "lucide-react";

export default function Settings() {
  const settingsSections = [
    { icon: User, title: "Profile Settings", desc: "Manage your account details and preferences" },
    { icon: Bell, title: "Notifications", desc: "Configure how you receive alerts and updates" },
    { icon: Shield, title: "Security", desc: "Password management and access controls" },
    { icon: Database, title: "Data Management", desc: "Backup and restore system data" },
    { icon: Globe, title: "Regional Settings", desc: "Currency, timezone, and language" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
        <p className="text-black/40 text-sm">Configure enterprise-wide parameters and user preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsSections.map((section, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm hover:border-emerald-500/20 transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center text-black/40 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                <section.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm">{section.title}</h3>
                <p className="text-xs text-black/40">{section.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

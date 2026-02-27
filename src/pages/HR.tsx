import { useState, useEffect } from "react";
import { 
  Users, 
  Clock, 
  Calendar, 
  ArrowRight, 
  LogIn, 
  LogOut,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2
} from "lucide-react";
import { AttendanceLog } from "../types";
import { cn } from "../lib/utils";

export default function HR() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [activeTab, setActiveTab] = useState<'attendance' | 'staff'>('attendance');

  const currentUser = JSON.parse(localStorage.getItem("eastender_user") || "{}");

  useEffect(() => {
    fetch("/api/attendance", {
      headers: { "x-user-id": currentUser.id }
    })
      .then(res => res.json())
      .then(data => setLogs(data));
  }, []);

  const handleClockAction = async (type: 'IN' | 'OUT') => {
    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": currentUser.id
        },
        body: JSON.stringify({ userId: currentUser.id, type })
      });
      // Refresh logs
      const res = await fetch("/api/attendance", {
        headers: { "x-user-id": currentUser.id }
      });
      const data = await res.json();
      setLogs(data);
      alert(`Clocked ${type} successfully!`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">HR & Workforce</h2>
          <p className="text-black/40 text-sm">Monitor staff attendance, roles, and performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleClockAction('IN')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Clock In
          </button>
          <button 
            onClick={() => handleClockAction('OUT')}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Clock Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-black/5">
        <button 
          onClick={() => setActiveTab('attendance')}
          className={cn(
            "pb-4 text-sm font-bold transition-all relative",
            activeTab === 'attendance' ? "text-black" : "text-black/40 hover:text-black"
          )}
        >
          Attendance Logs
          {activeTab === 'attendance' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('staff')}
          className={cn(
            "pb-4 text-sm font-bold transition-all relative",
            activeTab === 'staff' ? "text-black" : "text-black/40 hover:text-black"
          )}
        >
          Staff Directory
          {activeTab === 'staff' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />}
        </button>
      </div>

      {activeTab === 'attendance' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-black/5 flex items-center justify-between">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                <input 
                  type="text" 
                  placeholder="Search staff..." 
                  className="w-full pl-10 pr-4 py-2 bg-black/5 border-none rounded-xl text-sm outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-xl hover:bg-black/5 text-black/40">
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/[0.02] border-b border-black/5">
                    <th className="px-6 py-4 text-[10px] font-bold text-black/40 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-black/40 uppercase tracking-wider">Branch</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-black/40 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-black/40 uppercase tracking-wider text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-black/[0.01] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-[10px] font-bold">
                            {log.full_name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm font-bold">{log.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-black/60">{log.branch_name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                          log.type === 'IN' ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                        )}>
                          Clock {log.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs font-mono text-black/40">{new Date(log.timestamp).toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-4">
              <h3 className="font-bold text-lg">Today's Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-black/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-black/40" />
                    <span className="text-sm font-medium">Total Staff</span>
                  </div>
                  <span className="text-sm font-bold">42</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">Present</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-700">38</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-700">Late / Absent</span>
                  </div>
                  <span className="text-sm font-bold text-red-700">4</span>
                </div>
              </div>
            </div>
            
            <div className="bg-black text-white p-6 rounded-3xl shadow-xl">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Shift Schedule</p>
              <h4 className="text-lg font-bold mb-4">Morning Shift (HQ)</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <p className="text-xs text-white/60">08:00 AM - 05:00 PM</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <p className="text-xs text-white/60">24 Staff Assigned</p>
                </div>
              </div>
              <button className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">
                Manage Rosters
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Staff Cards */}
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-4 group hover:border-black/10 transition-all">
              <div className="flex items-start justify-between">
                <div className="w-16 h-16 rounded-2xl bg-black/5 flex items-center justify-center text-xl font-bold">
                  JD
                </div>
                <button className="p-2 rounded-lg hover:bg-black/5 text-black/20">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h4 className="font-bold text-base">John Doe</h4>
                <p className="text-xs text-black/40">Branch Manager - HQ</p>
              </div>
              <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider">Active</span>
                </div>
                <button className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                  Profile <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

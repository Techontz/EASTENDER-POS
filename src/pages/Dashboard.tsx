import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Users, 
  Package, 
  Building2, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  Calendar,
  Globe,
  Truck,
  ClipboardList,
  Activity
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { formatCurrency, cn } from "../lib/utils";

const data = [
  { name: "Mon", sales: 4000, expenses: 2400 },
  { name: "Tue", sales: 3000, expenses: 1398 },
  { name: "Wed", sales: 2000, expenses: 9800 },
  { name: "Thu", sales: 2780, expenses: 3908 },
  { name: "Fri", sales: 1890, expenses: 4800 },
  { name: "Sat", sales: 2390, expenses: 3800 },
  { name: "Sun", sales: 3490, expenses: 4300 },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    retailSalesToday: 0,
    totalImportOrders: 0,
    ordersInTransit: 0,
    pendingProcurement: 0,
    activeDeliveries: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalBranches: 0
  });

  const currentUser = JSON.parse(localStorage.getItem("eastender_user") || "{}");

  useEffect(() => {
    fetch("/api/dashboard/stats", {
      headers: { "x-user-id": currentUser.id }
    })
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Executive Overview</h2>
          <p className="text-black/40 text-sm">Real-time performance across all countries and branches.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-black/5 shadow-sm">
          <button className="px-4 py-2 text-xs font-bold bg-black text-white rounded-lg">Real-time</button>
          <button className="px-4 py-2 text-xs font-bold text-black/40 hover:text-black transition-colors">Last 24h</button>
          <button className="px-4 py-2 text-xs font-bold text-black/40 hover:text-black transition-colors">Last 7d</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        <StatCard 
          title="Retail Sales Today" 
          value={formatCurrency(stats.retailSalesToday)} 
          change="+8.2%" 
          trend="up" 
          icon={DollarSign}
          color="emerald"
        />
        <StatCard 
          title="Total Import Orders" 
          value={stats.totalImportOrders.toString()} 
          change="+12" 
          trend="up" 
          icon={Globe}
          color="blue"
        />
        <StatCard 
          title="Orders In Transit" 
          value={stats.ordersInTransit.toString()} 
          change="+5" 
          trend="up" 
          icon={Truck}
          color="purple"
        />
        <StatCard 
          title="Pending Procurement" 
          value={stats.pendingProcurement.toString()} 
          change="-2" 
          trend="down" 
          icon={ClipboardList}
          color="orange"
        />
        <StatCard 
          title="Active Deliveries" 
          value={stats.activeDeliveries.toString()} 
          change="+3" 
          trend="up" 
          icon={Activity}
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-4 lg:p-6 rounded-2xl border border-black/5 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Sales Performance</h3>
              <p className="text-xs text-black/40">Daily revenue vs expenses across all regions</p>
            </div>
            <Calendar className="w-5 h-5 text-black/20" />
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#999'}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#999'}} 
                  tickFormatter={(value) => `${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-6">
          <h3 className="font-bold text-lg">Recent Operations</h3>
          <div className="space-y-4">
            <ActivityItem 
              title="New Purchase Order" 
              desc="Branch: Arusha - TZS 4.2M" 
              time="2 mins ago" 
              type="procurement"
            />
            <ActivityItem 
              title="Stock Alert" 
              desc="Laptop Pro running low in HQ" 
              time="15 mins ago" 
              type="inventory"
            />
            <ActivityItem 
              title="Staff Login" 
              desc="John Doe clocked in at Arusha" 
              time="45 mins ago" 
              type="hr"
            />
            <ActivityItem 
              title="Large Sale" 
              desc="TZS 12.5M transaction at HQ" 
              time="1 hour ago" 
              type="sales"
            />
          </div>
          <button className="w-full py-3 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors">
            View Full Audit Log
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, trend, icon: Icon, color }: any) {
  const colors: any = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className={cn("p-2 rounded-xl", colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
          trend === "up" ? "bg-emerald-50 text-emerald-600" : 
          trend === "down" ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-600"
        )}>
          {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : 
           trend === "down" ? <ArrowDownRight className="w-3 h-3" /> : null}
          {change}
        </div>
      </div>
      <div>
        <p className="text-black/40 text-xs font-medium uppercase tracking-wider">{title}</p>
        <h4 className="text-2xl font-bold mt-1">{value}</h4>
      </div>
    </div>
  );
}

function ActivityItem({ title, desc, time, type }: any) {
  return (
    <div className="flex gap-4">
      <div className={cn(
        "w-2 h-2 rounded-full mt-2 shrink-0",
        type === "procurement" ? "bg-blue-500" :
        type === "inventory" ? "bg-orange-500" :
        type === "hr" ? "bg-purple-500" : "bg-emerald-500"
      )} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">{title}</p>
        <p className="text-xs text-black/40 truncate">{desc}</p>
        <p className="text-[10px] text-black/20 mt-1 font-medium">{time}</p>
      </div>
    </div>
  );
}

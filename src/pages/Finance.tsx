import { useState } from "react";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Filter,
  Calendar,
  DollarSign
} from "lucide-react";
import { formatCurrency, cn } from "../lib/utils";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const data = [
  { name: "Jan", revenue: 45000000, expenses: 32000000 },
  { name: "Feb", revenue: 52000000, expenses: 34000000 },
  { name: "Mar", revenue: 48000000, expenses: 31000000 },
  { name: "Apr", revenue: 61000000, expenses: 38000000 },
  { name: "May", revenue: 55000000, expenses: 36000000 },
  { name: "Jun", revenue: 67000000, expenses: 41000000 },
];

const pieData = [
  { name: "Salaries", value: 45, color: "#10b981" },
  { name: "Inventory", value: 30, color: "#3b82f6" },
  { name: "Logistics", value: 15, color: "#f59e0b" },
  { name: "Rent/Utils", value: 10, color: "#8b5cf6" },
];

export default function Finance() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financial Control</h2>
          <p className="text-black/40 text-sm">Revenue tracking, expense management, and P&L reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-black/5 rounded-xl text-sm font-bold hover:bg-black/5 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-black/80 transition-colors">
            <DollarSign className="w-4 h-4" />
            Record Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <FinanceCard 
          title="Net Profit" 
          value="TZS 26.4M" 
          change="+18.2%" 
          trend="up" 
          icon={TrendingUp}
          color="emerald"
        />
        <FinanceCard 
          title="Total Expenses" 
          value="TZS 41.2M" 
          change="+5.4%" 
          trend="down" 
          icon={TrendingDown}
          color="red"
        />
        <FinanceCard 
          title="Cash on Hand" 
          value="TZS 158.5M" 
          change="+2.1%" 
          trend="up" 
          icon={Wallet}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Revenue vs Expenses Chart */}
        <div className="lg:col-span-2 bg-white p-4 lg:p-6 rounded-2xl border border-black/5 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Revenue vs Expenses</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-black/40">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs font-bold text-black/40">Expenses</span>
              </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
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
                  tickFormatter={(value) => `${value/1000000}M`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-6">
          <h3 className="font-bold text-lg">Expense Distribution</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium text-black/60">{item.name}</span>
                </div>
                <span className="text-sm font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FinanceCard({ title, value, change, trend, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className={cn(
          "p-2 rounded-xl",
          color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
          color === 'red' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
          trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
        )}>
          {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
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

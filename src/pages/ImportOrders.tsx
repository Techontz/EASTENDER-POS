import { useState, useEffect } from "react";
import { 
  Globe, 
  Search, 
  Filter, 
  MoreVertical, 
  User, 
  Clock, 
  Truck, 
  CheckCircle2, 
  Package,
  ArrowRight
} from "lucide-react";
import { formatCurrency, cn } from "../lib/utils";
import { motion } from "motion/react";

const STATUS_COLORS: Record<string, string> = {
  "Pending": "bg-orange-100 text-orange-600",
  "Processing": "bg-blue-100 text-blue-600",
  "In Transit": "bg-purple-100 text-purple-600",
  "Arrived at Warehouse": "bg-indigo-100 text-indigo-600",
  "Out for Delivery": "bg-amber-100 text-amber-600",
  "Delivered": "bg-emerald-100 text-emerald-600",
};

export default function ImportOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [procurementOfficers, setProcurementOfficers] = useState<any[]>([]);
  const [logisticsOfficers, setLogisticsOfficers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem("eastender_user") || "{}");

  useEffect(() => {
    fetchOrders();
    fetchOfficers();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/import-orders", {
        headers: { "x-user-id": currentUser.id }
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    const pRes = await fetch("/api/users/by-role/Procurement Officer");
    setProcurementOfficers(await pRes.json());
    
    const lRes = await fetch("/api/users/by-role/Branch Manager"); // Assuming managers can handle logistics or I should add a Logistics role
    // For now let's just use managers as logistics placeholders if no specific role exists
    setLogisticsOfficers(await lRes.json());
  };

  const updateOrder = async (id: number, updates: any) => {
    try {
      const res = await fetch(`/api/import-orders/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": currentUser.id
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toString().includes(search)
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Import Orders</h2>
          <p className="text-black/40 text-sm">Manage cross-border shipment orders from mobile and web users.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-100">
            {orders.length} Total Orders
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-black/5 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer..." 
              className="w-full pl-10 pr-4 py-2 bg-black/5 border-none rounded-xl text-sm outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="p-2 rounded-xl hover:bg-black/5 text-black/40">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/[0.02] border-b border-black/5">
                <th className="px-6 py-4 text-[10px] font-bold text-black/40 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-black/40 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-[10px] font-bold text-black/40 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-black/40 uppercase tracking-wider">Assignment</th>
                <th className="px-6 py-4 text-[10px] font-bold text-black/40 uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-black/40 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-black/[0.01] transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-bold">#IMP-{order.id.toString().padStart(5, '0')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                        <User className="w-4 h-4 text-black/40" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{order.customer_name}</p>
                        <p className="text-[10px] text-black/40">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={order.status}
                      onChange={(e) => updateOrder(order.id, { status: e.target.value })}
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border-none outline-none cursor-pointer",
                        STATUS_COLORS[order.status] || "bg-black/5 text-black/60"
                      )}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Arrived at Warehouse">Arrived at Warehouse</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Package className="w-3 h-3 text-black/20" />
                        <select 
                          value={order.assigned_procurement_id || ""}
                          onChange={(e) => updateOrder(order.id, { assigned_procurement_id: e.target.value })}
                          className="text-[10px] bg-transparent border-none outline-none text-black/60 font-medium"
                        >
                          <option value="">Assign Procurement</option>
                          {procurementOfficers.map(p => (
                            <option key={p.id} value={p.id}>{p.full_name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="w-3 h-3 text-black/20" />
                        <select 
                          value={order.assigned_logistics_id || ""}
                          onChange={(e) => updateOrder(order.id, { assigned_logistics_id: e.target.value })}
                          className="text-[10px] bg-transparent border-none outline-none text-black/60 font-medium"
                        >
                          <option value="">Assign Logistics</option>
                          {logisticsOfficers.map(l => (
                            <option key={l.id} value={l.id}>{l.full_name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-emerald-600">{formatCurrency(order.total_amount)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-lg hover:bg-black/5 text-black/20 hover:text-black">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && !loading && (
            <div className="py-20 text-center space-y-4 opacity-20">
              <Globe className="w-12 h-12 mx-auto" />
              <p className="text-sm font-bold">No import orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

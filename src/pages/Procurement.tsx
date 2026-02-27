import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText,
  Building2,
  User as UserIcon,
  ChevronRight
} from "lucide-react";
import { ProcurementRequest } from "../types";
import { formatCurrency, cn } from "../lib/utils";

export default function Procurement() {
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("eastender_user") || "{}");

  useEffect(() => {
    fetch("/api/procurement", {
      headers: { "x-user-id": currentUser.id }
    })
      .then(res => res.json())
      .then(data => setRequests(data));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Procurement & Sourcing</h2>
          <p className="text-black/40 text-sm">Manage purchase requests and supplier approvals.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-black/80 transition-colors shadow-lg shadow-black/10"
        >
          <Plus className="w-4 h-4" />
          New Purchase Request
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Active Requests List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Recent Requests</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-[10px] font-bold bg-black text-white rounded-lg uppercase tracking-wider">All</button>
              <button className="px-3 py-1 text-[10px] font-bold text-black/40 hover:text-black rounded-lg uppercase tracking-wider">Pending</button>
              <button className="px-3 py-1 text-[10px] font-bold text-black/40 hover:text-black rounded-lg uppercase tracking-wider">Approved</button>
            </div>
          </div>

          <div className="space-y-4">
            {requests.map(request => (
              <div key={request.id} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm hover:border-black/10 transition-all group cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                      request.status === 'PENDING' ? "bg-orange-50 text-orange-600" :
                      request.status === 'APPROVED' ? "bg-emerald-50 text-emerald-600" :
                      request.status === 'REJECTED' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                    )}>
                      {request.status === 'PENDING' ? <Clock className="w-6 h-6" /> :
                       request.status === 'APPROVED' ? <CheckCircle2 className="w-6 h-6" /> :
                       request.status === 'REJECTED' ? <XCircle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base truncate">{request.title}</h4>
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                          request.status === 'PENDING' ? "bg-orange-100 text-orange-700" :
                          request.status === 'APPROVED' ? "bg-emerald-100 text-emerald-700" :
                          request.status === 'REJECTED' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-xs text-black/40 mt-1 line-clamp-1">{request.description}</p>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-black/20" />
                          <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider">{request.branch_name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <UserIcon className="w-3 h-3 text-black/20" />
                          <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider">{request.requester_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(request.estimated_cost)}</p>
                    <p className="text-[10px] text-black/20 mt-1 font-medium">{new Date(request.created_at).toLocaleDateString()}</p>
                    <ChevronRight className="w-5 h-5 text-black/10 group-hover:text-black/40 transition-colors ml-auto mt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Procurement Stats & Actions */}
        <div className="space-y-8">
          <div className="bg-black text-white p-6 rounded-3xl shadow-xl space-y-6">
            <h3 className="font-bold text-lg">Budget Overview</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-white/40 text-xs uppercase tracking-wider font-bold">
                  <span>Monthly Allocation</span>
                  <span>75% Used</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-3/4" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Spent</p>
                  <p className="text-sm font-bold">TZS 12.4M</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Remaining</p>
                  <p className="text-sm font-bold">TZS 4.1M</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-4">
            <h3 className="font-bold text-lg">Top Suppliers</h3>
            <div className="space-y-4">
              <SupplierItem name="Global Tech Ltd" volume="TZS 45M" rating={4.8} />
              <SupplierItem name="Office Depot TZ" volume="TZS 12M" rating={4.5} />
              <SupplierItem name="Logistics Pro" volume="TZS 8.4M" rating={4.2} />
            </div>
            <button className="w-full py-3 text-xs font-bold text-black/40 bg-black/5 rounded-xl hover:bg-black/10 transition-colors">
              Manage Suppliers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SupplierItem({ name, volume, rating }: any) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-bold">{name}</p>
        <p className="text-[10px] text-black/40 font-medium">{volume} volume</p>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs font-bold text-emerald-600">{rating}</span>
        <div className="w-1 h-1 bg-black/10 rounded-full" />
      </div>
    </div>
  );
}

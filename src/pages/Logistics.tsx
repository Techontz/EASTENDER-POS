import { useState } from "react";
import { 
  Truck, 
  MapPin, 
  Package, 
  Navigation, 
  Clock, 
  CheckCircle2, 
  Search,
  Plus,
  ArrowRight,
  MoreVertical
} from "lucide-react";
import { formatCurrency, cn } from "../lib/utils";

const deliveries = [
  { id: "WB-1024", destination: "Arusha Branch", status: "IN_TRANSIT", driver: "Hamisi J.", items: 12, eta: "2h 15m" },
  { id: "WB-1025", destination: "Mwanza Hub", status: "PENDING", driver: "Sarah M.", items: 45, eta: "Tomorrow" },
  { id: "WB-1026", destination: "Zanzibar Store", status: "DELIVERED", driver: "John K.", items: 8, eta: "Completed" },
  { id: "WB-1027", destination: "Dodoma Office", status: "IN_TRANSIT", driver: "Peter L.", items: 22, eta: "4h 30m" },
];

export default function Logistics() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Logistics & Waybilling</h2>
          <p className="text-black/40 text-sm">Track shipments, manage drivers, and generate waybills.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-black/80 transition-colors">
          <Plus className="w-4 h-4" />
          Create Waybill
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-black/40 uppercase tracking-wider">Active Fleet</p>
            <p className="text-xl font-bold">12 Vehicles</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-black/40 uppercase tracking-wider">In Transit</p>
            <p className="text-xl font-bold">8 Shipments</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-black/40 uppercase tracking-wider">Delivered Today</p>
            <p className="text-xl font-bold">24 Orders</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-black/40 uppercase tracking-wider">Avg. Lead Time</p>
            <p className="text-xl font-bold">1.2 Days</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Shipments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Active Shipments</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
              <input 
                type="text" 
                placeholder="Search waybill ID..." 
                className="w-full pl-10 pr-4 py-2 bg-black/5 border-none rounded-xl text-sm outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            {deliveries.map(delivery => (
              <div key={delivery.id} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm hover:border-black/10 transition-all group">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                      delivery.status === 'IN_TRANSIT' ? "bg-blue-50 text-blue-600" :
                      delivery.status === 'PENDING' ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"
                    )}>
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base">{delivery.id}</h4>
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                          delivery.status === 'IN_TRANSIT' ? "bg-blue-100 text-blue-700" :
                          delivery.status === 'PENDING' ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"
                        )}>
                          {delivery.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-black/20" />
                          <span className="text-xs font-medium text-black/60">{delivery.destination}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-3 h-3 text-black/20" />
                          <span className="text-xs font-medium text-black/60">{delivery.driver}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{delivery.eta}</p>
                    <p className="text-[10px] text-black/40 mt-1 font-medium">{delivery.items} items</p>
                    <button className="mt-2 text-[10px] font-bold text-black/40 hover:text-black uppercase tracking-wider flex items-center gap-1 ml-auto">
                      View Details <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet & Drivers */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-6">
            <h3 className="font-bold text-lg">Driver Status</h3>
            <div className="space-y-4">
              <DriverStatus name="Hamisi J." status="ON_ROAD" />
              <DriverStatus name="Sarah M." status="AVAILABLE" />
              <DriverStatus name="John K." status="RESTING" />
              <DriverStatus name="Peter L." status="ON_ROAD" />
            </div>
            <button className="w-full py-3 text-xs font-bold text-black/40 bg-black/5 rounded-xl hover:bg-black/10 transition-colors">
              Manage Fleet
            </button>
          </div>

          <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-xl space-y-4">
            <h4 className="font-bold text-lg">Route Optimization</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              AI-powered route planning is active. Current routes are optimized for fuel efficiency and traffic conditions in Dar es Salaam.
            </p>
            <div className="pt-4 flex justify-between items-center">
              <div className="text-center">
                <p className="text-xl font-bold">15%</p>
                <p className="text-[10px] text-white/40 uppercase font-bold">Fuel Saved</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">42m</p>
                <p className="text-[10px] text-white/40 uppercase font-bold">Time Saved</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DriverStatus({ name, status }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-[10px] font-bold">
          {name.split(' ').map((n: string) => n[0]).join('')}
        </div>
        <span className="text-sm font-medium">{name}</span>
      </div>
      <div className={cn(
        "w-2 h-2 rounded-full",
        status === 'ON_ROAD' ? "bg-blue-500" :
        status === 'AVAILABLE' ? "bg-emerald-500" : "bg-gray-300"
      )} />
    </div>
  );
}

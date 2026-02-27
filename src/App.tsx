import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  ClipboardList, 
  Users, 
  Wallet, 
  Truck, 
  Settings as SettingsIcon,
  Bell,
  Search,
  User as UserIcon,
  Menu,
  X,
  LogOut,
  Globe
} from "lucide-react";
import { useState, useEffect, createContext, useContext } from "react";
import React from "react";
import { cn } from "./lib/utils";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Inventory from "./pages/Inventory";
import Procurement from "./pages/Procurement";
import HR from "./pages/HR";
import Finance from "./pages/Finance";
import Logistics from "./pages/Logistics";
import ImportOrders from "./pages/ImportOrders";
import Settings from "./pages/Settings";

// Auth Context
const AuthContext = createContext<any>(null);

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", permission: "dashboard" },
  { icon: Globe, label: "Import Orders", path: "/import-orders", permission: "import-orders" },
  { icon: ClipboardList, label: "Procurement", path: "/procurement", permission: "procurement" },
  { icon: Package, label: "Inventory", path: "/inventory", permission: "inventory" },
  { icon: ShoppingCart, label: "Retail Sales (POS)", path: "/pos", permission: "retail-sales" },
  { icon: Truck, label: "Logistics", path: "/logistics", permission: "logistics" },
  { icon: Wallet, label: "Finance", path: "/finance", permission: "finance" },
  { icon: Users, label: "HR", path: "/hr", permission: "hr" },
  { icon: SettingsIcon, label: "Settings", path: "/settings", permission: "settings" },
];

function LoginPage({ onLogin }: { onLogin: (user: any) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    const users = [
      {
        username: "admin",
        password: "admin123",
        full_name: "System Administrator",
        role_name: "Admin",
        permissions: ["all"]
      },
      {
        username: "cashier1",
        password: "cashier123",
        full_name: "Sales Cashier",
        role_name: "Cashier",
        permissions: ["retail-sales"]
      },
      {
        username: "manager_tz",
        password: "manager123",
        full_name: "Branch Manager",
        role_name: "Manager",
        permissions: [
          "dashboard",
          "import-orders",
          "procurement",
          "inventory",
          "retail-sales",
          "logistics",
          "finance"
        ]
      }
    ];
  
    const user = users.find(
      u => u.username === username && u.password === password
    );
  
    if (user) {
      onLogin(user);
    } else {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-black/5 p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-emerald-600">EASTENDER</h1>
          <p className="text-sm text-black/40 mt-2 font-medium uppercase tracking-widest">Enterprise Operations</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-black/40 uppercase tracking-wider ml-1">Username</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 bg-black/5 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-black/40 uppercase tracking-wider ml-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 bg-black/5 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}
          
          <button 
            type="submit"
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all"
          >
            Sign In
          </button>
        </form>

        <div className="pt-6 border-t border-black/5 text-center">
          <p className="text-[10px] text-black/20 font-bold uppercase tracking-widest">Secure Enterprise Access</p>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  
  const filteredNavItems = navItems.filter(item => 
    user?.permissions?.includes("all") || user?.permissions?.includes(item.permission)
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 w-64 bg-white border-r border-black/5 flex flex-col h-screen z-50 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-black/5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-emerald-600">EASTENDER</h1>
            <p className="text-[10px] text-black/40 uppercase tracking-widest font-semibold mt-1">Ops Management</p>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 rounded-xl hover:bg-black/5">
            <X className="w-5 h-5 text-black/40" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-emerald-50 text-emerald-700 shadow-sm" 
                    : "text-black/60 hover:bg-black/5 hover:text-black"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-emerald-600" : "text-black/40 group-hover:text-black/60")} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-black/5 space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-black/5">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {user?.full_name?.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{user?.full_name}</p>
              <p className="text-[10px] text-black/40 truncate uppercase tracking-wider font-bold">{user?.role_name}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-all group"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useContext(AuthContext);
  return (
    <header className="h-16 bg-white border-b border-black/5 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl hover:bg-black/5">
          <Menu className="w-5 h-5 text-black/60" />
        </button>
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-10 pr-4 py-2 bg-black/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 lg:gap-4">
        <button className="p-2 rounded-xl hover:bg-black/5 relative">
          <Bell className="w-5 h-5 text-black/60" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-8 w-[1px] bg-black/5 mx-1 lg:mx-2"></div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold">HQ - Tanzania</p>
            <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">Online</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center shrink-0">
            <UserIcon className="w-5 h-5 text-black/40" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("eastender_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData: any) => {
    setUser(userData);
    localStorage.setItem("eastender_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("eastender_user");
  };

  if (loading) return null;

  if (!user) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <AuthContext.Provider value={{ user, logout }}>
      <Router>
        <div className="flex min-h-screen bg-[#F5F5F5]">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          <div className="flex-1 flex flex-col min-w-0">
            <Header onMenuClick={() => setIsSidebarOpen(true)} />
            <main className="p-4 lg:p-8 flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={user.permissions.includes("all") || user.permissions.includes("dashboard") ? <Dashboard /> : <Navigate to="/pos" />} />
                <Route path="/import-orders" element={<ImportOrders />} />
                <Route path="/pos" element={<POS />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/procurement" element={<Procurement />} />
                <Route path="/hr" element={<HR />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/logistics" element={<Logistics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}


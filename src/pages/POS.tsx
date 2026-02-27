import { useState, useEffect, FormEvent } from "react";
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  User, 
  Printer,
  ChevronRight,
  Barcode,
  Package,
  ShoppingCart,
  History,
  LayoutGrid,
  PlusCircle,
  MoreVertical,
  ArrowRight
} from "lucide-react";
import { Product } from "../types";
import { formatCurrency, cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [search, setSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD">("CASH");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<"new-order" | "orders" | "products">("new-order");
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // New Product State
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    barcode: "",
    category: "General",
    price: 0,
    cost: 0,
    unit: "pcs"
  });

  const currentUser = JSON.parse(localStorage.getItem("eastender_user") || "{}");

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = () => {
    fetch("/api/products", {
      headers: { "x-user-id": currentUser.id }
    })
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  const fetchOrders = () => {
    fetch("/api/pos/history", {
      headers: { "x-user-id": currentUser.id }
    })
      .then(res => res.json())
      .then(data => setOrders(data));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode?.includes(search)
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    
    try {
      const res = await fetch("/api/pos/checkout", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": currentUser.id
        },
        body: JSON.stringify({
          branchId: 1,
          userId: currentUser.id,
          customerName: customerName || "Walk-in Customer",
          items: cart.map(item => ({ id: item.product.id, price: item.product.price, quantity: item.quantity })),
          totalAmount: total,
          paymentMethod
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setCart([]);
        setCustomerName("");
        alert("Order created successfully! Invoice #" + data.invoiceId);
        fetchOrders();
        setActiveTab("orders");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to create order. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleAddProduct = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": currentUser.id
        },
        body: JSON.stringify(newProduct)
      });
      const data = await res.json();
      if (data.success) {
        setIsAddingProduct(false);
        setNewProduct({ name: "", sku: "", barcode: "", category: "General", price: 0, cost: 0, unit: "pcs" });
        fetchProducts();
        alert("Product added successfully!");
      }
    } catch (err) {
      alert("Failed to add product");
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sales & Orders</h2>
          <p className="text-black/40 text-sm">Manage product catalog, sales orders, and transactions.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl border border-black/5 shadow-sm">
          <button 
            onClick={() => setActiveTab("new-order")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2",
              activeTab === "new-order" ? "bg-black text-white" : "text-black/40 hover:bg-black/5"
            )}
          >
            <PlusCircle className="w-4 h-4" />
            New Order
          </button>
          <button 
            onClick={() => setActiveTab("orders")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2",
              activeTab === "orders" ? "bg-black text-white" : "text-black/40 hover:bg-black/5"
            )}
          >
            <History className="w-4 h-4" />
            Order History
          </button>
          <button 
            onClick={() => setActiveTab("products")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2",
              activeTab === "products" ? "bg-black text-white" : "text-black/40 hover:bg-black/5"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
            Products
          </button>
        </div>
      </div>

      {activeTab === "new-order" && (
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
          {/* Product Selection */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                <input 
                  type="text" 
                  placeholder="Scan or search products..." 
                  className="w-full pl-10 pr-4 py-2 bg-black/5 border-none rounded-xl text-sm outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="p-2 rounded-xl bg-black/5 text-black/40">
                <Barcode className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pr-1">
              {filteredProducts.map(product => (
                <motion.button
                  layout
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm hover:border-emerald-500/50 transition-all text-left group"
                >
                  <div className="aspect-square bg-black/5 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                    <Package className="w-8 h-8 text-black/10 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{product.category}</p>
                  <h4 className="font-bold text-sm mt-1 line-clamp-1">{product.name}</h4>
                  <p className="text-[10px] text-black/40 font-mono mt-0.5">{product.sku}</p>
                  <div className="flex items-center justify-between mt-4">
                    <p className="font-bold text-emerald-600">{formatCurrency(product.price)}</p>
                    <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Cart / Order Summary */}
          <div className="w-full lg:w-[400px] bg-white rounded-3xl border border-black/5 shadow-xl flex flex-col overflow-hidden shrink-0">
            <div className="p-6 border-b border-black/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Order Entry</h3>
                <button onClick={() => setCart([])} className="text-xs font-bold text-red-500 hover:text-red-600">Clear</button>
              </div>
              
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                <input 
                  type="text" 
                  placeholder="Customer Name" 
                  className="w-full pl-10 pr-4 py-2 bg-black/5 border-none rounded-xl text-sm outline-none"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-4">
              <AnimatePresence mode="popLayout">
                {cart.map(item => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    key={item.product.id} 
                    className="flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6 text-black/10" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{item.product.name}</p>
                      <p className="text-xs text-black/40">{formatCurrency(item.product.price)}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-black/5 rounded-lg p-1">
                      <button 
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="p-1 hover:bg-white rounded-md transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="p-1 hover:bg-white rounded-md transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20 py-12">
                  <ShoppingCart className="w-12 h-12" />
                  <p className="text-sm font-bold">No items in order</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-black text-white space-y-6">
              <div className="flex justify-between text-xl font-bold pt-2 border-t border-white/10">
                <span>Total Amount</span>
                <span>{formatCurrency(total)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setPaymentMethod("CASH")}
                  className={cn(
                    "flex flex-col items-center gap-2 py-3 rounded-2xl border transition-all",
                    paymentMethod === "CASH" ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                  )}
                >
                  <Banknote className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Cash</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod("CARD")}
                  className={cn(
                    "flex flex-col items-center gap-2 py-3 rounded-2xl border transition-all",
                    paymentMethod === "CARD" ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                  )}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Card</span>
                </button>
              </div>

              <button 
                disabled={cart.length === 0 || isCheckingOut}
                onClick={handleCheckout}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/10 disabled:text-white/20 text-black font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                {isCheckingOut ? "Processing..." : "Submit Order"}
                {!isCheckingOut && <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-black/5 flex items-center justify-between">
            <h3 className="font-bold text-lg">Sales History</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="w-full pl-10 pr-4 py-2 bg-black/5 border-none rounded-xl text-sm outline-none"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/[0.02] border-b border-black/5">
                  <th className="px-6 py-4 text-[10px] font-bold text-black/40 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-black/40 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-black/40 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-black/40 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-black/40 uppercase tracking-wider text-right">Total</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-black/40 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-black/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-bold">#{order.id.toString().padStart(6, '0')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium">{order.customer_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-black/40">{new Date(order.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-lg bg-black/5 text-[10px] font-bold uppercase tracking-wider text-black/60">
                        {order.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-emerald-600">{formatCurrency(order.total_amount)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 rounded-lg hover:bg-black/5 text-black/20 hover:text-black">
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
              <input 
                type="text" 
                placeholder="Search catalog..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-black/5 rounded-xl text-sm outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsAddingProduct(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-4 group">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center">
                    <Package className="w-6 h-6 text-black/10" />
                  </div>
                  <button className="p-2 rounded-lg hover:bg-black/5 text-black/20">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{product.category}</p>
                  <h4 className="font-bold text-base mt-1">{product.name}</h4>
                  <p className="text-xs text-black/40 font-mono mt-1">{product.sku}</p>
                </div>
                <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                  <p className="font-bold text-lg text-emerald-600">{formatCurrency(product.price)}</p>
                  <button className="text-[10px] font-bold text-black/40 uppercase tracking-wider flex items-center gap-1 hover:text-black">
                    Edit Details <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddingProduct && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-black/5 flex items-center justify-between">
              <h3 className="font-bold text-lg">Add New Product</h3>
              <button onClick={() => setIsAddingProduct(false)} className="p-2 rounded-xl hover:bg-black/5">
                <Minus className="w-5 h-5 text-black/40" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-black/40 uppercase tracking-wider ml-1">Product Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 bg-black/5 border-none rounded-xl text-sm outline-none"
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-black/40 uppercase tracking-wider ml-1">SKU</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 bg-black/5 border-none rounded-xl text-sm outline-none"
                    value={newProduct.sku}
                    onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-black/40 uppercase tracking-wider ml-1">Barcode</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-black/5 border-none rounded-xl text-sm outline-none"
                    value={newProduct.barcode}
                    onChange={e => setNewProduct({...newProduct, barcode: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-black/40 uppercase tracking-wider ml-1">Price (TZS)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-4 py-2 bg-black/5 border-none rounded-xl text-sm outline-none font-mono"
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-black/40 uppercase tracking-wider ml-1">Cost (TZS)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-4 py-2 bg-black/5 border-none rounded-xl text-sm outline-none font-mono"
                    value={newProduct.cost}
                    onChange={e => setNewProduct({...newProduct, cost: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="pt-6 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddingProduct(false)}
                  className="flex-1 py-3 bg-black/5 hover:bg-black/10 text-black font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
                >
                  Save Product
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}


import { useState, useEffect, FormEvent } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  MoreVertical, 
  Package, 
  AlertTriangle,
  ArrowRightLeft,
  History,
  Minus
} from "lucide-react";
import { Product } from "../types";
import { formatCurrency, cn } from "../lib/utils";
import { motion } from "motion/react";

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [isAddingProduct, setIsAddingProduct] = useState(false);
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
  }, []);

  const fetchProducts = () => {
    fetch("/api/products", {
      headers: { "x-user-id": currentUser.id }
    })
      .then(res => res.json())
      .then(data => setProducts(data));
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

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory Management</h2>
          <p className="text-black/40 text-sm">Track stock levels, transfers, and product catalog.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-black/5 rounded-xl text-sm font-bold hover:bg-black/5 transition-colors">
            <ArrowRightLeft className="w-4 h-4" />
            Stock Transfer
          </button>
          <button 
            onClick={() => setIsAddingProduct(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-black/40 uppercase tracking-wider">Total SKUs</p>
            <p className="text-xl font-bold">{products.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-black/40 uppercase tracking-wider">Low Stock Items</p>
            <p className="text-xl font-bold">4</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <History className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-black/40 uppercase tracking-wider">Recent Movements</p>
            <p className="text-xl font-bold">12 today</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-black/5 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
            <input 
              type="text" 
              placeholder="Search by name, SKU, or category..." 
              className="w-full pl-10 pr-4 py-2 bg-black/5 border-none rounded-xl text-sm outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl hover:bg-black/5 text-black/40">
              <Filter className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-xl hover:bg-black/5 text-black/40">
              <ArrowUpDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/[0.02] border-b border-black/5">
                <th className="px-6 py-4 text-[10px] font-bold text-black/40 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-[10px] font-bold text-black/40 uppercase tracking-wider">SKU / Barcode</th>
                <th className="px-6 py-4 text-[10px] font-bold text-black/40 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold text-black/40 uppercase tracking-wider text-right">Stock Level</th>
                <th className="px-6 py-4 text-[10px] font-bold text-black/40 uppercase tracking-wider text-right">Unit Price</th>
                <th className="px-6 py-4 text-[10px] font-bold text-black/40 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-black/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-black/20" />
                      </div>
                      <span className="text-sm font-bold">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-xs font-mono font-medium">{product.sku}</p>
                      <p className="text-[10px] text-black/30 font-mono">{product.barcode}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-lg bg-black/5 text-[10px] font-bold uppercase tracking-wider text-black/60">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-bold">124 {product.unit}</span>
                      <div className="w-24 h-1.5 bg-black/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-3/4" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-emerald-600">{formatCurrency(product.price)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-lg hover:bg-black/5 text-black/20 hover:text-black transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
  </div>
);
}

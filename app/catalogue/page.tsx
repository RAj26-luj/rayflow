'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Sparkles,
  Plus,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowRight,
  Layers,
  Edit2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Product } from '@/lib/types';
import { formatINR } from '@/lib/utils';

export default function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<'Footwear' | 'Apparel' | 'Accessories' | 'Fitness Tech' | 'Hydration'>('Accessories');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data?.products || (Array.isArray(data.data) ? data.data : []));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProdName,
          price: Number(newProdPrice),
          category: newProdCategory,
          inventory: 40,
          conversionRate: 4.0,
          marginPercent: 65,
        }),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewProdName('');
        setNewProdPrice('');
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    if (category === 'ALL') return matchesSearch;
    return matchesSearch && p.category === category;
  });

  return (
    <DashboardLayout>
      <div className="space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
              <Package className="h-3.5 w-3.5" />
              Catalogue & Affinity Graph
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Merchant Catalogue & Inventory
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live products, margins, stock levels, and automated AI bundle associations.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name or tag..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-medium">Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 sm:flex-none rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Footwear">Footwear</option>
              <option value="Accessories">Accessories</option>
              <option value="Apparel">Apparel</option>
              <option value="Fitness Tech">Fitness Tech</option>
              <option value="Hydration">Hydration</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs space-y-3">
            <Package className="h-10 w-10 mx-auto text-slate-300" />
            <div className="font-semibold text-slate-800 text-sm">No Products Found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your merchant catalogue has no products matching this criteria. Add products to activate AI bundle pairing and buyer storefront checkout.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Your First Product</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image & Category Pill */}
                <div className="h-40 sm:h-44 w-full relative bg-slate-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="rounded-full bg-slate-900/80 backdrop-blur text-white text-[9px] sm:text-[10px] font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1">
                      {prod.category}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span className="rounded-full bg-white/90 backdrop-blur text-slate-800 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 border border-slate-200">
                      Stock: {prod.inventory}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-3.5 sm:p-4 space-y-2.5 sm:space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{prod.name}</h3>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="font-bold text-slate-900 text-sm">{formatINR(prod.price)}</div>
                        {prod.compareAtPrice && (
                          <div className="text-[10px] text-slate-400 line-through">
                            {formatINR(prod.compareAtPrice)}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-400">Conversion Rate</div>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {prod.conversionRate}%
                        {prod.conversionRate < 3 && (
                          <span className="ml-1 text-[10px] text-amber-600 font-semibold">(Low)</span>
                        )}
                      </div>
                    </div>

                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-400">Gross Margin</div>
                      <div className="font-bold text-emerald-700 mt-0.5">{prod.marginPercent}%</div>
                    </div>
                  </div>

                  {/* AI Bundling Insights */}
                  {prod.complementaryProductIds && prod.complementaryProductIds.length > 0 && (
                    <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-2.5 text-[11px] text-blue-900 space-y-1">
                      <div className="font-semibold flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-blue-600" />
                        AI Affinity Pairing:
                      </div>
                      <div className="text-slate-600 text-[10px]">
                        High co-purchase correlation with complementary items (61% affinity).
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-3.5 sm:p-4 pt-0">
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>SKU: {prod.sku}</span>
                  <span className="text-blue-600 font-sans font-semibold">Active in Agent</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Add Product Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="w-full max-w-md bg-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-900">Add New Catalogue Item</h3>
              <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-600 font-medium">Product Name</label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="e.g. Ultra Carbon Pace Shoes"
                    className="w-full mt-1 rounded-lg border border-slate-300 p-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-medium">Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="e.g. 5499"
                    className="w-full mt-1 rounded-lg border border-slate-300 p-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-medium">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e: any) => setNewProdCategory(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-300 p-2 text-slate-900"
                  >
                    <option value="Footwear">Footwear</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Fitness Tech">Fitness Tech</option>
                    <option value="Hydration">Hydration</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="rounded-lg border border-slate-200 px-3 py-2 font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

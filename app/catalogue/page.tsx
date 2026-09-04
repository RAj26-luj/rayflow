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
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Product } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { PageShell, SectionHeader } from '@/components/ui/SectionHeader';
import { ActionButton, SecondaryButton, GhostButton } from '@/components/ui/Button';
import { CategoryBadge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState, LoadingState } from '@/components/ui/Feedback';

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
      <PageShell>
        {/* Header */}
        <SectionHeader
          title="Catalogue"
          description="Manage products, unit margins, inventory stock, and product categories."
          badge={{ text: 'Inventory Active', variant: 'blue' }}
          action={
            <ActionButton
              onClick={() => setIsAddModalOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Product
            </ActionButton>
          }
        />

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by title, tag, or SKU..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none cursor-pointer"
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
        {loading && products.length === 0 ? (
          <LoadingState message="Loading merchant catalogue..." />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            title="No Products Found"
            description="Your merchant catalogue has no products matching this criteria. Add products to activate AI bundle pairing and buyer storefront checkout."
            action={{
              label: 'Add Your First Product',
              onClick: () => setIsAddModalOpen(true),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((prod) => (
              <motion.div
                key={prod.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="group rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs hover:border-blue-300 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image & Category Pill */}
                  <div className="h-44 sm:h-48 w-full relative bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="rounded-xl bg-slate-900/80 backdrop-blur text-white text-[10px] font-semibold px-2.5 py-1 uppercase tracking-wider">
                        {prod.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="rounded-xl bg-white/90 backdrop-blur text-slate-800 text-[10px] font-extrabold px-2.5 py-1 border border-slate-200 shadow-2xs">
                        Stock: {prod.inventory}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors line-clamp-1">
                          {prod.name}
                        </h3>
                        <div className="text-right flex-shrink-0">
                          <div className="font-extrabold text-slate-900 font-mono text-sm sm:text-base">
                            {formatINR(prod.price)}
                          </div>
                          {prod.compareAtPrice && (
                            <div className="text-[10px] text-slate-400 line-through font-mono">
                              {formatINR(prod.compareAtPrice)}
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] uppercase font-semibold text-slate-400">Conversion</div>
                        <div className="font-bold text-slate-900 mt-0.5">
                          {prod.conversionRate}%
                          {prod.conversionRate < 3 && (
                            <span className="ml-1 text-[10px] text-amber-600 font-bold">(Low)</span>
                          )}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] uppercase font-semibold text-slate-400">Gross Margin</div>
                        <div className="font-extrabold text-emerald-700 font-mono mt-0.5">{prod.marginPercent}%</div>
                      </div>
                    </div>

                    {/* AI Bundling Insights */}
                    {prod.complementaryProductIds && prod.complementaryProductIds.length > 0 && (
                      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3 text-[11px] text-blue-950 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-blue-700">
                          <Sparkles className="h-3.5 w-3.5" />
                          Affinity Bundling Active
                        </div>
                        <div className="text-slate-600 text-[10px]">
                          High co-purchase correlation with complementary items (61% affinity score).
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 sm:p-5 pt-0">
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>SKU: {prod.sku}</span>
                    <span className="text-emerald-700 font-sans font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      Active in Store
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Product Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Catalogue Product"
        >
          <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Product Name</label>
              <input
                type="text"
                required
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
                placeholder="e.g. Ultra Carbon Pace Shoes"
                className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-700 font-bold block mb-1">Price (INR)</label>
              <input
                type="number"
                required
                value={newProdPrice}
                onChange={(e) => setNewProdPrice(e.target.value)}
                placeholder="e.g. 5499"
                className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-700 font-bold block mb-1">Category</label>
              <select
                value={newProdCategory}
                onChange={(e: any) => setNewProdCategory(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 p-3 text-slate-900 text-xs focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="Footwear">Footwear</option>
                <option value="Accessories">Accessories</option>
                <option value="Apparel">Apparel</option>
                <option value="Fitness Tech">Fitness Tech</option>
                <option value="Hydration">Hydration</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <GhostButton type="button" onClick={() => setIsAddModalOpen(false)} size="sm">
                Cancel
              </GhostButton>
              <ActionButton type="submit" size="sm">
                Save Product
              </ActionButton>
            </div>
          </form>
        </Modal>
      </PageShell>
    </DashboardLayout>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Product } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { PageShell, SectionHeader } from '@/components/ui/SectionHeader';
import { ActionButton, SecondaryButton } from '@/components/ui/Button';
import { CategoryBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { LoadingState } from '@/components/ui/Feedback';

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
        <SectionHeader
          title="Catalogue"
          description="Manage products, unit margins, inventory stock, and product categories."
          badge="Store Inventory"
          badgeIcon={<Package className="h-3.5 w-3.5" />}
          actions={
            <ActionButton size="sm" onClick={() => setIsAddModalOpen(true)} icon={<Plus className="h-3.5 w-3.5" />}>
              Add Product
            </ActionButton>
          }
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by title or description..."
              className="w-full rounded border border-stone-300 bg-white pl-9 pr-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['ALL', 'Footwear', 'Apparel', 'Hydration', 'Recovery', 'Tech', 'Accessories'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                  category === cat
                    ? 'bg-brand-700 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingState message="Loading catalogue..." />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded border border-stone-200 p-6 space-y-2">
            <p className="text-stone-600 text-sm font-semibold">No products match your criteria.</p>
            <SecondaryButton size="sm" onClick={() => { setSearch(''); setCategory('ALL'); }}>
              Reset Filters
            </SecondaryButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => (
              <div key={p.id} className="rounded border border-stone-200 bg-white p-4 shadow-2xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="relative aspect-video w-full rounded overflow-hidden bg-stone-100 mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                    <CategoryBadge category={p.category} className="absolute top-2 left-2" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-stone-900 text-sm">{p.name}</h3>
                    <p className="text-xs text-stone-500 line-clamp-2">{p.description}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-xs text-center">
                    <div className="p-1.5 rounded bg-stone-50 border border-stone-100">
                      <div className="text-[10px] text-stone-400">Price</div>
                      <div className="font-bold text-stone-900">{formatINR(p.price)}</div>
                    </div>
                    <div className="p-1.5 rounded bg-stone-50 border border-stone-100">
                      <div className="text-[10px] text-stone-400">Margin</div>
                      <div className="font-bold text-emerald-800">{p.marginPercent}%</div>
                    </div>
                    <div className="p-1.5 rounded bg-stone-50 border border-stone-100">
                      <div className="text-[10px] text-stone-400">Stock</div>
                      <div className="font-bold text-stone-900">{p.inventory}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                    <span>SKU: {p.sku}</span>
                    <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                      <CheckCircle2 className="h-3 w-3" />
                      Active
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageShell>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Product to Catalogue">
        <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-stone-700 block mb-1">Product Title</label>
            <input
              type="text"
              required
              value={newProdName}
              onChange={(e) => setNewProdName(e.target.value)}
              placeholder="e.g. SpeedPro Carbon Racing Shoes"
              className="w-full rounded border border-stone-300 p-2 text-stone-900 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Price (INR)</label>
              <input
                type="number"
                required
                value={newProdPrice}
                onChange={(e) => setNewProdPrice(e.target.value)}
                placeholder="4999"
                className="w-full rounded border border-stone-300 p-2 text-stone-900 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Category</label>
              <select
                value={newProdCategory}
                onChange={(e) => setNewProdCategory(e.target.value as any)}
                className="w-full rounded border border-stone-300 p-2 text-stone-900 focus:outline-none focus:border-brand-500"
              >
                <option value="Footwear">Footwear</option>
                <option value="Apparel">Apparel</option>
                <option value="Accessories">Accessories</option>
                <option value="Fitness Tech">Fitness Tech</option>
                <option value="Hydration">Hydration</option>
              </select>
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <SecondaryButton size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </SecondaryButton>
            <ActionButton type="submit" size="sm">
              Save Product
            </ActionButton>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

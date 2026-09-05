'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Sparkles,
  Search,
  Star,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  X,
  Lock,
  ArrowRight,
  Send,
  SlidersHorizontal,
  Bot,
  Package,
  Check,
} from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { CustomerNavbar } from '@/components/layout/CustomerNavbar';
import { RazorpayTestModal } from '@/components/payment/RazorpayTestModal';
import { Badge, Button, Modal, CategoryRail, PromoBanner, ProductCard } from '@/components/ui';
import { Product, Order } from '@/lib/types';
import { formatINR } from '@/lib/utils';

interface CartItem {
  product: Product;
  quantity: number;
}

interface BuyerMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: Product[];
  recommendedBundle?: {
    items: Product[];
    originalPrice: number;
    bundlePrice: number;
    savingsAmount: number;
    discountPercent: number;
    reason: string;
  };
  suggestedReplies?: string[];
  timestamp: string;
}

export default function ShopPage() {
  const { data: session } = useSession();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedMerchant, setSelectedMerchant] = useState('ALL');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);
  const [messages, setMessages] = useState<BuyerMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content:
        "Hello! I'm your **Shopping Assistant**.\n\nTell me what you're looking for (e.g., *\"Running shoes under ₹6,000\"* or *\"Hydration and activewear bundle\"*) and I'll find matching gear with instant bundle discounts.",
      suggestedReplies: [
        'Running shoes under ₹6,000',
        'Hydration flask and socks bundle',
        'Top-rated marathon gear',
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [paidSuccessOrder, setPaidSuccessOrder] = useState<Order | null>(null);
  const [paymentFailError, setPaymentFailError] = useState<string | null>(null);

  const FALLBACK_PRODUCTS: Product[] = [
    {
      id: 'prd_aura_001',
      name: 'Velocity Carbon Running Shoes',
      sku: 'AUR-FTW-001',
      description: 'Lightweight carbon-plated racing shoes engineered for speed and marathon efficiency.',
      price: 4999,
      compareAtPrice: 5999,
      category: 'Footwear',
      inventory: 45,
      conversionRate: 4.8,
      marginPercent: 68,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
      complementaryProductIds: ['prd_aura_006', 'prd_aura_003'],
      tags: ['racing', 'marathon', 'carbon-plate'],
    },
    {
      id: 'prd_aura_002',
      name: 'AeroDry Performance Singlet',
      sku: 'AUR-APP-002',
      description: 'Ultra-breathable moisture-wicking singlet designed for high-heat training sessions.',
      price: 1299,
      compareAtPrice: 1699,
      category: 'Apparel',
      inventory: 80,
      conversionRate: 3.5,
      marginPercent: 72,
      image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80',
      tags: ['apparel', 'singlet', 'aerodry'],
    },
    {
      id: 'prd_aura_003',
      name: 'HydroMax 750ml Insulated Flask',
      sku: 'AUR-ACC-003',
      description: 'Double-wall vacuum insulated stainless steel flask keeping fluids cold for 24 hours.',
      price: 899,
      compareAtPrice: 1199,
      category: 'Hydration',
      inventory: 120,
      conversionRate: 5.2,
      marginPercent: 65,
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
      tags: ['hydration', 'flask', 'insulated'],
    },
    {
      id: 'prd_aura_004',
      name: 'ProPulse Massage Roller',
      sku: 'AUR-REC-004',
      description: 'High-density grid muscle foam roller for targeted myofascial release & recovery.',
      price: 1499,
      compareAtPrice: 1999,
      category: 'Recovery',
      inventory: 35,
      conversionRate: 2.9,
      marginPercent: 70,
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
      tags: ['recovery', 'roller', 'massage'],
    },
    {
      id: 'prd_aura_005',
      name: 'PaceTrack GPS Smartwatch',
      sku: 'AUR-TCH-005',
      description: 'Multisport GPS watch featuring real-time heart rate, VO2 max estimation & route tracking.',
      price: 8999,
      compareAtPrice: 10999,
      category: 'Tech',
      inventory: 20,
      conversionRate: 4.1,
      marginPercent: 55,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      tags: ['tech', 'gps', 'smartwatch'],
    },
    {
      id: 'prd_aura_006',
      name: 'Anti-Blister Cushioned Socks (3-Pack)',
      sku: 'AUR-ACC-006',
      description: 'Anatomical left/right fit running socks with targeted arch support and heel padding.',
      price: 499,
      compareAtPrice: 699,
      category: 'Accessories',
      inventory: 200,
      conversionRate: 6.8,
      marginPercent: 80,
      image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=600&q=80',
      tags: ['socks', 'anti-blister', 'running'],
    },
  ];

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && data.data?.products && data.data.products.length > 0) {
        setProducts(data.data.products);
      } else {
        setProducts(FALLBACK_PRODUCTS);
      }
    } catch {
      setProducts(FALLBACK_PRODUCTS);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (session?.user) {
      if (session.user.name) setBuyerName(session.user.name);
      if (session.user.email) setBuyerEmail(session.user.email);
    }
  }, [session]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAiCopilotOpen) setIsAiCopilotOpen(false);
        if (isCartOpen) setIsCartOpen(false);
        if (isAuthModalOpen) setIsAuthModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAiCopilotOpen, isCartOpen, isAuthModalOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added "${product.name}" to cart.`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const isBundleEligible = cart.length >= 2;
  const bundleSavings = isBundleEligible ? Number((cartSubtotal * 0.1).toFixed(2)) : 0;
  const cartFinalTotal = cartSubtotal - bundleSavings;

  const addBundleToCart = (bundle: { items: Product[]; bundlePrice: number; savingsAmount: number }) => {
    bundle.items.forEach((p) => addToCart(p, 1));
    setIsCartOpen(true);
    showToast(`Added ${bundle.items.length}-item bundle to cart with ₹${bundle.savingsAmount} savings!`);
  };

  const handleSendAiMessage = async (queryText?: string) => {
    const query = (queryText || aiInput).trim();
    if (!query || aiLoading) return;

    const userMsg: BuyerMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setAiInput('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/agent/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          type: 'buyer',
          ...(selectedMerchant !== 'ALL' ? { merchantSlug: selectedMerchant } : {}),
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const assistantMsg: BuyerMessage = {
          id: `ast_${Date.now()}`,
          role: 'assistant',
          content: data.data.message,
          products: data.data.products,
          recommendedBundle: data.data.recommendedBundle,
          suggestedReplies: data.data.suggestedReplies,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        if (data.data.autoAction?.type === 'ADD_BUNDLE' && data.data.recommendedBundle) {
          addBundleToCart(data.data.recommendedBundle);
          setIsCartOpen(true);
        } else if (data.data.autoAction?.type === 'ADD_PRODUCT' && data.data.autoAction?.product) {
          addToCart(data.data.autoAction.product, 1);
          setIsCartOpen(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleProceedToCheckout = async (
    directProduct?: Product,
    overrideCustomer?: { name?: string; email?: string }
  ) => {
    const itemsToOrder = directProduct
      ? [{ product: directProduct, quantity: 1 }]
      : cart;

    if (itemsToOrder.length === 0) return;

    const email = (overrideCustomer?.email || buyerEmail || session?.user?.email || 'customer@example.com').trim();
    const name = (overrideCustomer?.name || buyerName || session?.user?.name || 'Valued Customer').trim();

    if (!session?.user && !email) {
      setIsAuthModalOpen(true);
      return;
    }

    setOrderSubmitting(true);
    setPaymentFailError(null);

    const discount = directProduct ? 0 : bundleSavings;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsToOrder.map((it) => ({
            productId: it.product.id,
            quantity: it.quantity,
          })),
          discountAmount: discount,
          isBundle: itemsToOrder.length >= 2,
          bundleSavings: discount,
          customerDetails: {
            name,
            email,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.order) {
        setActiveOrder(data.data.order);
        setIsCartOpen(false);
        setIsAuthModalOpen(false);
        setIsPayModalOpen(true);
      } else {
        setPaymentFailError(data.error || 'Could not create order.');
      }
    } catch (err) {
      console.error(err);
      setPaymentFailError('Failed to connect to checkout service.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  const handleInlineCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (authMode === 'signup') {
        const res = await fetch('/api/customer/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: authName,
            email: authEmail,
            password: authPassword,
          }),
        });
        const data = await res.json();
        if (!data.success) {
          setAuthError(data.error || 'Failed to create customer account.');
          setAuthLoading(false);
          return;
        }
      }

      const result = await signIn('credentials', {
        redirect: false,
        email: authEmail,
        password: authPassword,
        userType: 'customer',
      });

      if (result?.error) {
        setAuthError('Invalid credentials. Please try again.');
      } else {
        setBuyerName(authName || authEmail.split('@')[0]);
        setBuyerEmail(authEmail);
        setIsAuthModalOpen(false);
        handleProceedToCheckout(undefined, { name: authName, email: authEmail });
      }
    } catch (err) {
      console.error(err);
      setAuthError('Authentication error.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleInlineDemoCustomer = async () => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const demoEmail = 'priya@example.com';
      const demoPass = 'demo123';
      const result = await signIn('credentials', {
        redirect: false,
        email: demoEmail,
        password: demoPass,
        userType: 'customer',
      });

      if (!result?.error) {
        setBuyerName('Priya Sharma');
        setBuyerEmail(demoEmail);
        setIsAuthModalOpen(false);
        handleProceedToCheckout(undefined, { name: 'Priya Sharma', email: demoEmail });
      } else {
        setBuyerName('Priya Sharma');
        setBuyerEmail(demoEmail);
        setIsAuthModalOpen(false);
        handleProceedToCheckout(undefined, { name: 'Priya Sharma', email: demoEmail });
      }
    } catch (err) {
      console.error(err);
      setBuyerName('Priya Sharma');
      setBuyerEmail('priya@example.com');
      setIsAuthModalOpen(false);
      handleProceedToCheckout(undefined, { name: 'Priya Sharma', email: 'priya@example.com' });
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePaymentSuccess = (paidOrder: Order) => {
    setActiveOrder(paidOrder);
    setPaidSuccessOrder(paidOrder);
    setIsPayModalOpen(false);
    clearCart();
  };

  const handlePaymentFailure = (errorMsg: string) => {
    setPaymentFailError(errorMsg);
  };

  const categories = ['ALL', 'Footwear', 'Apparel', 'Hydration', 'Recovery', 'Tech', 'Accessories'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col selection:bg-violet-900 selection:text-white relative">
      <CustomerNavbar cartCount={totalCartCount} onOpenCart={() => setIsCartOpen(true)} />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-zinc-900/95 text-white px-4 py-3 text-xs font-semibold shadow-2xl backdrop-blur-2xl flex items-center gap-2.5 border border-zinc-700/80 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {paidSuccessOrder && (
        <div className="bg-emerald-950/90 border-b border-emerald-800 text-emerald-200 px-4 py-3 text-center text-xs font-semibold flex items-center justify-center gap-2 backdrop-blur-md">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>
            Payment Received! Order <strong>#{paidSuccessOrder.orderNumber}</strong> ({formatINR(paidSuccessOrder.totalAmount)}) captured via Razorpay.
          </span>
          <button
            onClick={() => setPaidSuccessOrder(null)}
            className="ml-4 underline text-[11px] text-emerald-300 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner & Search Bar */}
      <div className="bg-zinc-900/90 text-white px-4 sm:px-6 py-8 sm:py-10 border-b border-zinc-800/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-violet-300 bg-violet-950/80 px-3 py-1 rounded-full border border-violet-800/60 shadow-xs">
                Store
              </span>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mt-2.5">
                All Products
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mt-1 leading-relaxed">
                Find products and save on bundles.
              </p>
            </div>

            <div className="w-full md:w-auto min-w-[320px]">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/80 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Category Rail Selector */}
          <CategoryRail selectedCategory={selectedCategory} onSelectCategory={(cat: string) => setSelectedCategory(cat)} />

          <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
            <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium flex-shrink-0">
              <SlidersHorizontal className="h-3.5 w-3.5 text-violet-400" />
              Filter:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-md shadow-violet-950/50'
                    : 'bg-zinc-950/80 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Promotional Hero Banner */}
        <PromoBanner />

        <div className="flex items-center justify-between pt-4">
          <div className="text-xs text-zinc-400">
            Showing <strong className="text-white font-bold">{filteredProducts.length}</strong> products
          </div>
          <button
            onClick={() => setIsAiCopilotOpen(true)}
            className="flex items-center gap-2 text-xs font-bold text-violet-300 bg-violet-950/80 border border-violet-800/60 px-3.5 py-1.5 rounded-full hover:bg-violet-900/80 transition-all shadow-xs"
          >
            <Bot className="h-4 w-4 text-violet-400" />
            <span>Open Shopping Assistant</span>
          </button>
        </div>

        {/* 2-Column Mobile & Multi-Column Desktop Product Grid */}
        {loadingProducts ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-72 rounded-2xl bg-zinc-900/60 border border-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/80 rounded-3xl border border-zinc-800 p-8 space-y-3">
            <p className="text-zinc-300 text-sm font-semibold">No products found matching &quot;{searchQuery}&quot;</p>
            <Button variant="secondary" size="sm" onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }} className="bg-zinc-800 border-zinc-700 text-zinc-200">
              Clear Search Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(p) => addToCart(p, 1)}
                onBuyNow={(p) => {
                  addToCart(p, 1);
                  setIsCartOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Cart Slide-Over Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-900/95 text-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200 border-l border-zinc-800 backdrop-blur-2xl">
            <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between sticky top-0 bg-zinc-900/95 backdrop-blur-xl z-10">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-5 w-5 text-violet-400" />
                <h2 className="font-bold text-white text-base">Your Cart ({totalCartCount})</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-xl hover:bg-zinc-800 transition-colors"
                aria-label="Close Cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-zinc-400 text-xs space-y-3">
                  <p>Your cart is empty.</p>
                  <Button variant="secondary" size="sm" onClick={() => setIsCartOpen(false)} className="bg-zinc-800 border-zinc-700 text-zinc-200">
                    Browse Gear
                  </Button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 text-xs">
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="font-bold text-white truncate">{item.product.name}</div>
                      <div className="text-violet-300 font-mono mt-0.5">{formatINR(item.product.price)}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-bold text-white px-1.5">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="rounded-lg p-1 text-rose-400 hover:bg-rose-950/40 ml-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-zinc-800/80 bg-zinc-950/90 space-y-3.5">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span className="font-mono text-zinc-200">{formatINR(cartSubtotal)}</span>
                  </div>
                  {isBundleEligible && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Bundle Savings (10%)</span>
                      <span className="font-mono">-{formatINR(bundleSavings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-zinc-800/80">
                    <span>Total</span>
                    <span className="font-mono text-violet-300">{formatINR(cartFinalTotal)}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => handleProceedToCheckout()}
                  isLoading={orderSubmitting}
                >
                  Proceed to Razorpay Checkout
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shopping Assistant Side Drawer */}
      {isAiCopilotOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-zinc-900/95 text-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200 border-l border-zinc-800 backdrop-blur-2xl">
            <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between sticky top-0 bg-zinc-900/95 z-10">
              <div className="flex items-center gap-2.5">
                <Bot className="h-5 w-5 text-violet-400" />
                <div>
                  <h3 className="font-bold text-white text-sm">Shopping Assistant</h3>
                  <p className="text-[10px] text-zinc-400">Product recommendations & bundle offers</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiCopilotOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-xl hover:bg-zinc-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-3.5 flex-1 overflow-y-auto text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-md backdrop-blur-md ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-xs'
                        : 'bg-zinc-950/80 border border-zinc-800 text-zinc-200 rounded-bl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line space-y-1.5">{msg.content}</div>

                    {msg.products && (
                      <div className="mt-3 space-y-2">
                        {msg.products.map((p) => (
                          <div key={p.id} className="rounded-xl bg-zinc-900 p-2.5 flex items-center justify-between border border-zinc-800">
                            <div>
                              <div className="font-bold text-white text-xs">{p.name}</div>
                              <div className="text-[11px] text-emerald-400 font-mono">{formatINR(p.price)}</div>
                            </div>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                addToCart(p, 1);
                                setIsCartOpen(true);
                              }}
                            >
                              Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="text-xs text-zinc-400 italic">Thinking...</div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3.5 border-t border-zinc-800/80 bg-zinc-950/90 sticky bottom-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAiMessage();
                }}
                className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-1.5"
              >
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="How can I help?"
                  className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none"
                />
                <Button type="submit" variant="primary" size="sm" disabled={!aiInput.trim() || aiLoading}>
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Auth / Guest Checkout Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-900/95 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-white space-y-4 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3.5">
              <h3 className="font-bold text-white text-base">Sign In to Complete Purchase</h3>
              <button onClick={() => setIsAuthModalOpen(false)} className="text-zinc-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            {authError && (
              <div className="rounded-xl bg-rose-950/60 border border-rose-800 p-3 text-xs text-rose-300">
                {authError}
              </div>
            )}

            <div className="rounded-2xl bg-violet-950/60 border border-violet-800/60 p-4 space-y-2.5">
              <div className="font-bold text-xs text-violet-300">Demo Customer</div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Continue as <strong>Priya Sharma</strong> to test Razorpay checkout.
              </p>
              <Button variant="primary" size="sm" fullWidth onClick={handleInlineDemoCustomer} isLoading={authLoading}>
                Continue as Demo Customer
              </Button>
            </div>

            <form onSubmit={handleInlineCustomerLogin} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                />
              </div>
              <Button type="submit" variant="secondary" size="md" fullWidth isLoading={authLoading} className="bg-zinc-800 border-zinc-700 text-zinc-200">
                Sign In
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Razorpay Payment Modal */}
      <RazorpayTestModal
        order={activeOrder}
        isOpen={isPayModalOpen}
        storeName="RAYFLOW Storefront"
        onClose={() => setIsPayModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
      />
    </div>
  );
}

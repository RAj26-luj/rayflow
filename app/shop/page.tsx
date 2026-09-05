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
import { Badge, Button, Modal } from '@/components/ui';
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
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col selection:bg-amber-100 selection:text-amber-900">
      <CustomerNavbar cartCount={totalCartCount} onOpenCart={() => setIsCartOpen(true)} />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-md bg-stone-900 text-white px-4 py-2.5 text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {paidSuccessOrder && (
        <div className="bg-emerald-700 text-white px-4 py-3 text-center text-xs font-semibold flex items-center justify-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>
            Payment Received! Order <strong>#{paidSuccessOrder.orderNumber}</strong> ({formatINR(paidSuccessOrder.totalAmount)}) captured via Razorpay.
          </span>
          <button
            onClick={() => setPaidSuccessOrder(null)}
            className="ml-4 underline text-[11px] hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-stone-900 text-white px-4 sm:px-6 py-8 sm:py-10 border-b border-stone-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-950/80 px-2.5 py-1 rounded border border-brand-800">
                Verified Merchant Storefront
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
                Performance Gear & Equipment
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 max-w-xl mt-1 leading-relaxed">
                Discover running shoes, activewear, and recovery gear with automatic multi-item savings.
              </p>
            </div>

            <div className="w-full md:w-auto min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search shoes, hydration, socks..."
                  className="w-full rounded-md border border-stone-700 bg-stone-800 pl-9 pr-4 py-2 text-xs text-white placeholder:text-stone-400 focus:outline-none focus:border-brand-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
            <span className="text-xs text-stone-400 flex items-center gap-1 font-medium flex-shrink-0">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-md px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-brand-700 text-white'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-xs text-stone-500">
            Showing <strong className="text-stone-900">{filteredProducts.length}</strong> products
          </div>
          <button
            onClick={() => setIsAiCopilotOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800"
          >
            <Bot className="h-4 w-4" />
            <span>Open Shopping Assistant</span>
          </button>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-64 rounded-md bg-stone-200 animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-md border border-stone-200 p-6 space-y-2">
            <p className="text-stone-600 text-sm font-semibold">No products found matching &quot;{searchQuery}&quot;</p>
            <Button variant="secondary" size="sm" onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}>
              Clear Search Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProducts.map((product) => {
              const savingsPercent = product.compareAtPrice
                ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                : 0;

              return (
                <div
                  key={product.id}
                  className="group rounded-md border border-stone-200 bg-white p-4 shadow-2xs hover:border-stone-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-square w-full rounded-md overflow-hidden bg-stone-100 mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {savingsPercent > 0 && (
                        <span className="absolute top-2 left-2 rounded bg-brand-700 px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                          {savingsPercent}% OFF
                        </span>
                      )}
                      <span className="absolute top-2 right-2 rounded bg-stone-900/80 backdrop-blur px-2 py-0.5 text-[9px] font-semibold text-white uppercase">
                        {product.category}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-stone-900 text-sm line-clamp-1 group-hover:text-brand-700 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 mt-3 space-y-2.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-extrabold text-stone-900">
                        {formatINR(product.price)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-xs text-stone-400 line-through">
                          {formatINR(product.compareAtPrice)}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => addToCart(product)}
                        icon={<Plus className="h-3.5 w-3.5" />}
                      >
                        Add
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          addToCart(product);
                          setIsCartOpen(true);
                        }}
                      >
                        Buy Now
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-stone-950/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full shadow-xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-brand-700" />
                <h2 className="font-bold text-stone-900 text-base">Your Cart ({totalCartCount})</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
                aria-label="Close Cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-stone-500 text-xs space-y-2">
                  <p>Your cart is empty.</p>
                  <Button variant="secondary" size="sm" onClick={() => setIsCartOpen(false)}>
                    Browse Gear
                  </Button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between p-3 rounded bg-stone-50 border border-stone-200 text-xs">
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-bold text-stone-900 truncate">{item.product.name}</div>
                      <div className="text-stone-500">{formatINR(item.product.price)}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="rounded p-1 text-stone-500 hover:bg-stone-200"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-bold text-stone-900 px-1">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="rounded p-1 text-stone-500 hover:bg-stone-200"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="rounded p-1 text-red-600 hover:bg-red-50 ml-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal</span>
                    <span>{formatINR(cartSubtotal)}</span>
                  </div>
                  {isBundleEligible && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Bundle Savings (10%)</span>
                      <span>-{formatINR(bundleSavings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-1 border-t border-stone-200">
                    <span>Total</span>
                    <span>{formatINR(cartFinalTotal)}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => handleProceedToCheckout()}
                  isLoading={orderSubmitting}
                >
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {isAiCopilotOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-stone-950/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-stone-900 text-white h-full shadow-xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between sticky top-0 bg-stone-900 z-10">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-brand-400" />
                <div>
                  <h3 className="font-bold text-white text-sm">Shopping Assistant</h3>
                  <p className="text-[10px] text-stone-400">Product recommendations & bundle offers</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiCopilotOpen(false)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 flex-1 overflow-y-auto text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-md p-3 leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-brand-700 text-white'
                        : 'bg-stone-800 border border-stone-700 text-stone-200'
                    }`}
                  >
                    <div className="whitespace-pre-line space-y-1.5">{msg.content}</div>

                    {msg.products && (
                      <div className="mt-3 space-y-2">
                        {msg.products.map((p) => (
                          <div key={p.id} className="rounded bg-stone-950 p-2.5 flex items-center justify-between border border-stone-800">
                            <div>
                              <div className="font-bold text-white text-xs">{p.name}</div>
                              <div className="text-[11px] text-emerald-400">{formatINR(p.price)}</div>
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
                <div className="text-xs text-stone-400 italic">Thinking...</div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 border-t border-stone-800 bg-stone-900 sticky bottom-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAiMessage();
                }}
                className="flex items-center gap-2 rounded border border-stone-700 bg-stone-800 p-1"
              >
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask Shopping Assistant..."
                  className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder:text-stone-500 focus:outline-none"
                />
                <Button type="submit" variant="primary" size="sm" disabled={!aiInput.trim() || aiLoading}>
                  <Send className="h-3 w-3" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-md p-6 shadow-xl text-stone-900 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-bold text-stone-900 text-base">Sign In to Complete Purchase</h3>
              <button onClick={() => setIsAuthModalOpen(false)} className="text-stone-400 hover:text-stone-600 text-sm">
                ✕
              </button>
            </div>

            {authError && (
              <div className="rounded bg-red-50 border border-red-200 p-2.5 text-xs text-red-700">
                {authError}
              </div>
            )}

            <div className="rounded bg-brand-50 border border-brand-200 p-3 space-y-2">
              <div className="font-bold text-xs text-brand-900">Demo Customer</div>
              <p className="text-[11px] text-stone-600">
                Continue as <strong>Priya Sharma</strong> to test checkout.
              </p>
              <Button variant="primary" size="sm" fullWidth onClick={handleInlineDemoCustomer} isLoading={authLoading}>
                Continue as Demo Customer
              </Button>
            </div>

            <form onSubmit={handleInlineCustomerLogin} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full rounded border border-stone-300 p-2 text-stone-900 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full rounded border border-stone-300 p-2 text-stone-900 focus:outline-none focus:border-brand-500"
                />
              </div>
              <Button type="submit" variant="secondary" size="md" fullWidth isLoading={authLoading}>
                Sign In
              </Button>
            </form>
          </div>
        </div>
      )}

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

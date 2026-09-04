'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Sparkles,
  Search,
  Tag,
  Star,
  ShieldCheck,
  Zap,
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

export default function AmazonStyleShopPage() {
  const { data: session } = useSession();

  // State: Products Catalogue
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // State: Shopping Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // State: AI Shopping Copilot
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);
  const [messages, setMessages] = useState<BuyerMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content:
        "Hello! I'm your **Shopping Assistant**.\n\nTell me what you're looking for (e.g., *\"Running shoes for marathon training under ₹6,000\"* or *\"Hydration and activewear bundle\"*) and I'll find matching gear with verified bundle discounts.",
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

  // State: Checkout & Payment
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
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
      description: 'Ultra-lightweight carbon-plated racing shoes engineered for marathon efficiency and speed.',
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
      name: 'AeroDry Seamless Performance Singlet',
      sku: 'AUR-APP-002',
      description: 'High-wicking, anti-chafing competition singlet designed for peak airflow during long runs.',
      price: 1499,
      compareAtPrice: 1899,
      category: 'Apparel',
      inventory: 120,
      conversionRate: 6.2,
      marginPercent: 74,
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
      complementaryProductIds: ['prd_aura_005'],
      tags: ['singlet', 'breathable', 'apparel'],
    },
    {
      id: 'prd_aura_003',
      name: 'HydroFlow 750ml Insulated Flask',
      sku: 'AUR-HYD-003',
      description: 'Double-wall vacuum insulated athletic flask with one-click quick-hydration spout.',
      price: 899,
      compareAtPrice: 1199,
      category: 'Hydration',
      inventory: 85,
      conversionRate: 8.5,
      marginPercent: 65,
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
      complementaryProductIds: ['prd_aura_001'],
      tags: ['bottle', 'hydration', 'insulated'],
    },
    {
      id: 'prd_aura_004',
      name: 'ProRecovery High-Density Foam Roller',
      sku: 'AUR-REC-004',
      description: 'Targeted deep-tissue myofascial release roller for pre-run activation and post-run recovery.',
      price: 1299,
      compareAtPrice: 1699,
      category: 'Accessories',
      inventory: 60,
      conversionRate: 5.1,
      marginPercent: 70,
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
      complementaryProductIds: ['prd_aura_006'],
      tags: ['roller', 'recovery', 'mobility'],
    },
    {
      id: 'prd_aura_005',
      name: 'Strata Compression Running Shorts',
      sku: 'AUR-APP-005',
      description: 'Dual-layer anti-chafing compression shorts with zippered rear phone pocket.',
      price: 1899,
      compareAtPrice: 2299,
      category: 'Apparel',
      inventory: 95,
      conversionRate: 7.0,
      marginPercent: 72,
      image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80',
      complementaryProductIds: ['prd_aura_002'],
      tags: ['shorts', 'compression', 'running'],
    },
    {
      id: 'prd_aura_006',
      name: 'GripLock Anti-Blister Running Socks (3-Pack)',
      sku: 'AUR-ACC-006',
      description: 'Seamless toe construction with anatomical arch compression bands.',
      price: 699,
      compareAtPrice: 899,
      category: 'Accessories',
      inventory: 200,
      conversionRate: 11.4,
      marginPercent: 80,
      image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=600&q=80',
      complementaryProductIds: ['prd_aura_001'],
      tags: ['socks', 'anti-blister', 'running'],
    },
  ];

  // Load products from real database API
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

  // Sync buyer details from authenticated session
  useEffect(() => {
    if (session?.user) {
      if (session.user.name) setBuyerName(session.user.name);
      if (session.user.email) setBuyerEmail(session.user.email);
    }
  }, [session]);

  // Keyboard Escape listener for drawers and modals
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

  // Cart Operations
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

  // Bundle savings calculation (10% bundle discount for 2+ items)
  const isBundleEligible = cart.length >= 2;
  const bundleSavings = isBundleEligible ? Number((cartSubtotal * 0.1).toFixed(2)) : 0;
  const cartFinalTotal = cartSubtotal - bundleSavings;

  // Add Entire AI Bundle
  const addBundleToCart = (bundle: { items: Product[]; bundlePrice: number; savingsAmount: number }) => {
    bundle.items.forEach((p) => addToCart(p, 1));
    setIsCartOpen(true);
    showToast(`Added ${bundle.items.length}-item bundle to cart with ₹${bundle.savingsAmount} savings!`);
  };

  // AI Copilot Query
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
        body: JSON.stringify({ prompt: query, type: 'buyer' }),
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

  // Handle Checkout Process
  const handleProceedToCheckout = async (
    directProduct?: Product,
    overrideCustomer?: { name?: string; email?: string }
  ) => {
    const itemsToOrder = directProduct
      ? [{ product: directProduct, quantity: 1 }]
      : cart;

    if (itemsToOrder.length === 0) return;

    const email = overrideCustomer?.email || buyerEmail || session?.user?.email;
    const name = overrideCustomer?.name || buyerName || session?.user?.name || 'Valued Customer';

    // Zero-Cart-Loss Auth Gate: Prompt sign-in if guest
    if (!session?.user && !email?.trim()) {
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
            name: name.trim(),
            email: (email || 'customer@example.com').trim(),
            phone: buyerPhone.trim() || '+919811234567',
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
        setPaymentFailError(data.error?.message || 'Failed to create checkout order.');
      }
    } catch (err: any) {
      setPaymentFailError(err.message || 'Network error during checkout.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  // 1-Click Demo Customer Checkout
  const handleInlineDemoCustomer = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: 'priya@auraathletics.com',
        password: 'demo123',
        userType: 'customer',
      });

      if (res?.error) {
        setAuthError('Demo customer login failed.');
      } else {
        setIsAuthModalOpen(false);
        setBuyerName('Priya Sharma');
        setBuyerEmail('priya@auraathletics.com');
        showToast('Signed in as Priya Sharma (Demo Customer).');
        handleProceedToCheckout(undefined, {
          name: 'Priya Sharma',
          email: 'priya@auraathletics.com',
        });
      }
    } catch {
      setAuthError('Failed to sign in as Demo Customer');
    } finally {
      setAuthLoading(false);
    }
  };

  // Regular Customer Sign in / Sign up
  const handleInlineCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === 'signup') {
        const signupRes = await fetch('/api/customer/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: authName,
            email: authEmail,
            password: authPassword,
          }),
        });
        const signupData = await signupRes.json();
        if (!signupRes.ok || !signupData.success) {
          setAuthError(signupData.error || 'Failed to register account');
          setAuthLoading(false);
          return;
        }
      }

      const res = await signIn('credentials', {
        redirect: false,
        email: authEmail,
        password: authPassword,
        userType: 'customer',
      });

      if (res?.error) {
        setAuthError('Invalid email or password.');
      } else {
        setIsAuthModalOpen(false);
        setBuyerEmail(authEmail);
        handleProceedToCheckout(undefined, {
          name: authName || 'Valued Customer',
          email: authEmail,
        });
      }
    } catch {
      setAuthError('Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    setIsPayModalOpen(false);
    setPaidSuccessOrder(paymentData.order);
    clearCart();
    showToast(`Order #${paymentData.order.orderNumber} confirmed!`);
  };

  const handlePaymentFailure = (errorData: any) => {
    setPaymentFailError(errorData.details || errorData.message || 'Payment authorization failed.');
  };

  // Filter products by category and search
  const categories = ['ALL', 'Footwear', 'Apparel', 'Hydration', 'Recovery', 'Tech', 'Accessories'];
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'ALL' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* 1. Customer Navigation Bar */}
      <CustomerNavbar cartCount={totalCartCount} onOpenCart={() => setIsCartOpen(true)} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 text-white px-4 py-3 text-xs font-semibold shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main E-Commerce Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-8">
        {/* Order Paid Success Banner */}
        {paidSuccessOrder && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 sm:p-6 shadow-2xs animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Order Confirmed: #{paidSuccessOrder.orderNumber}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Thank you, {paidSuccessOrder.customerName}! Payment of {formatINR(paidSuccessOrder.totalAmount)} was captured and verified via Razorpay Test Mode.
                  </p>
                </div>
              </div>
              <Link href="/customer/orders">
                <Button variant="primary" size="sm" icon={<ArrowRight className="h-4 w-4" />}>
                  View in Order History
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* 2. Premium Hero Banner with Assistant Trigger */}
        <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-4 sm:p-8 text-white shadow-xl overflow-hidden border border-slate-800">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-[11px] font-bold text-blue-300 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              Smart Performance Gear & Bundles
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Curated Athletics with Instant Bundle Discounts
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Discover marathon footwear, compression apparel, and endurance recovery gear. Use our Shopping Assistant to build personalized gear bundles with verified merchant discounts.
            </p>

            {/* Interactive Search Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 max-w-xl">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search running shoes, hydration bottles, singlets..."
                  className="w-full rounded-xl bg-white/10 border border-white/20 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all backdrop-blur"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsAiCopilotOpen(true)}
                className="w-full sm:w-auto rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all flex items-center justify-center gap-2 flex-shrink-0"
              >
                <Bot className="h-4 w-4" />
                <span>Ask Assistant</span>
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
              <span className="text-slate-400">Popular queries:</span>
              {['Running Shoes under ₹6,000', 'Hydration Bottle', 'Recovery Roller', 'Marathon Bundle'].map(
                (term) => (
                  <button
                    key={term}
                    onClick={() => {
                      if (term.includes('Bundle') || term.includes('under')) {
                        setIsAiCopilotOpen(true);
                        handleSendAiMessage(term);
                      } else {
                        setSearchQuery(term);
                      }
                    }}
                    className="rounded-full bg-white/10 hover:bg-white/20 px-2.5 py-0.5 text-[10px] text-slate-200 transition-colors border border-white/10"
                  >
                    {term}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* 3. Category Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat === 'ALL' ? 'All Gear' : cat}
            </button>
          ))}
        </div>

        {/* 4. Featured Bundle Spotlight */}
        {selectedCategory === 'ALL' && products.length >= 2 && (
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-white p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                  <Tag className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Featured Synergy Bundle — Velocity Runner + Performance Socks
                  </h2>
                  <p className="text-xs text-slate-500">
                    High-affinity pairing • 15% Verified Multi-Item Discount
                  </p>
                </div>
              </div>
              <Badge variant="emerald" size="md">
                Save 15% Instant
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {products.slice(0, 2).map((prod) => (
                <div key={prod.id} className="rounded-xl border border-slate-200 bg-white p-3.5 flex items-center gap-3 shadow-2xs">
                  <div className="h-14 w-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={prod.image} alt={prod.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-xs truncate">{prod.name}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{formatINR(prod.price)}</div>
                  </div>
                </div>
              ))}
              <div className="rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 p-3.5 flex flex-col justify-center items-center text-center">
                <div className="text-[11px] text-slate-500">Bundle Combined Price:</div>
                <div className="text-base font-bold text-emerald-600">
                  {formatINR(
                    products.slice(0, 2).reduce((sum, p) => sum + p.price, 0) * 0.85
                  )}
                </div>
                <button
                  onClick={() =>
                    addBundleToCart({
                      items: products.slice(0, 2),
                      bundlePrice: products.slice(0, 2).reduce((sum, p) => sum + p.price, 0) * 0.85,
                      savingsAmount: products.slice(0, 2).reduce((sum, p) => sum + p.price, 0) * 0.15,
                    })
                  }
                  className="mt-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-indigo-700 transition-colors shadow-2xs"
                >
                  Add Bundle to Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. Product Grid with 3D Hover Lift */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Store Catalogue'}
            </h2>
            <span className="text-xs text-slate-500">{filteredProducts.length} items available</span>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-8">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="rounded-2xl border border-slate-200 bg-white p-4 h-72 animate-pulse space-y-3">
                  <div className="h-40 bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
              <ShoppingBag className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">No gear matched your search</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Try searching for a different keyword or ask our Shopping Assistant to configure alternative athletic gear.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => {
                const savingsPercent = product.compareAtPrice
                  ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                  : 0;

                return (
                  <div
                    key={product.id}
                    className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image & Badges */}
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 mb-3.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {savingsPercent > 0 && (
                          <span className="absolute top-2 left-2 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                            {savingsPercent}% OFF
                          </span>
                        )}
                        <span className="absolute top-2 right-2 rounded-md bg-slate-900/80 backdrop-blur px-2 py-0.5 text-[9px] font-semibold text-white uppercase tracking-wider">
                          {product.category}
                        </span>
                      </div>

                      {/* Product Details */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1 text-amber-500 text-[11px]">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-slate-800">4.9</span>
                          <span className="text-slate-400 text-[10px]">(128)</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="pt-3 border-t border-slate-100 mt-3 space-y-2.5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base sm:text-lg font-extrabold text-slate-900">
                          {formatINR(product.price)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatINR(product.compareAtPrice)}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => addToCart(product, 1)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors shadow-2xs flex items-center justify-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add</span>
                        </button>
                        <button
                          onClick={() => handleProceedToCheckout(product)}
                          className="w-full rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-2xs flex items-center justify-center gap-1"
                        >
                          <span>Buy Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* 6. Slide-Over Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            {/* Cart Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Your Cart ({totalCartCount})</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                aria-label="Close Cart"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-4 sm:p-5 space-y-3 flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <ShoppingBag className="h-12 w-12 mx-auto text-slate-300" />
                  <div className="font-semibold text-slate-800 text-sm">Your cart is empty</div>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Add performance gear from our catalogue or ask our Shopping Assistant for personalized running bundles.
                  </p>
                  <Button variant="primary" size="sm" onClick={() => setIsCartOpen(false)}>
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="rounded-xl border border-slate-200 bg-white p-3 flex items-center gap-3 shadow-2xs"
                  >
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 text-xs truncate">{item.product.name}</div>
                      <div className="text-xs font-semibold text-slate-700 mt-0.5">
                        {formatINR(item.product.price)}
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="p-1 text-slate-600 hover:text-slate-900"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-800">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="p-1 text-slate-600 hover:text-slate-900"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right font-bold text-slate-900 text-xs">
                      {formatINR(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3 sticky bottom-0">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Items Subtotal ({totalCartCount}):</span>
                    <span className="font-medium">{formatINR(cartSubtotal)}</span>
                  </div>
                  {bundleSavings > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Multi-Item Bundle Savings (10%):</span>
                      <span>-{formatINR(bundleSavings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-900 text-sm font-bold pt-1.5 border-t border-slate-200">
                    <span>Final Total:</span>
                    <span className="text-emerald-600">{formatINR(cartFinalTotal)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => handleProceedToCheckout()}
                    disabled={orderSubmitting}
                    loading={orderSubmitting}
                    icon={<CreditCard className="h-4 w-4" />}
                  >
                    Proceed to Checkout
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCartOpen(false)}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Shopping Assistant Drawer */}
      {isAiCopilotOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 text-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            {/* Assistant Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shadow-md">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Shopping Assistant</h3>
                  <p className="text-[10px] text-slate-400">Personalized Product Discovery & Bundle Savings</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiCopilotOpen(false)}
                aria-label="Close Assistant"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Assistant Chat Messages Stream */}
            <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs flex-shrink-0 mt-0.5">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-800 border border-slate-700 text-slate-200 shadow-md'
                    }`}
                  >
                    <div className="whitespace-pre-line space-y-2">{msg.content}</div>

                    {/* Copilot Product Recommendations */}
                    {msg.products && (
                      <div className="mt-3 space-y-2">
                        {msg.products.map((p) => (
                          <div
                            key={p.id}
                            className="rounded-xl border border-slate-700 bg-slate-950 p-2.5 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-white text-xs truncate">{p.name}</div>
                              <div className="text-[11px] text-emerald-400 font-semibold">{formatINR(p.price)}</div>
                            </div>
                            <button
                              onClick={() => {
                                addToCart(p, 1);
                                setIsCartOpen(true);
                                setMessages((prev) => [
                                  ...prev,
                                  {
                                    id: `sys_${Date.now()}`,
                                    role: 'assistant',
                                    content: `Done — I've added **${p.name}** (${formatINR(p.price)}) to your cart.`,
                                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                  },
                                ]);
                              }}
                              className="rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-500 transition-colors flex-shrink-0"
                            >
                              Add to Cart
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Copilot Recommended Bundle Card */}
                    {msg.recommendedBundle && (
                      <div className="mt-3 rounded-xl border border-indigo-500/40 bg-indigo-950/60 p-3 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-indigo-300 font-bold">
                          <span>Curated Bundle</span>
                          <span className="text-emerald-400">Save {formatINR(msg.recommendedBundle.savingsAmount)}</span>
                        </div>
                        <div className="text-xs font-bold text-white">
                          Bundle Price: {formatINR(msg.recommendedBundle.bundlePrice)}
                        </div>
                        <button
                          onClick={() => {
                            if (msg.recommendedBundle) {
                              addBundleToCart(msg.recommendedBundle);
                              setMessages((prev) => [
                                ...prev,
                                {
                                  id: `sys_${Date.now()}`,
                                  role: 'assistant',
                                  content: `Done — I've added the bundle (${msg.recommendedBundle?.items.map(i => i.name).join(' + ')}) to your cart. You saved ${formatINR(msg.recommendedBundle?.savingsAmount ?? 0)}.`,
                                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                },
                              ]);
                            }
                          }}
                          className="w-full rounded-lg bg-indigo-600 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors"
                        >
                          Add Full Bundle to Cart
                        </button>
                      </div>
                    )}

                    {/* Suggested Replies */}
                    {msg.suggestedReplies && (
                      <div className="mt-2.5 pt-2 border-t border-slate-700 flex flex-wrap gap-1.5">
                        {msg.suggestedReplies.map((reply, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendAiMessage(reply)}
                            className="rounded-full bg-slate-950 border border-slate-700 px-2.5 py-1 text-[10px] text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {aiLoading && (
                <div className="flex gap-2 items-center text-xs text-slate-400">
                  <Sparkles className="h-4 w-4 text-blue-400 animate-spin" />
                  <span>Finding matching gear and bundle offers...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Assistant Input Form */}
            <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900 sticky bottom-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAiMessage();
                }}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 p-1.5"
              >
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask Shopping Assistant (e.g. 'Build me a running bundle')..."
                  className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!aiInput.trim() || aiLoading}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-40 transition-colors"
                >
                  <Send className="h-3 w-3" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 8. Zero-Cart-Loss Guest Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl text-slate-900 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Sign In to Complete Purchase</h3>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600">
              Your cart ({totalCartCount} items — {formatINR(cartFinalTotal)}) is safely preserved.
            </div>

            {authError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                {authError}
              </div>
            )}

            {/* 1-Click Demo Customer Checkout */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-blue-900">1-Click Demo Customer</span>
                <span className="text-[10px] bg-blue-200/60 text-blue-800 px-1.5 py-0.5 rounded font-semibold">Instant</span>
              </div>
              <p className="text-[11px] text-slate-600 mb-2.5">
                Continue as <strong>Priya Sharma</strong> (Demo Customer) to test Razorpay checkout immediately.
              </p>
              <button
                type="button"
                onClick={handleInlineDemoCustomer}
                disabled={authLoading}
                className="w-full rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors shadow-2xs disabled:opacity-50"
              >
                {authLoading ? 'Signing in...' : 'Continue as Demo Customer (Priya)'}
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-slate-400 text-[11px] uppercase tracking-wider">Or your account</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Sign in / Sign up form */}
            <form onSubmit={handleInlineCustomerLogin} className="space-y-3 text-xs">
              {authMode === 'signup' && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Priya Sharma"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-xl bg-slate-900 text-white font-semibold py-2.5 hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {authLoading ? 'Signing in...' : authMode === 'signin' ? 'Sign In & Checkout' : 'Create Account & Checkout'}
              </button>

              <div className="text-center pt-1 text-slate-500">
                {authMode === 'signin' ? (
                  <span>
                    New customer?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Create account
                    </button>
                  </span>
                ) : (
                  <span>
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('signin')}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Sign in
                    </button>
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Razorpay Test Mode Payment Modal */}
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

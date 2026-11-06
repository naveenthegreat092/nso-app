import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Role,
  Product,
  Service,
  CartItem,
  Order,
  Booking,
  SpecialRequest,
  AuditLog,
  RevisedQuote,
  ProviderDetail,
  SavedAddress
} from '../types';
import {
  INITIAL_USER,
  INITIAL_ADDRESSES,
  MOCK_PROVIDERS,
  MOCK_PRODUCTS,
  MOCK_SERVICES,
  INITIAL_ORDERS,
  INITIAL_BOOKINGS,
  INITIAL_SPECIAL_REQUESTS,
  INITIAL_AUDIT_LOGS
} from '../data/mockData';
import { Language, translations, SUPPORTED_LANGUAGES } from '../i18n/translations';
import { api } from '../api/client';

interface AppContextType {
  user: UserProfile;
  products: Product[];
  services: Service[];
  providers: ProviderDetail[];
  addresses: SavedAddress[];
  selectedAddress: SavedAddress;
  cart: CartItem[];
  orders: Order[];
  bookings: Booking[];
  specialRequests: SpecialRequest[];
  auditLogs: AuditLog[];
  wishlist: Product[];
  isWishlistOpen: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
  activeTab: 'home' | 'explore' | 'ask_nso' | 'orders' | 'account';
  isAuthModalOpen: boolean;
  selectedProduct: Product | null;
  selectedService: Service | null;
  selectedProviderDetail: ProviderDetail | null;
  chatPeerName: string | null;
  trackingModalData: { title: string; partnerName: string; type: 'technician' | 'delivery' } | null;
  reviewModalData: { title: string; type: 'product' | 'service'; targetId: string } | null;
  isAddressModalOpen: boolean;
  notification: string | null;

  // Actions
  setActiveTab: (tab: 'home' | 'explore' | 'ask_nso' | 'orders' | 'account') => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  setSelectedProduct: (product: Product | null) => void;
  setSelectedService: (service: Service | null) => void;
  openProviderProfile: (providerIdOrName: string) => void;
  closeProviderProfile: () => void;
  openChat: (peerName: string) => void;
  closeChat: () => void;
  openTracking: (title: string, partnerName: string, type: 'technician' | 'delivery') => void;
  closeTracking: () => void;
  openReviewModal: (title: string, type: 'product' | 'service', targetId: string) => void;
  closeReviewModal: () => void;
  openAddressModal: () => void;
  closeAddressModal: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;
  toggleWishlist: (product: Product) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  cancelBooking: (bookingId: string, reason?: string) => void;
  selectAddress: (addr: SavedAddress) => void;
  submitReview: (rating: number, comment: string, tags: string[]) => void;
  switchRole: (role: Role) => boolean;
  loginUser: (emailOrPhone: string, role?: Role) => void;
  logoutUser: () => void;
  addToCart: (product: Product, quantity?: number, variantId?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: (deliveryAddress: string, paymentMethod: string, couponCode?: string, tip?: number) => Order | null;
  createBooking: (serviceId: string, date: string, timeSlot: string, mode: 'home_visit' | 'provider_location', address: string) => Booking | null;
  updateOrderStatus: (orderId: string, status: Order['orderStatus']) => void;
  updateOrderPaymentStatus: (orderId: string, status: Order['paymentStatus']) => void;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  updateBookingPaymentStatus: (bookingId: string, status: Booking['paymentStatus']) => void;
  submitRevisedQuote: (bookingId: string, amount: number, reason: string) => void;
  respondToRevisedQuote: (bookingId: string, approvedByAdmin: boolean, customerApproved?: boolean) => void;
  submitSpecialRequest: (title: string, category: string, description: string, budget: number, timeline: string) => SpecialRequest;
  updateSpecialRequest: (requestId: string, status: SpecialRequest['status'], adminNotes?: string, adminQuotation?: number) => void;
  approveSeller: (sellerId: string, approved: boolean) => void;
  approveProviderCategory: (providerId: string, categoryId: string, approved: boolean) => void;
  applyForSeller: (app: { storeName: string; businessType: string; gstin?: string; address: string }) => void;
  applyForProvider: (app: { tradeCategory: string; experienceYears: number; hourlyRate: number }) => void;
  approveSellerApplication: (approved: boolean) => void;
  approveProviderApplication: (approved: boolean) => void;
  approveProduct: (productId: string, approved: boolean, reason?: string) => void;
  addProduct: (productData: Omit<Product, 'id'>) => Product;
  updateProductStock: (productId: string, stock: number) => void;
  deleteAddress: (addressId: string) => void;
  addProviderPortfolioImage: (providerId: string, item: { id: string; title: string; image: string; tag: string }) => void;
  showToast: (msg: string) => void;
  resetAllDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nso_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          isLoggedIn: true,
          authorizedRoles: ['customer', 'seller', 'provider', 'admin'],
          adminVerified: true,
          sellerStatus: 'approved',
          providerStatus: 'approved'
        };
      } catch {
        return INITIAL_USER;
      }
    }
    return INITIAL_USER;
  });

  const [addresses, setAddresses] = useState<SavedAddress[]>(() => {
    const saved = localStorage.getItem('nso_addresses');
    return saved ? JSON.parse(saved) : INITIAL_ADDRESSES;
  });

  const [selectedAddress, setSelectedAddress] = useState<SavedAddress>(() => {
    return addresses.find((a) => a.isDefault) || addresses[0];
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('nso_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return MOCK_PRODUCTS;
  });

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('nso_services');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return MOCK_SERVICES;
  });

  const [providers, setProviders] = useState<ProviderDetail[]>(() => {
    const saved = localStorage.getItem('nso_providers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return MOCK_PROVIDERS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('nso_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('nso_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('nso_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [specialRequests, setSpecialRequests] = useState<SpecialRequest[]>(() => {
    const saved = localStorage.getItem('nso_special_requests');
    return saved ? JSON.parse(saved) : INITIAL_SPECIAL_REQUESTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('nso_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem('nso_wishlist');
    return saved ? JSON.parse(saved) : [MOCK_PRODUCTS[0]];
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('nso_language') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('nso_language', lang);
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
    showToast(`Language switched to ${langObj?.label} (${langObj?.nativeName})`);
  };

  const t = (key: string, defaultText?: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || defaultText || key;
  };

  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'ask_nso' | 'orders' | 'account'>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProviderDetail, setSelectedProviderDetail] = useState<ProviderDetail | null>(null);
  const [chatPeerName, setChatPeerName] = useState<string | null>(null);
  const [trackingModalData, setTrackingModalData] = useState<{ title: string; partnerName: string; type: 'technician' | 'delivery' } | null>(null);
  const [reviewModalData, setReviewModalData] = useState<{ title: string; type: 'product' | 'service'; targetId: string } | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => { localStorage.setItem('nso_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('nso_addresses', JSON.stringify(addresses)); }, [addresses]);
  useEffect(() => { localStorage.setItem('nso_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('nso_services', JSON.stringify(services)); }, [services]);
  useEffect(() => { localStorage.setItem('nso_providers', JSON.stringify(providers)); }, [providers]);
  useEffect(() => { localStorage.setItem('nso_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('nso_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('nso_bookings', JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { localStorage.setItem('nso_special_requests', JSON.stringify(specialRequests)); }, [specialRequests]);
  useEffect(() => { localStorage.setItem('nso_audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem('nso_wishlist', JSON.stringify(wishlist)); }, [wishlist]);

  // Sync with Cloud Backend on mount
  useEffect(() => {
    const syncCloudData = async () => {
      const cloudProducts = await api.getProducts();
      if (cloudProducts && cloudProducts.length > 0) setProducts(cloudProducts);

      const cloudOrders = await api.getOrders();
      if (cloudOrders && cloudOrders.length > 0) setOrders(cloudOrders);

      const cloudBookings = await api.getBookings();
      if (cloudBookings && cloudBookings.length > 0) setBookings(cloudBookings);
    };
    syncCloudData();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3800);
  };

  const addAuditLog = (action: string, details: string, targetRole: Role = user.activeRole) => {
    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: user.name,
      role: targetRole,
      action,
      details
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const openProviderProfile = (providerIdOrName: string) => {
    const prov =
      providers.find((p) => p.id === providerIdOrName || p.name.toLowerCase().includes(providerIdOrName.toLowerCase())) ||
      providers[0];
    setSelectedProviderDetail(prov);
  };

  const closeProviderProfile = () => setSelectedProviderDetail(null);

  const openChat = (peerName: string) => setChatPeerName(peerName);
  const closeChat = () => setChatPeerName(null);

  const openTracking = (title: string, partnerName: string, type: 'technician' | 'delivery') => {
    setTrackingModalData({ title, partnerName, type });
  };
  const closeTracking = () => setTrackingModalData(null);

  const openReviewModal = (title: string, type: 'product' | 'service', targetId: string) => {
    setReviewModalData({ title, type, targetId });
  };
  const closeReviewModal = () => setReviewModalData(null);

  const openAddressModal = () => setIsAddressModalOpen(true);
  const closeAddressModal = () => setIsAddressModalOpen(false);

  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        showToast(`Removed "${product.title}" from Wishlist`);
        return prev.filter((p) => p.id !== product.id);
      } else {
        showToast(`Saved "${product.title}" to Wishlist!`);
        return [...prev, product];
      }
    });
  };

  const cancelOrder = (orderId: string, reason = 'Customer request before dispatch') => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: 'cancelled', paymentStatus: 'refunded' } : o))
    );
    api.cancelOrder(orderId);
    addAuditLog('ORDER_CANCELLED_REFUNDED', `Order ${orderId} cancelled. Refund credited to original payment source.`);
    showToast(`Order cancelled. Full refund initiated.`);
  };

  const cancelBooking = (bookingId: string, reason = 'Customer cancelled slot') => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled', paymentStatus: 'refunded' } : b))
    );
    api.cancelBooking(bookingId);
    addAuditLog('BOOKING_CANCELLED', `Service booking ${bookingId} cancelled.`);
    showToast(`Booking cancelled. Zero penalty applied.`);
  };

  const selectAddress = (addr: SavedAddress) => {
    setSelectedAddress(addr);
    setUser((prev) => ({ ...prev, address: addr.fullAddress }));
    if (!addresses.some((a) => a.id === addr.id)) {
      setAddresses((prev) => [...prev, addr]);
    }
  };

  const submitReview = (rating: number, comment: string, tags: string[]) => {
    if (!reviewModalData) return;

    if (reviewModalData.type === 'service') {
      setBookings((prev) =>
        prev.map((b) => (b.id === reviewModalData.targetId ? { ...b, rating, reviewComment: comment } : b))
      );
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === reviewModalData.targetId ? { ...o, rating, reviewComment: comment } : o))
      );
    }
    addAuditLog('REVIEW_SUBMITTED', `Customer rated ${reviewModalData.title} with ${rating}★: "${comment}"`);
  };

  const switchRole = (newRole: Role): boolean => {
    if (newRole === 'seller' && user.sellerStatus !== 'approved') {
      showToast('Seller dashboard locked: Requires Admin verification.');
      return false;
    }
    if (newRole === 'provider' && user.providerStatus !== 'approved') {
      showToast('Provider hub locked: Category verification required.');
      return false;
    }
    if (newRole === 'admin' && !user.adminVerified) {
      showToast('Admin access denied: Security authorization required.');
      return false;
    }

    setUser((prev) => ({ ...prev, activeRole: newRole }));
    addAuditLog('ROLE_SWITCH', `Switched active role from ${user.activeRole} to ${newRole}`, newRole);
    showToast(`Switched view to ${newRole.toUpperCase()}`);
    return true;
  };

  const loginUser = (emailOrPhone: string, role: Role = 'customer', userName?: string) => {
    const isAdmin = emailOrPhone.toLowerCase().includes('admin') || role === 'admin';
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: userName || (emailOrPhone.includes('@') ? emailOrPhone.split('@')[0] : 'Naveen U.'),
      email: emailOrPhone.includes('@') ? emailOrPhone : 'user@nso.in',
      phone: emailOrPhone.includes('@') ? '+91 98765 43210' : emailOrPhone,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      activeRole: isAdmin ? 'admin' : 'customer',
      authorizedRoles: isAdmin ? ['customer', 'admin'] : ['customer'],
      sellerStatus: 'none',
      providerStatus: 'none',
      adminVerified: isAdmin,
      address: selectedAddress.fullAddress,
      isLoggedIn: true
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
    addAuditLog('USER_LOGIN', `User signed in with ${emailOrPhone}`, newUser.activeRole);
    showToast(`Welcome ${newUser.name}! Signed in successfully.`);
  };

  const logoutUser = () => {
    setUser({
      ...INITIAL_USER,
      isLoggedIn: false
    });
    setCart([]);
    setActiveTab('home');
    setIsAuthModalOpen(true);
    addAuditLog('USER_LOGOUT', 'User logged out', user.activeRole);
    showToast('Signed out successfully.');
  };

  const applyForSeller = (appData: { storeName: string; businessType: string; gstin?: string; address: string }) => {
    setUser((prev) => ({
      ...prev,
      sellerStatus: 'pending',
      sellerApplication: {
        ...appData,
        submittedAt: new Date().toISOString().substring(0, 10)
      }
    }));
    addAuditLog('SELLER_APPLICATION_SUBMITTED', `Store "${appData.storeName}" submitted for Admin KYC approval.`);
    showToast('Seller Application Submitted! Awaiting Admin verification.');
  };

  const applyForProvider = (appData: { tradeCategory: string; experienceYears: number; hourlyRate: number }) => {
    setUser((prev) => ({
      ...prev,
      providerStatus: 'pending',
      providerApplication: {
        ...appData,
        submittedAt: new Date().toISOString().substring(0, 10)
      }
    }));
    addAuditLog('PROVIDER_APPLICATION_SUBMITTED', `Specialist application for "${appData.tradeCategory}" submitted for Admin verification.`);
    showToast('Provider Application Submitted! Awaiting Admin verification.');
  };

  const approveSellerApplication = (approved: boolean) => {
    setUser((prev) => ({
      ...prev,
      sellerStatus: approved ? 'approved' : 'rejected',
      authorizedRoles: approved && !prev.authorizedRoles.includes('seller')
        ? [...prev.authorizedRoles, 'seller']
        : prev.authorizedRoles
    }));
    addAuditLog('SELLER_KYC_DECISION', `Admin ${approved ? 'APPROVED' : 'REJECTED'} seller application.`);
    showToast(`Seller KYC has been ${approved ? 'APPROVED' : 'REJECTED'}.`);
  };

  const approveProviderApplication = (approved: boolean) => {
    setUser((prev) => ({
      ...prev,
      providerStatus: approved ? 'approved' : 'rejected',
      authorizedRoles: approved && !prev.authorizedRoles.includes('provider')
        ? [...prev.authorizedRoles, 'provider']
        : prev.authorizedRoles
    }));
    addAuditLog('PROVIDER_KYC_DECISION', `Admin ${approved ? 'APPROVED' : 'REJECTED'} provider credentials.`);
    showToast(`Provider category has been ${approved ? 'APPROVED' : 'REJECTED'}.`);
  };

  const approveProduct = (productId: string, approved: boolean, reason?: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              approvalStatus: approved ? 'approved' : 'rejected',
              adminRejectionReason: reason
            }
          : p
      )
    );
    addAuditLog('PRODUCT_CATALOG_DECISION', `Admin ${approved ? 'APPROVED' : 'REJECTED'} product ID ${productId}`);
    showToast(`Product ${approved ? 'APPROVED and published to live store!' : 'REJECTED'}`);
  };

  const addToCart = (product: Product, quantity = 1, variantId?: string) => {
    const selectedVariant = variantId ? product.variants.find((v) => v.id === variantId) : product.variants[0];
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id && item.selectedVariant?.id === selectedVariant?.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.selectedVariant?.id === selectedVariant?.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selectedVariant }];
    });
    showToast(`Added "${product.title}" to Cart`);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Removed item from cart');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const createOrder = (
    deliveryAddress: string,
    paymentMethod: string,
    couponCode?: string,
    tip = 0
  ): Order | null => {
    if (cart.length === 0) return null;

    const subtotal = cart.reduce(
      (acc, item) => acc + (item.product.price + (item.selectedVariant?.priceModifier || 0)) * item.quantity,
      0
    );
    const sellerDeliveryCharge = Math.max(...cart.map((item) => item.product.regionalDeliveryFee), 0);
    const platformFee = 0;
    const couponDiscount = couponCode === 'NSOFIRST' ? 150 : couponCode === 'FESTIVE50' ? Math.round(subtotal * 0.1) : 0;
    const total = Math.max(0, subtotal + sellerDeliveryCharge + platformFee + tip - couponDiscount);

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: `NSO-ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      customerId: user.id,
      customerName: user.name,
      items: cart.map((item) => ({
        productId: item.product.id,
        title: `${item.product.title} ${item.selectedVariant ? `(${item.selectedVariant.name})` : ''}`,
        price: item.product.price + (item.selectedVariant?.priceModifier || 0),
        quantity: item.quantity,
        variant: item.selectedVariant?.name,
        image: item.product.image,
        sellerId: item.product.sellerId
      })),
      subtotal,
      sellerDeliveryCharge,
      platformFee,
      couponDiscount,
      tipAmount: tip,
      total,
      orderStatus: 'confirmed',
      paymentStatus: 'pending',
      paymentMethod,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      deliveryAddress
    };

    setOrders((prev) => [newOrder, ...prev]);
    api.createOrder(newOrder);
    clearCart();
    addAuditLog('ORDER_CREATED', `Order ${newOrder.orderNumber} confirmed for ₹${total}`);
    showToast(`Order Confirmed! Ref: ${newOrder.orderNumber}`);
    return newOrder;
  };

  const createBooking = (
    serviceId: string,
    date: string,
    timeSlot: string,
    mode: 'home_visit' | 'provider_location',
    address: string
  ): Booking | null => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return null;

    // Scheduling Rule: For personal attention, block overlapping bookings for the same provider
    const hasConflict = bookings.some(
      (b) =>
        b.providerId === service.providerId &&
        b.date === date &&
        b.timeSlot === timeSlot &&
        b.status !== 'cancelled'
    );

    if (hasConflict) {
      showToast('Selected time slot conflicts with an existing booking for this provider.');
      return null;
    }

    const newBooking: Booking = {
      id: `book_${Date.now()}`,
      bookingNumber: `NSO-BKG-${Math.floor(10000 + Math.random() * 90000)}`,
      serviceId: service.id,
      serviceTitle: service.title,
      providerId: service.providerId,
      providerName: service.providerName,
      customerId: user.id,
      customerName: user.name,
      date,
      timeSlot,
      serviceMode: mode,
      customerAddress: address,
      status: 'confirmed',
      paymentStatus: 'pending',
      totalPrice: service.price,
      cancellationTerms: service.cancellationPolicy,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      technicianEtaMinutes: 14
    };

    setBookings((prev) => [newBooking, ...prev]);
    api.createBooking(newBooking);
    addAuditLog('BOOKING_CREATED', `Booking ${newBooking.bookingNumber} confirmed for ${service.title}`);
    showToast(`Service Booked! Ref: ${newBooking.bookingNumber}`);
    return newBooking;
  };

  const updateOrderStatus = (orderId: string, status: Order['orderStatus']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o))
    );
    api.updateOrderStatus(orderId, status);
    addAuditLog('ORDER_STATUS_UPDATE', `Order ${orderId} updated to ${status}`);
    showToast(`Order status: ${status}`);
  };

  const updateOrderPaymentStatus = (orderId: string, status: Order['paymentStatus']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: status } : o))
    );
    addAuditLog('ORDER_PAYMENT_UPDATE', `Order ${orderId} payment status marked as ${status.toUpperCase()}`);
    showToast(`Order payment status updated to ${status.toUpperCase()}`);
  };

  const updateBookingStatus = (bookingId: string, status: Booking['status']) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );
    api.updateBookingStatus(bookingId, status);
    addAuditLog('BOOKING_STATUS_UPDATE', `Booking ${bookingId} updated to ${status}`);
    showToast(`Booking status: ${status}`);
  };

  const updateBookingPaymentStatus = (bookingId: string, status: Booking['paymentStatus']) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, paymentStatus: status } : b))
    );
    addAuditLog('BOOKING_PAYMENT_UPDATE', `Booking ${bookingId} payment status marked as ${status.toUpperCase()}`);
    showToast(`Booking payment status updated to ${status.toUpperCase()}`);
  };

  const submitRevisedQuote = (bookingId: string, amount: number, reason: string) => {
    const revisedQuote: RevisedQuote = {
      amount,
      reason,
      status: 'pending_admin',
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, revisedQuote } : b))
    );
    addAuditLog('REVISED_QUOTE_SUBMITTED', `Provider submitted revised quote of ₹${amount} for Booking ${bookingId}`);
    showToast('Revised quote submitted for Admin review.');
  };

  const respondToRevisedQuote = (bookingId: string, approvedByAdmin: boolean, customerApproved?: boolean) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId || !b.revisedQuote) return b;

        if (!approvedByAdmin) {
          addAuditLog('REVISED_QUOTE_REJECTED_ADMIN', `Admin rejected revised quote for Booking ${bookingId}`);
          return { ...b, revisedQuote: { ...b.revisedQuote, status: 'rejected' } };
        }

        if (customerApproved === true) {
          addAuditLog('REVISED_QUOTE_CUSTOMER_APPROVED', `Customer approved revised quote of ₹${b.revisedQuote.amount}`);
          return {
            ...b,
            totalPrice: b.totalPrice + b.revisedQuote.amount,
            revisedQuote: { ...b.revisedQuote, status: 'customer_approved' }
          };
        } else if (customerApproved === false) {
          addAuditLog('REVISED_QUOTE_CUSTOMER_DECLINED', `Customer declined extra work quote`);
          return { ...b, revisedQuote: { ...b.revisedQuote, status: 'rejected' } };
        }

        addAuditLog('REVISED_QUOTE_ADMIN_APPROVED', `Admin approved revised quote of ₹${b.revisedQuote.amount}`);
        return { ...b, revisedQuote: { ...b.revisedQuote, status: 'admin_approved' } };
      })
    );
  };

  const submitSpecialRequest = (
    title: string,
    category: string,
    description: string,
    budget: number,
    timeline: string
  ): SpecialRequest => {
    const newReq: SpecialRequest = {
      id: `req_${Date.now()}`,
      requestNumber: `NSO-SRQ-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: user.id,
      customerName: user.name,
      title,
      category,
      description,
      estimatedBudget: budget,
      targetTimeline: timeline,
      status: 'submitted',
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setSpecialRequests((prev) => [newReq, ...prev]);
    addAuditLog('SPECIAL_REQUEST_SUBMITTED', `Special request ${newReq.requestNumber} submitted: ${title}`);
    showToast(`Request Submitted to Admin! Ref: ${newReq.requestNumber}`);
    return newReq;
  };

  const updateSpecialRequest = (
    requestId: string,
    status: SpecialRequest['status'],
    adminNotes?: string,
    adminQuotation?: number
  ) => {
    setSpecialRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status,
              ...(adminNotes ? { adminNotes } : {}),
              ...(adminQuotation !== undefined ? { adminQuotation } : {})
            }
          : req
      )
    );
    addAuditLog('SPECIAL_REQUEST_UPDATED', `Special request ${requestId} updated to ${status}`);
    showToast(`Request ${requestId} status updated.`);
  };

  const approveSeller = (sellerId: string, approved: boolean) => {
    addAuditLog('SELLER_APPROVAL', `Admin marked seller ${sellerId} as ${approved ? 'APPROVED' : 'REJECTED'}`);
    showToast(`Seller status updated to: ${approved ? 'APPROVED' : 'REJECTED'}`);
  };

  const approveProviderCategory = (providerId: string, categoryId: string, approved: boolean) => {
    setServices((prev) =>
      prev.map((s) => (s.providerId === providerId && s.category === categoryId ? { ...s, approvedByAdmin: approved } : s))
    );
    addAuditLog('CATEGORY_VERIFICATION', `Admin verified provider ${providerId} for ${categoryId}`);
    showToast(`Category ${approved ? 'VERIFIED' : 'REJECTED'}`);
  };

  const addProduct = (productData: Omit<Product, 'id'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
      approvalStatus: 'pending_approval',
      submittedAt: new Date().toISOString().substring(0, 10)
    };
    setProducts((prev) => [newProduct, ...prev]);
    api.createProduct(newProduct);
    addAuditLog('PRODUCT_SUBMITTED_FOR_APPROVAL', `Seller added product "${newProduct.title}" (₹${newProduct.price}) - Awaiting Admin approval.`);
    showToast(`Product "${newProduct.title}" submitted! Awaiting Admin review before going live.`);
    return newProduct;
  };

  const updateProductStock = (productId: string, stock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock } : p))
    );
    api.updateProductStock(productId, stock);
    showToast(`Stock updated to ${stock}`);
  };

  const deleteAddress = (addressId: string) => {
    setAddresses((prev) => {
      const filtered = prev.filter((a) => a.id !== addressId);
      if (selectedAddress.id === addressId && filtered.length > 0) {
        setSelectedAddress(filtered[0]);
      }
      return filtered;
    });
    showToast('Address removed');
  };

  const addProviderPortfolioImage = (
    providerId: string,
    item: { id: string; title: string; image: string; tag: string }
  ) => {
    setProviders((prev) =>
      prev.map((prov) =>
        prov.id === providerId
          ? { ...prov, portfolio: [item, ...prov.portfolio] }
          : prov
      )
    );
    showToast('Work photo added to portfolio!');
  };

  const resetAllDemoData = () => {
    localStorage.clear();
    setUser(INITIAL_USER);
    setAddresses(INITIAL_ADDRESSES);
    setSelectedAddress(INITIAL_ADDRESSES[0]);
    setProducts(MOCK_PRODUCTS);
    setServices(MOCK_SERVICES);
    setProviders(MOCK_PROVIDERS);
    setCart([]);
    setOrders(INITIAL_ORDERS);
    setBookings(INITIAL_BOOKINGS);
    setSpecialRequests(INITIAL_SPECIAL_REQUESTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setWishlist([MOCK_PRODUCTS[0]]);
    api.resetDatabase();
    showToast('Demo environment reset to initial defaults.');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        products,
        services,
        providers,
        addresses,
        selectedAddress,
        cart,
        orders,
        bookings,
        specialRequests,
        auditLogs,
        wishlist,
        isWishlistOpen,
        language,
        setLanguage,
        t,
        activeTab,
        isAuthModalOpen,
        selectedProduct,
        selectedService,
        selectedProviderDetail,
        chatPeerName,
        trackingModalData,
        reviewModalData,
        isAddressModalOpen,
        notification,
        setActiveTab,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        setSelectedProduct,
        setSelectedService,
        openProviderProfile,
        closeProviderProfile,
        openChat,
        closeChat,
        openTracking,
        closeTracking,
        openReviewModal,
        closeReviewModal,
        openAddressModal,
        closeAddressModal,
        openWishlist,
        closeWishlist,
        toggleWishlist,
        cancelOrder,
        cancelBooking,
        selectAddress,
        submitReview,
        switchRole,
        loginUser,
        logoutUser,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        createOrder,
        createBooking,
        updateOrderStatus,
        updateOrderPaymentStatus,
        updateBookingStatus,
        updateBookingPaymentStatus,
        submitRevisedQuote,
        respondToRevisedQuote,
        submitSpecialRequest,
        updateSpecialRequest,
        approveSeller,
        approveProviderCategory,
        applyForSeller,
        applyForProvider,
        approveSellerApplication,
        approveProviderApplication,
        approveProduct,
        addProduct,
        updateProductStock,
        deleteAddress,
        addProviderPortfolioImage,
        showToast,
        resetAllDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

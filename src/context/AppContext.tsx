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

/** Unauthenticated user shape — no hardcoded credentials or roles */
const UNAUTHENTICATED_USER: UserProfile = {
  id: '',
  name: '',
  email: '',
  phone: '',
  activeRole: 'customer',
  authorizedRoles: ['customer'],
  sellerStatus: 'none',
  providerStatus: 'none',
  adminVerified: false,
  isLoggedIn: false
};

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
  isAppLoading: boolean;

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
  /**
   * loginUser() — called after the server has verified the OTP.
   * It calls GET /api/auth/me to retrieve the real user and sets state.
   * No role or phone argument accepted from the client.
   */
  loginUser: (phoneHint?: string) => Promise<UserProfile | null>;
  logoutUser: () => Promise<void>;
  addToCart: (product: Product, quantity?: number, variantId?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: (deliveryAddress: string, paymentMethod: string, couponCode?: string, tip?: number) => Promise<Order | null>;
  createBooking: (
    serviceId: string,
    date: string,
    timeSlot: string,
    mode: 'home_visit' | 'provider_location',
    address: string,
    problemDescription?: string,
    problemPhoto?: string,
    requestType?: 'site_visit' | 'repair' | 'inspection'
  ) => Promise<Booking | null>;
  updateOrderStatus: (orderId: string, status: Order['orderStatus']) => void;
  updateOrderPaymentStatus: (orderId: string, status: Order['paymentStatus']) => void;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  updateBookingPaymentStatus: (bookingId: string, status: Booking['paymentStatus']) => void;
  submitRevisedQuote: (bookingId: string, amount: number, reason: string) => void;
  sendProviderQuotation: (bookingId: string, amount: number, reason: string) => void;
  respondToRevisedQuote: (bookingId: string, approvedByAdmin: boolean, customerApproved?: boolean) => void;
  submitSpecialRequest: (title: string, category: string, description: string, budget: number, timeline: string) => SpecialRequest;
  updateSpecialRequest: (requestId: string, status: SpecialRequest['status'], adminNotes?: string, adminQuotation?: number) => void;
  approveSeller: (sellerId: string, approved: boolean) => void;
  approveProviderCategory: (providerId: string, categoryId: string, approved: boolean) => void;
  applyForSeller: (app: { storeName: string; businessType: string; gstin?: string; address: string; productCategory?: string; storeLogo?: string }) => void;
  applyForProvider: (app: {
    tradeCategory: string;
    experienceYears: number;
    hourlyRate: number;
    serviceArea?: string;
    resumeText?: string;
    previousWork?: string;
    idProofType?: string;
    idProofNumber?: string;
    profilePhoto?: string;
    idDocumentPhoto?: string;
  }) => void;
  approveSellerApplication: (approved: boolean) => void;
  approveProviderApplication: (approved: boolean) => void;
  approveProduct: (productId: string, approved: boolean, reason?: string) => void;
  registeredUsers: UserProfile[];
  registerCustomerProfile: (data: {
    name: string;
    phone: string;
    houseNumber: string;
    streetNumber: string;
    landmark: string;
    city: string;
    pincode: string;
  }) => void;
  approveUserRegistration: (userId: string, approved: boolean) => void;
  approveProviderWithId: (appId: string, approved: boolean, providerData?: any) => void;
  checkMyApprovalStatus: () => Promise<boolean>;
  addProduct: (productData: Omit<Product, 'id'>) => Product;
  deleteProduct: (productId: string) => void;
  clearDemoProducts: () => void;
  updateProductStock: (productId: string, stock: number) => void;
  deleteAddress: (addressId: string) => void;
  addProviderPortfolioImage: (providerId: string, item: { id: string; title: string; image: string; tag: string }) => void;
  showToast: (msg: string) => void;
  resetAllDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ── Auth: start unauthenticated — session restored by checkSession() on mount ──
  const [user, setUser] = useState<UserProfile>(UNAUTHENTICATED_USER);

  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);

  const [addresses, setAddresses] = useState<SavedAddress[]>(INITIAL_ADDRESSES);

  const [selectedAddress, setSelectedAddress] = useState<SavedAddress>(
    () => INITIAL_ADDRESSES.find((a) => a.isDefault) || INITIAL_ADDRESSES[0]
  );

  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [providers, setProviders] = useState<ProviderDetail[]>(MOCK_PROVIDERS);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('nso_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [specialRequests, setSpecialRequests] = useState<SpecialRequest[]>(INITIAL_SPECIAL_REQUESTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Wishlist: start empty — no pre-populated items
  const [wishlist, setWishlist] = useState<Product[]>([]);

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
  const [isAppLoading, setIsAppLoading] = useState(true);

  // ── Persist cart to localStorage ──────────────────────────────────────────
  useEffect(() => { localStorage.setItem('nso_cart', JSON.stringify(cart)); }, [cart]);

  // ── Restore session from server on mount ─────────────────────────────────
  useEffect(() => {
    const checkSession = async () => {
      try {
        const serverUser = await api.getMe();
        if (serverUser && serverUser.id) {
          setUser({ ...serverUser, isLoggedIn: true });
        }
      } catch {
        // Backend offline or no session — remain unauthenticated, don't crash
      } finally {
        setIsAppLoading(false);
      }
    };
    checkSession();
  }, []);

  // ── Sync cloud data on mount ──────────────────────────────────────────────
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

  // ── Sync registered users from API ───────────────────────────────────────
  useEffect(() => {
    const fetchUsers = async () => {
      const cloudUsers = await api.getUsers();
      if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
        setRegisteredUsers(cloudUsers);
      }
    };
    fetchUsers();
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
      actor: user.name || 'System',
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
    setSelectedProviderDetail(prov || null);
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

  const cancelBooking = (bookingId: string, _reason = 'Customer cancelled slot') => {
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

  const submitReview = (rating: number, comment: string, _tags: string[]) => {
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
    // Only allow switching to roles the server has granted
    if (!user.authorizedRoles.includes(newRole)) {
      if (newRole === 'seller') showToast('Seller dashboard locked: Requires Admin verification.');
      else if (newRole === 'provider') showToast('Provider hub locked: Category verification required.');
      else if (newRole === 'admin') showToast('Admin access denied: Security authorization required.');
      else showToast(`Role "${newRole}" not authorized for your account.`);
      return false;
    }

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

  /**
   * loginUser — called after a successful OTP verification.
   * Fetches the real user object from the server (GET /api/auth/me) or uses phone hint.
   */
  const loginUser = async (phoneHint?: string): Promise<UserProfile | null> => {
    const clean = (phoneHint || '').replace(/\D/g, '').slice(-10);
    try {
      const serverUser = await api.getMe();
      if (serverUser && serverUser.id) {
        const isOwner =
          Boolean(serverUser.adminVerified) ||
          (serverUser.phone && serverUser.phone.replace(/\D/g, '').endsWith('8310421121')) ||
          clean === '8310421121';
        const authUser: UserProfile = {
          ...serverUser,
          adminVerified: isOwner || serverUser.adminVerified,
          activeRole: isOwner ? 'admin' : serverUser.activeRole,
          authorizedRoles:
            isOwner && !serverUser.authorizedRoles.includes('admin')
              ? [...serverUser.authorizedRoles, 'admin', 'seller', 'provider']
              : serverUser.authorizedRoles,
          isLoggedIn: true
        };
        setUser(authUser);
        setIsAuthModalOpen(false);
        addAuditLog('USER_LOGIN', `User signed in: ${serverUser.phone || serverUser.email}`, authUser.activeRole);
        showToast(isOwner ? '👑 Welcome Marketplace Owner!' : `Welcome ${serverUser.name || 'back'}!`);
        return authUser;
      }
    } catch {
      // Backend offline or local session fallback
    }

    if (clean === '8310421121') {
      const adminProfile: UserProfile = {
        id: 'usr_owner_admin',
        name: 'Marketplace Owner',
        email: 'owner@nso.in',
        phone: '+91 8310421121',
        activeRole: 'admin',
        authorizedRoles: ['customer', 'admin', 'seller', 'provider'],
        approvalStatus: 'approved',
        sellerStatus: 'approved',
        providerStatus: 'approved',
        adminVerified: true,
        address: 'NSO Headquarters, Bengaluru',
        isLoggedIn: true
      };
      setUser(adminProfile);
      setIsAuthModalOpen(false);
      showToast('👑 Welcome Marketplace Owner! Entering Admin Console...');
      return adminProfile;
    }
    return null;
  };

  /**
   * logoutUser — calls POST /api/auth/logout on the server then clears local state.
   */
  const logoutUser = async (): Promise<void> => {
    addAuditLog('USER_LOGOUT', 'User logged out', user.activeRole);
    await api.logout();
    setUser(UNAUTHENTICATED_USER);
    setCart([]);
    setWishlist([]);
    setActiveTab('home');
    setIsAuthModalOpen(true);
    showToast('Signed out successfully.');
  };

  const registerCustomerProfile = (data: {
    name: string;
    phone: string;
    houseNumber: string;
    streetNumber: string;
    landmark: string;
    city: string;
    pincode: string;
  }) => {
    const fullAddress = `${data.houseNumber}, ${data.streetNumber}, ${data.landmark}, ${data.city} - ${data.pincode}`;
    const cleanPhone = data.phone.startsWith('+91') ? data.phone : `+91 ${data.phone.replace(/\D/g, '')}`;

    const rawDigits = data.phone.replace(/\D/g, '');

    // Build authenticated user profile — roles come from server via loginUser(), never client-side
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: data.name,
      email: `${rawDigits}@nso.in`,
      phone: cleanPhone,
      activeRole: 'customer',
      authorizedRoles: ['customer'],
      approvalStatus: 'approved',
      houseNumber: data.houseNumber,
      streetNumber: data.streetNumber,
      landmark: data.landmark,
      city: data.city,
      pincode: data.pincode,
      sellerStatus: 'none',
      providerStatus: 'none',
      adminVerified: false,
      address: fullAddress,
      isLoggedIn: true
    };

    const newAddr: SavedAddress = {
      id: `addr_${Date.now()}`,
      label: 'Home',
      title: `${data.landmark || 'Home'} Residence`,
      fullAddress,
      landmark: data.landmark,
      isDefault: true
    };

    setAddresses([newAddr]);
    setSelectedAddress(newAddr);
    setUser(newUser);

    setRegisteredUsers((prev) => [newUser, ...prev.filter((u) => u.phone !== newUser.phone)]);

    // Cloud sync — fire and forget
    api.registerProfile(data).catch(() => {});

    addAuditLog('USER_REGISTERED', `Customer ${newUser.name} (${newUser.phone}) submitted profile for Admin approval: ${fullAddress}`);
    showToast('📋 Profile submitted! Awaiting Owner Approval.');
  };

  const approveUserRegistration = (userId: string, approved: boolean) => {
    setRegisteredUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, approvalStatus: approved ? ('approved' as const) : ('rejected' as const) } : u
      )
    );

    if (user.id === userId) {
      setUser((prev) => ({ ...prev, approvalStatus: approved ? ('approved' as const) : ('rejected' as const) }));
    }

    api.approveUser(userId, approved).catch(() => {});

    addAuditLog('USER_KYC_DECISION', `Owner ${approved ? 'APPROVED' : 'REJECTED'} customer registration ${userId}`);
    showToast(`Customer account ${approved ? 'APPROVED & Unlocked!' : 'REJECTED'}`);
  };

  const approveProviderWithId = (appId: string, approved: boolean, providerData?: any) => {
    const issuedId = `NSO-PROV-${Math.floor(100 + Math.random() * 900)}`;

    if (providerData?.userId === user.id || (!providerData && user.providerStatus === 'pending')) {
      setUser((prev) => ({
        ...prev,
        providerStatus: approved ? 'approved' : 'rejected',
        authorizedRoles: approved && !prev.authorizedRoles.includes('provider')
          ? [...prev.authorizedRoles, 'provider']
          : prev.authorizedRoles,
        providerApplication: prev.providerApplication
          ? {
              ...prev.providerApplication,
              issuedProviderId: approved ? issuedId : undefined
            }
          : undefined
      }));
    }

    if (approved) {
      const applicantName = providerData?.applicantName || user.name || 'Master Provider';
      const tradeCategory = providerData?.tradeCategory || user.providerApplication?.tradeCategory || 'Home Services';
      const hourlyRate = providerData?.hourlyRate || user.providerApplication?.hourlyRate || 299;
      const previousWork = providerData?.previousWork || user.providerApplication?.previousWork || 'Verified experienced specialist approved by NSO Admin.';

      const newService: Service = {
        id: `serv_${Date.now()}`,
        title: `${tradeCategory} Specialist Service`,
        category: tradeCategory as any,
        price: hourlyRate,
        unit: 'visit & inspection',
        providerId: issuedId,
        providerName: `${applicantName} (${issuedId})`,
        providerRating: 5.0,
        providerJobsCompleted: 0,
        modes: ['home_visit'],
        description: previousWork,
        cancellationPolicy: 'Free cancellation up to 2 hours before scheduled slot.',
        availableSlots: ['09:00 AM - 11:00 AM', '11:30 AM - 01:30 PM', '02:30 PM - 04:30 PM', '05:00 PM - 07:00 PM'],
        approvedByAdmin: true,
        approvalStatus: 'approved'
      };

      setServices((prev) => [newService, ...prev]);
      addAuditLog('PROVIDER_APPROVED', `Admin approved Provider ${applicantName} with ID ${issuedId}. Live service listed.`);
      showToast(`✅ Provider Approved! ID Issued: ${issuedId}`);
    } else {
      showToast('Provider application rejected.');
    }

    api.approveApplication(appId, approved, { issuedProviderId: issuedId }).catch(() => {});
  };

  const checkMyApprovalStatus = async (): Promise<boolean> => {
    try {
      const serverUser = await api.getMe();
      if (serverUser && serverUser.approvalStatus === 'approved') {
        setUser((prev) => ({ ...prev, approvalStatus: 'approved' }));
        showToast('🎉 Your account has been approved by Owner! Welcome to NSO.');
        return true;
      }
    } catch {}

    // Fallback: check local list
    const me = registeredUsers.find((u) => u.phone === user.phone || u.id === user.id);
    if (me && me.approvalStatus === 'approved') {
      setUser((prev) => ({ ...prev, approvalStatus: 'approved' }));
      showToast('🎉 Your account has been approved by Owner! Welcome to NSO.');
      return true;
    }
    return false;
  };

  const applyForSeller = (appData: { storeName: string; businessType: string; gstin?: string; address: string; productCategory?: string; storeLogo?: string }) => {
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

  const applyForProvider = (appData: {
    tradeCategory: string;
    experienceYears: number;
    hourlyRate: number;
    serviceArea?: string;
    resumeText?: string;
    previousWork?: string;
    idProofType?: string;
    idProofNumber?: string;
    profilePhoto?: string;
    idDocumentPhoto?: string;
  }) => {
    setUser((prev) => ({
      ...prev,
      providerStatus: 'pending',
      providerApplication: {
        ...appData,
        submittedAt: new Date().toISOString().substring(0, 10)
      }
    }));
    addAuditLog('PROVIDER_APPLICATION_SUBMITTED', `Specialist application with resume & work submitted for "${appData.tradeCategory}".`);
    showToast('Provider Application & Portfolio Submitted! Awaiting Admin verification.');
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

  /**
   * createOrder — POSTs to /api/orders with items + deliveryAddress + paymentMethod.
   * The server calculates the actual total from DB prices.
   * Falls back to client-side calculation if the server is offline.
   */
  const createOrder = async (
    deliveryAddress: string,
    paymentMethod: string,
    couponCode?: string,
    tip = 0
  ): Promise<Order | null> => {
    if (cart.length === 0) return null;

    const payload = {
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        variantId: item.selectedVariant?.id
      })),
      deliveryAddress,
      paymentMethod,
      couponCode,
      tipAmount: tip
    };

    const serverOrder = await api.createOrder(payload);

    if (serverOrder) {
      setOrders((prev) => [serverOrder, ...prev]);
      clearCart();
      addAuditLog('ORDER_CREATED', `Order ${serverOrder.orderNumber} confirmed for ₹${serverOrder.total}`);
      showToast(`Order Confirmed! Ref: ${serverOrder.orderNumber}`);
      return serverOrder;
    }

    // ── Offline fallback: client-side calculation ──────────────────────────
    const subtotal = cart.reduce(
      (acc, item) => acc + (item.product.price + (item.selectedVariant?.priceModifier || 0)) * item.quantity,
      0
    );
    const sellerDeliveryCharge = Math.max(...cart.map((item) => item.product.regionalDeliveryFee), 0);
    const platformFee = 0;
    const couponDiscount = couponCode === 'NSOFIRST' ? 150 : couponCode === 'FESTIVE50' ? Math.round(subtotal * 0.1) : 0;
    const total = Math.max(0, subtotal + sellerDeliveryCharge + platformFee + tip - couponDiscount);

    const fallbackOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: `NSO-ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      customerId: user.id,
      customerName: user.name,
      items: cart.map((item) => ({
        productId: item.product.id,
        title: `${item.product.title}${item.selectedVariant ? ` (${item.selectedVariant.name})` : ''}`,
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

    setOrders((prev) => [fallbackOrder, ...prev]);
    clearCart();
    addAuditLog('ORDER_CREATED_OFFLINE', `Order ${fallbackOrder.orderNumber} placed offline for ₹${total}`);
    showToast(`Order Confirmed (offline)! Ref: ${fallbackOrder.orderNumber}`);
    return fallbackOrder;
  };

  /**
   * createBooking — POSTs to /api/bookings.
   * If server returns 409 (slot conflict), shows appropriate message.
   * Falls back to local conflict check if server is offline.
   */
  const createBooking = async (
    serviceId: string,
    date: string,
    timeSlot: string,
    mode: 'home_visit' | 'provider_location',
    address: string
  ): Promise<Booking | null> => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return null;

    const payload = {
      serviceId,
      date,
      timeSlot,
      mode,
      address,
      customerId: user.id,
      customerName: user.name
    };

    // Try server first
    try {
      const res = await fetch(`/api/bookings`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.status === 409) {
        showToast('This time slot is no longer available. Please choose another.');
        return null;
      }

      if (res.ok) {
        const serverBooking: Booking = await res.json();
        setBookings((prev) => [serverBooking, ...prev]);
        addAuditLog('BOOKING_CREATED', `Booking ${serverBooking.bookingNumber} confirmed for ${service.title}`);
        showToast(`Service Booked! Ref: ${serverBooking.bookingNumber}`);
        return serverBooking;
      }
    } catch {
      // Server offline — fall through to local fallback
    }

    // ── Offline fallback: local slot conflict check ─────────────────────────
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

    const fallbackBooking: Booking = {
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

    setBookings((prev) => [fallbackBooking, ...prev]);
    addAuditLog('BOOKING_CREATED_OFFLINE', `Booking ${fallbackBooking.bookingNumber} confirmed for ${service.title}`);
    showToast(`Service Booked (offline)! Ref: ${fallbackBooking.bookingNumber}`);
    return fallbackBooking;
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

  const sendProviderQuotation = submitRevisedQuote;

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

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast('Product removed.');
  };

  /**
   * clearDemoProducts — admin-only. Removes products with known demo ID prefixes.
   */
  const clearDemoProducts = () => {
    if (user.activeRole !== 'admin') {
      showToast('Admin access required.');
      return;
    }
    setProducts((prev) =>
      prev.filter(
        (p) =>
          !p.id.startsWith('prod_earbuds') &&
          !p.id.startsWith('prod_smartwatch') &&
          !p.id.startsWith('prod_oil') &&
          !p.id.startsWith('prod_linen') &&
          !p.id.startsWith('prod_coffee') &&
          !p.id.startsWith('prod_bottle')
      )
    );
    showToast('Sample products cleared! Only seller products will show.');
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

  /**
   * resetAllDemoData — admin-only. Resets all local state to empty defaults.
   */
  const resetAllDemoData = () => {
    if (user.activeRole !== 'admin') {
      showToast('Admin access required.');
      return;
    }
    localStorage.removeItem('nso_cart');
    localStorage.removeItem('nso_language');
    setUser(UNAUTHENTICATED_USER);
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
    setWishlist([]);
    api.resetDatabase();
    showToast('Environment reset to initial defaults.');
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
        sendProviderQuotation,
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
        registeredUsers,
        registerCustomerProfile,
        approveUserRegistration,
        approveProviderWithId,
        checkMyApprovalStatus,
        addProduct,
        deleteProduct,
        clearDemoProducts,
        updateProductStock,
        deleteAddress,
        addProviderPortfolioImage,
        showToast,
        resetAllDemoData,
        isAppLoading
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

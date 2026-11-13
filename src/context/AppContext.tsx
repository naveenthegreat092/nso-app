import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Role,
  Product,
  Service,
  ServiceCategory,
  PricingType,
  JobQuotation,
  HourlyDetails,
  ReportedProblem,
  CancellationDetails,
  ProviderCancellationReview,
  CartItem,
  Order,
  Booking,
  BookingStatus,
  SpecialRequest,
  AuditLog,
  RevisedQuote,
  ProviderDetail,
  SavedAddress
} from '../types';
import { INITIAL_SERVICE_CATEGORIES } from '../data/serviceCatalog';
import {
  INITIAL_ADDRESSES,
  MOCK_PROVIDERS,
  MOCK_PRODUCTS,
  MOCK_SERVICES,
  INITIAL_ORDERS,
  INITIAL_BOOKINGS,
  INITIAL_SPECIAL_REQUESTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_REGISTERED_USERS
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
  serviceCategories: ServiceCategory[];
  providers: ProviderDetail[];
  providerCancellationReviews: ProviderCancellationReview[];
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
  activeTab: 'home' | 'explore' | 'orders' | 'account';
  isAuthModalOpen: boolean;
  selectedProduct: Product | null;
  selectedService: Service | null;
  selectedProviderDetail: ProviderDetail | null;
  chatPeerName: string | null;
  trackingModalData: { title: string; partnerName: string; type: 'technician' | 'delivery'; bookingId?: string; booking?: Booking } | null;
  reviewModalData: { title: string; type: 'product' | 'service'; targetId: string } | null;
  isAddressModalOpen: boolean;
  notification: string | null;
  isAppLoading: boolean;

  // Actions
  setActiveTab: (tab: 'home' | 'explore' | 'orders' | 'account') => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  setSelectedProduct: (product: Product | null) => void;
  setSelectedService: (service: Service | null) => void;
  openProviderProfile: (providerIdOrName: string) => void;
  closeProviderProfile: () => void;
  openChat: (peerName: string) => void;
  closeChat: () => void;
  openTracking: (title: string, partnerName: string, type: 'technician' | 'delivery', bookingId?: string, booking?: Booking) => void;
  closeTracking: () => void;
  openReviewModal: (title: string, type: 'product' | 'service', targetId: string) => void;
  closeReviewModal: () => void;
  openAddressModal: () => void;
  closeAddressModal: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;
  toggleWishlist: (product: Product) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  cancelBooking: (bookingId: string, reason?: string, cancelData?: { stage?: string; workCompletedCharge?: number; materialsUsedCharge?: number; breakdown?: string; cancelledBy?: 'customer' | 'provider' | 'admin' }) => Promise<void>;
  selectAddress: (addr: SavedAddress) => void;
  submitReview: (rating: number, comment: string, tags: string[]) => void;
  switchRole: (role: Role) => boolean;
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
    requestType?: 'site_visit' | 'repair' | 'inspection',
    jobAttachments?: string[],
    hourlyApprovedTimeLimit?: number
  ) => Promise<Booking | null>;
  updateOrderStatus: (orderId: string, status: Order['orderStatus']) => void;
  updateOrderPaymentStatus: (orderId: string, status: Order['paymentStatus']) => void;
  updateOrderDeliveryFee: (orderId: string, fee: number) => Promise<boolean>;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  updateBookingPaymentStatus: (bookingId: string, status: Booking['paymentStatus']) => void;
  submitRevisedQuote: (bookingId: string, amount: number, reason: string) => void;
  sendProviderQuotation: (bookingId: string, amount: number, reason: string) => void;
  respondToRevisedQuote: (bookingId: string, approvedByAdmin: boolean, customerApproved?: boolean) => void;
  submitJobQuotation: (bookingId: string, quoteData: Partial<JobQuotation>) => Promise<void>;
  adminReviewQuotation: (bookingId: string, decision: 'approve' | 'return' | 'request_info', adminFeedback?: string) => Promise<void>;
  customerDecideQuotation: (bookingId: string, decision: 'accept' | 'request_changes' | 'decline', customerFeedback?: string) => Promise<void>;
  requestHourlyExtraTime: (bookingId: string, requestedHours: number, reason: string, extraAmount?: number) => Promise<void>;
  customerDecideExtraTime: (bookingId: string, approved: boolean) => Promise<void>;
  updateHourlyTimeUsed: (bookingId: string, timeUsedHours: number, timerRunning?: boolean) => Promise<void>;
  markServiceComplete: (bookingId: string, completionNotes?: string) => Promise<void>;
  confirmServiceCompletion: (bookingId: string, rating?: number, reviewComment?: string) => Promise<void>;
  reportServiceProblem: (bookingId: string, problemType: 'poor_quality' | 'incomplete_work' | 'damage' | 'other', description: string, photos?: string[]) => Promise<void>;
  adminReviewProblem: (bookingId: string, reviewData: { siteVisitRequired?: boolean; siteVisitScheduledAt?: string; adminNotes?: string; resolved?: boolean; resolutionNotes?: string }) => Promise<void>;
  addServiceCategory: (cat: Partial<ServiceCategory>) => Promise<void>;
  updateServiceCategory: (id: string, cat: Partial<ServiceCategory>) => Promise<void>;
  addNewService: (serviceData: Partial<Service>) => Promise<void>;
  updateProviderRate: (serviceId: string, rateData: { price?: number; hourlyRate?: number; meteredRate?: number; pricingType?: PricingType; unit?: string; estimatedDurationHours?: number }) => Promise<void>;
  approveProviderRate: (serviceId: string, approved: boolean, adminNotes?: string) => Promise<void>;
  approveServiceListing: (serviceId: string, approved: boolean, adminNotes?: string) => Promise<void>;
  adminReviewProviderCancellation: (reviewId: string, adminNotes: string, status?: string) => Promise<void>;
  submitSpecialRequest: (title: string, category: string, description: string, budget: number, timeline: string) => SpecialRequest;
  updateSpecialRequest: (requestId: string, status: SpecialRequest['status'], adminNotes?: string, adminQuotation?: number) => void;
  approveSeller: (sellerId: string, approved: boolean) => void;
  approveProviderCategory: (providerId: string, categoryId: string, approved: boolean) => void;
  applyForSeller: (app: { storeName: string; businessType: string; gstin?: string; address: string; productCategory?: string; storeLogo?: string }) => Promise<void>;
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
  }) => Promise<void>;
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

  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(INITIAL_REGISTERED_USERS);

  const [addresses, setAddresses] = useState<SavedAddress[]>(INITIAL_ADDRESSES);

  const [selectedAddress, setSelectedAddress] = useState<SavedAddress>(
    () => INITIAL_ADDRESSES.find((a) => a.isDefault) || INITIAL_ADDRESSES[0]
  );

  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(INITIAL_SERVICE_CATEGORIES);
  const [providers, setProviders] = useState<ProviderDetail[]>(MOCK_PROVIDERS);
  const [providerCancellationReviews, setProviderCancellationReviews] = useState<ProviderCancellationReview[]>([]);

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

  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'orders' | 'account'>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProviderDetail, setSelectedProviderDetail] = useState<ProviderDetail | null>(null);
  const [chatPeerName, setChatPeerName] = useState<string | null>(null);
  const [trackingModalData, setTrackingModalData] = useState<{ title: string; partnerName: string; type: 'technician' | 'delivery'; bookingId?: string; booking?: Booking } | null>(null);
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

      const cloudCategories = await api.getServiceCategories();
      if (cloudCategories && cloudCategories.length > 0) setServiceCategories(cloudCategories);

      const cloudServices = await api.getServices();
      if (cloudServices && cloudServices.length > 0) setServices(cloudServices);

      const cloudCancellations = await api.getProviderCancellations();
      if (cloudCancellations && cloudCancellations.length > 0) setProviderCancellationReviews(cloudCancellations);
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

  const openTracking = (title: string, partnerName: string, type: 'technician' | 'delivery', bookingId?: string, booking?: Booking) => {
    setTrackingModalData({ title, partnerName, type, bookingId, booking });
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

  const cancelBooking = async (
    bookingId: string,
    reason = 'Customer cancelled slot',
    cancelData?: { stage?: string; workCompletedCharge?: number; materialsUsedCharge?: number; breakdown?: string; cancelledBy?: 'customer' | 'provider' | 'admin' }
  ) => {
    const existing = bookings.find((b) => b.id === bookingId);
    const cancelledBy = cancelData?.cancelledBy || (user.activeRole === 'provider' ? 'provider' : user.activeRole === 'admin' ? 'admin' : 'customer');
    const stage = cancelData?.stage || (existing?.status === 'in_progress' ? 'work_started' : 'after_assignment');

    let cancellationFee = 0;
    let finalTotal = 0;
    let replacementOffered = false;
    let repName = 'NSO Verified Specialist Network';

    if (cancelledBy === 'customer') {
      if (stage === 'before_assignment' || !existing?.providerAssigned) {
        cancellationFee = 0;
        finalTotal = 0;
      } else if (stage === 'work_started') {
        const workDone = Number(cancelData?.workCompletedCharge) || 0;
        const matDone = Number(cancelData?.materialsUsedCharge) || 0;
        finalTotal = workDone + matDone;
        cancellationFee = finalTotal;
      } else {
        cancellationFee = Math.min(150, Math.round((existing?.totalPrice || 0) * 0.2));
        finalTotal = cancellationFee;
      }
    } else if (cancelledBy === 'provider') {
      replacementOffered = true;
      finalTotal = 0;
      cancellationFee = 0;
    }

    const cancellationDetails: CancellationDetails = {
      cancelledBy,
      reason,
      stage: stage as any,
      cancellationFee,
      workCompletedCharge: cancelData?.workCompletedCharge,
      materialsUsedCharge: cancelData?.materialsUsedCharge,
      breakdown: cancelData?.breakdown,
      replacementProviderOffered: replacementOffered,
      replacementProviderId: replacementOffered ? 'prov_general_specialist_1' : undefined,
      replacementProviderName: replacementOffered ? repName : undefined,
      timestamp: new Date().toISOString()
    };

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'cancelled',
              paymentStatus: finalTotal > 0 ? b.paymentStatus : 'refunded',
              totalPrice: finalTotal,
              cancellationDetails
            }
          : b
      )
    );

    try {
      await api.cancelBooking(bookingId, {
        reason,
        stage,
        workCompletedCharge: cancelData?.workCompletedCharge,
        materialsUsedCharge: cancelData?.materialsUsedCharge,
        breakdown: cancelData?.breakdown
      });
    } catch {}

    addAuditLog('BOOKING_CANCELLED', `Service booking ${bookingId} cancelled by ${cancelledBy}. Fee: ₹${cancellationFee}`);
    if (replacementOffered) {
      showToast(`Booking cancelled. Replacement specialist (${repName}) is available.`);
    } else if (cancellationFee > 0) {
      showToast(`Booking cancelled. Billed ₹${cancellationFee} for work/materials used.`);
    } else {
      showToast(`Booking cancelled. Zero penalty applied.`);
    }
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
        if (isOwner) {
          localStorage.setItem('nso_admin_phone', '8310421121');
        }
        if (serverUser.phone) {
          localStorage.setItem('nso_user_phone', serverUser.phone.replace(/\D/g, '').slice(-10));
        }
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
      localStorage.setItem('nso_admin_phone', '8310421121');
      localStorage.setItem('nso_user_phone', '8310421121');
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
    localStorage.removeItem('nso_auth_token');
    localStorage.removeItem('nso_admin_phone');
    localStorage.removeItem('nso_user_phone');
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
    const isOwner = rawDigits.endsWith('8310421121');

    // Build authenticated user profile — preserve owner privileges if owner phone
    const newUser: UserProfile = {
      id: user.id || `usr_${Date.now()}`,
      name: data.name,
      email: `${rawDigits}@nso.in`,
      phone: cleanPhone,
      activeRole: isOwner ? 'admin' : 'customer',
      authorizedRoles: isOwner ? ['customer', 'admin', 'seller', 'provider'] : ['customer'],
      approvalStatus: 'approved',
      houseNumber: data.houseNumber,
      streetNumber: data.streetNumber,
      landmark: data.landmark,
      city: data.city,
      pincode: data.pincode,
      sellerStatus: isOwner ? 'approved' : 'none',
      providerStatus: isOwner ? 'approved' : 'none',
      adminVerified: isOwner,
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

  const applyForSeller = async (appData: { storeName: string; businessType: string; gstin?: string; address: string; productCategory?: string; storeLogo?: string }) => {
    setUser((prev) => ({
      ...prev,
      sellerStatus: 'pending',
      sellerApplication: {
        ...appData,
        submittedAt: new Date().toISOString().substring(0, 10)
      }
    }));
    try {
      await api.submitSellerApplication({
        ...appData,
        applicantName: user.name || 'Seller Applicant',
        applicantPhone: user.phone || localStorage.getItem('nso_user_phone') || ''
      });
    } catch (e) {
      console.error('Failed submitting seller application to server:', e);
    }
    addAuditLog('SELLER_APPLICATION_SUBMITTED', `Store "${appData.storeName}" submitted for Admin KYC approval.`);
    showToast('Seller Application Submitted! Awaiting Admin verification.');
  };

  const applyForProvider = async (appData: {
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
    try {
      await api.submitProviderApplication({
        ...appData,
        applicantName: user.name || 'Provider Applicant',
        applicantPhone: user.phone || localStorage.getItem('nso_user_phone') || ''
      });
    } catch (e) {
      console.error('Failed submitting provider application to server:', e);
    }
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
    api.approveProduct(productId, approved, reason);
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
   * Supports quotation-required, hourly time limits, and attachments.
   */
  const createBooking = async (
    serviceId: string,
    date: string,
    timeSlot: string,
    mode: 'home_visit' | 'provider_location',
    address: string,
    problemDescription?: string,
    problemPhoto?: string,
    requestType?: 'site_visit' | 'repair' | 'inspection',
    jobAttachments?: string[],
    hourlyApprovedTimeLimit?: number
  ): Promise<Booking | null> => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return null;

    const resolvedPricingType = service.pricingType || (service.requiresQuotation ? 'quotation_required' : 'fixed');
    const isQuotationRequired = resolvedPricingType === 'quotation_required';
    const isHourly = resolvedPricingType === 'hourly';

    const payload = {
      serviceId,
      date,
      timeSlot,
      mode,
      address,
      jobDescription: problemDescription || '',
      jobAttachments: jobAttachments || (problemPhoto ? [problemPhoto] : []),
      pricingType: resolvedPricingType,
      hourlyApprovedTimeLimit: hourlyApprovedTimeLimit || service.estimatedDurationHours || 2,
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
        b.status !== 'cancelled' &&
        b.status !== 'quotation_declined'
    );

    if (hasConflict) {
      showToast('Selected time slot conflicts with an existing booking for this provider.');
      return null;
    }

    let initialPrice = service.price;
    let initialStatus: BookingStatus = 'confirmed';
    let hourlyDetails: HourlyDetails | undefined;

    if (isQuotationRequired) {
      initialPrice = 0;
      initialStatus = 'assessing';
    } else if (isHourly) {
      const rate = service.hourlyRate || service.price || 300;
      const hours = hourlyApprovedTimeLimit || service.estimatedDurationHours || 2;
      initialPrice = rate * hours;
      hourlyDetails = {
        hourlyRate: rate,
        approvedTimeLimitHours: hours,
        timeUsedHours: 0,
        timerRunning: false,
        calculatedAmount: 0
      };
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
      status: initialStatus,
      paymentStatus: 'pending',
      totalPrice: initialPrice,
      pricingType: resolvedPricingType,
      jobDescription: problemDescription || '',
      jobAttachments: jobAttachments || (problemPhoto ? [problemPhoto] : []),
      providerAssigned: true,
      hourlyDetails,
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

  const updateOrderDeliveryFee = async (orderId: string, fee: number): Promise<boolean> => {
    const res = await api.updateOrderDeliveryFee(orderId, fee);
    if (res.success) {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          const newTotal = Math.max(0, o.subtotal + fee + o.platformFee + (o.tipAmount || 0) - (o.couponDiscount || 0));
          return {
            ...o,
            sellerDeliveryCharge: fee,
            total: newTotal
          };
        })
      );
      addAuditLog('DELIVERY_FEE_UPDATED', `Seller adjusted delivery fee for Order ${orderId} to ₹${fee}`);
      showToast(`✅ Delivery fee updated to ₹${fee} based on location.`);
      return true;
    }
    showToast('Failed to update delivery fee.');
    return false;
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

  // ── Quotation Workflow ──────────────────────────────────────────────────────

  const submitJobQuotation = async (bookingId: string, quoteData: Partial<JobQuotation>) => {
    const quote: JobQuotation = {
      id: `quote_${Date.now()}`,
      proposedWork: quoteData.proposedWork || 'Assessed service work',
      laborCost: Number(quoteData.laborCost) || 0,
      partsCost: Number(quoteData.partsCost) || 0,
      additionalFees: Number(quoteData.additionalFees) || 0,
      totalAmount: Number(quoteData.totalAmount) || ((Number(quoteData.laborCost) || 0) + (Number(quoteData.partsCost) || 0) + (Number(quoteData.additionalFees) || 0)),
      assumptions: quoteData.assumptions || 'Standard conditions',
      estimatedDuration: quoteData.estimatedDuration || '2 hours',
      expiryDate: quoteData.expiryDate || new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10),
      notes: quoteData.notes || '',
      status: 'pending_admin',
      submittedAt: new Date().toISOString()
    };

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, quotation: quote, status: 'quotation_admin_review' }
          : b
      )
    );

    try {
      await api.submitQuotation(bookingId, quote);
    } catch {}

    addAuditLog('QUOTATION_SUBMITTED', `Provider submitted itemized quotation of ₹${quote.totalAmount} for Booking ${bookingId}. Sent to Admin for review.`);
    showToast('Quotation submitted for Admin review.');
  };

  const adminReviewQuotation = async (bookingId: string, decision: 'approve' | 'return' | 'request_info', adminFeedback?: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId || !b.quotation) return b;
        const updatedQuote: JobQuotation = {
          ...b.quotation,
          status: decision === 'approve' ? 'admin_approved' : 'admin_returned',
          adminFeedback: adminFeedback || (decision === 'approve' ? 'Approved by Admin' : 'Returned for revision'),
          decidedAt: new Date().toISOString()
        };
        const nextStatus: BookingStatus = decision === 'approve' ? 'quotation_customer_review' : 'assessing';
        return {
          ...b,
          quotation: updatedQuote,
          status: nextStatus
        };
      })
    );

    try {
      await api.reviewQuotation(bookingId, decision, adminFeedback);
    } catch {}

    if (decision === 'approve') {
      addAuditLog('QUOTATION_ADMIN_APPROVED', `Admin approved quotation for Booking ${bookingId}. Sent to customer.`);
      showToast('Quotation approved and sent to customer.');
    } else {
      addAuditLog('QUOTATION_ADMIN_RETURNED', `Admin returned quotation for Booking ${bookingId}: ${adminFeedback}`);
      showToast('Quotation returned to provider for correction.');
    }
  };

  const customerDecideQuotation = async (bookingId: string, decision: 'accept' | 'request_changes' | 'decline', customerFeedback?: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId || !b.quotation) return b;
        const now = new Date().toISOString();
        if (decision === 'accept') {
          return {
            ...b,
            totalPrice: b.quotation.totalAmount,
            status: 'confirmed',
            quotation: { ...b.quotation, status: 'customer_accepted', decidedAt: now }
          };
        } else if (decision === 'request_changes') {
          return {
            ...b,
            status: 'assessing',
            quotation: { ...b.quotation, status: 'customer_changes_requested', customerFeedback, decidedAt: now }
          };
        } else {
          // Decline quotation carries no charge
          return {
            ...b,
            totalPrice: 0,
            status: 'quotation_declined',
            paymentStatus: 'refunded',
            quotation: { ...b.quotation, status: 'customer_declined', customerFeedback, decidedAt: now }
          };
        }
      })
    );

    try {
      await api.decideQuotation(bookingId, decision, customerFeedback);
    } catch {}

    if (decision === 'accept') {
      addAuditLog('QUOTATION_CUSTOMER_ACCEPTED', `Customer accepted quotation for Booking ${bookingId}. Work authorized to begin.`);
      showToast('Quotation accepted! Work is authorized to proceed.');
    } else if (decision === 'request_changes') {
      addAuditLog('QUOTATION_CUSTOMER_CHANGES', `Customer requested revisions on Booking ${bookingId}: ${customerFeedback}`);
      showToast('Changes requested. Provider notified.');
    } else {
      addAuditLog('QUOTATION_CUSTOMER_DECLINED', `Customer declined quotation for Booking ${bookingId}. Closed with ₹0 charges.`);
      showToast('Quotation declined. Zero charge applied.');
    }
  };

  // ── Hourly Work & Extra Time ────────────────────────────────────────────────

  const requestHourlyExtraTime = async (bookingId: string, requestedHours: number, reason: string, extraAmount?: number) => {
    const booking = bookings.find((b) => b.id === bookingId);
    const hourly = booking?.hourlyDetails || { hourlyRate: 300, approvedTimeLimitHours: 1, timeUsedHours: 1, calculatedAmount: 300 };
    const rate = hourly.hourlyRate || 300;
    const amount = extraAmount !== undefined ? extraAmount : (requestedHours * rate);

    const updatedHourly: HourlyDetails = {
      ...hourly,
      timerRunning: false,
      extraTimeRequest: {
        requestedHours,
        rate,
        reason,
        extraAmount: amount,
        status: 'pending_customer',
        requestedAt: new Date().toISOString()
      }
    };

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, hourlyDetails: updatedHourly, status: 'work_paused_extra_time' }
          : b
      )
    );

    try {
      await api.requestExtraTime(bookingId, { requestedHours, reason, extraAmount: amount });
    } catch {}

    addAuditLog('EXTRA_TIME_REQUESTED', `Provider paused Booking ${bookingId} and requested +${requestedHours} hrs (+₹${amount}): ${reason}`);
    showToast('Work paused. Customer approval requested for extra time.');
  };

  const customerDecideExtraTime = async (bookingId: string, approved: boolean) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId || !b.hourlyDetails?.extraTimeRequest) return b;
        const req = b.hourlyDetails.extraTimeRequest;
        const now = new Date().toISOString();

        if (approved) {
          const updatedHourly: HourlyDetails = {
            ...b.hourlyDetails,
            approvedTimeLimitHours: b.hourlyDetails.approvedTimeLimitHours + req.requestedHours,
            extraTimeRequest: { ...req, status: 'approved', decidedAt: now }
          };
          return {
            ...b,
            totalPrice: b.totalPrice + req.extraAmount,
            hourlyDetails: updatedHourly,
            status: 'in_progress'
          };
        } else {
          const updatedHourly: HourlyDetails = {
            ...b.hourlyDetails,
            extraTimeRequest: { ...req, status: 'declined', decidedAt: now }
          };
          return {
            ...b,
            hourlyDetails: updatedHourly,
            status: 'in_progress'
          };
        }
      })
    );

    try {
      await api.decideExtraTime(bookingId, approved);
    } catch {}

    if (approved) {
      addAuditLog('EXTRA_TIME_APPROVED', `Customer approved extra time on Booking ${bookingId}.`);
      showToast('Extra time approved! Provider may proceed.');
    } else {
      addAuditLog('EXTRA_TIME_DECLINED', `Customer declined extra time on Booking ${bookingId}.`);
      showToast('Extra time declined. Work continues under original limit.');
    }
  };

  const updateHourlyTimeUsed = async (bookingId: string, timeUsedHours: number, timerRunning?: boolean) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        const h = b.hourlyDetails || { hourlyRate: 300, approvedTimeLimitHours: 2, timeUsedHours: 0, calculatedAmount: 0 };
        const calc = Math.round(timeUsedHours * (h.hourlyRate || 300));
        return {
          ...b,
          hourlyDetails: {
            ...h,
            timeUsedHours,
            calculatedAmount: calc,
            timerRunning: timerRunning !== undefined ? timerRunning : h.timerRunning
          }
        };
      })
    );

    try {
      await api.updateTimeUsed(bookingId, timeUsedHours, timerRunning);
    } catch {}
  };

  // ── Completion & Problem Reporting ──────────────────────────────────────────

  const markServiceComplete = async (bookingId: string, completionNotes?: string) => {
    const now = new Date().toISOString();
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, status: 'completed_pending_review', completedAt: now, completionNotes }
          : b
      )
    );

    try {
      await api.markServiceComplete(bookingId, completionNotes);
    } catch {}

    addAuditLog('SERVICE_MARKED_COMPLETE', `Provider marked Booking ${bookingId} as completed. Customer notified.`);
    showToast('Job marked completed! Waiting for customer confirmation.');
  };

  const confirmServiceCompletion = async (bookingId: string, rating?: number, reviewComment?: string) => {
    const now = new Date().toISOString();
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'completed',
              paymentStatus: 'success',
              confirmedCompletedAt: now,
              rating: rating || b.rating,
              reviewComment: reviewComment || b.reviewComment
            }
          : b
      )
    );

    try {
      await api.confirmServiceCompletion(bookingId, rating, reviewComment);
    } catch {}

    addAuditLog('SERVICE_COMPLETED_CONFIRMED', `Customer confirmed completion for Booking ${bookingId}. Payment collected.`);
    showToast('Service confirmed complete! Payment processed.');
  };

  const reportServiceProblem = async (bookingId: string, problemType: 'poor_quality' | 'incomplete_work' | 'damage' | 'other', description: string, photos?: string[]) => {
    const problem: ReportedProblem = {
      id: `prob_${Date.now()}`,
      problemType,
      description,
      photos: photos || [],
      reportedAt: new Date().toISOString(),
      adminReviewStatus: 'under_review',
      siteVisitRequired: false
    };

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, status: 'problem_reported', reportedProblem: problem }
          : b
      )
    );

    try {
      await api.reportServiceProblem(bookingId, { problemType, description, photos });
    } catch {}

    addAuditLog('PROBLEM_REPORTED', `Customer reported issue on Booking ${bookingId} (${problemType}): ${description}. Job kept open.`);
    showToast('Problem reported to Admin. Booking remains open while investigated.');
  };

  const adminReviewProblem = async (bookingId: string, reviewData: { siteVisitRequired?: boolean; siteVisitScheduledAt?: string; adminNotes?: string; resolved?: boolean; resolutionNotes?: string }) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId || !b.reportedProblem) return b;
        const updatedProblem: ReportedProblem = {
          ...b.reportedProblem,
          siteVisitRequired: reviewData.siteVisitRequired !== undefined ? reviewData.siteVisitRequired : b.reportedProblem.siteVisitRequired,
          siteVisitScheduledAt: reviewData.siteVisitScheduledAt || b.reportedProblem.siteVisitScheduledAt,
          adminNotes: reviewData.adminNotes || b.reportedProblem.adminNotes,
          adminReviewStatus: reviewData.resolved ? 'resolved' : reviewData.siteVisitScheduledAt ? 'site_visit_scheduled' : b.reportedProblem.adminReviewStatus,
          resolutionNotes: reviewData.resolutionNotes || b.reportedProblem.resolutionNotes,
          clearedAt: reviewData.resolved ? new Date().toISOString() : b.reportedProblem.clearedAt
        };
        const nextStatus: BookingStatus = reviewData.resolved ? 'completed_pending_review' : b.status;
        return {
          ...b,
          reportedProblem: updatedProblem,
          status: nextStatus
        };
      })
    );

    try {
      await api.reviewReportedProblem(bookingId, reviewData);
    } catch {}

    addAuditLog('PROBLEM_ADMIN_REVIEWED', `Admin reviewed reported problem for Booking ${bookingId}: resolved=${reviewData.resolved}`);
    showToast(`Problem report updated.${reviewData.resolved ? ' Issue cleared.' : ''}`);
  };

  // ── Categories & Provider Rates Oversight ───────────────────────────────────

  const addServiceCategory = async (cat: Partial<ServiceCategory>) => {
    const newCat: ServiceCategory = {
      id: cat.id || `cat_${Date.now()}`,
      name: cat.name || 'New Category',
      icon: cat.icon || '🏷️',
      description: cat.description || '',
      subServices: cat.subServices || [],
      displayOrder: cat.displayOrder || 99,
      isActive: true
    };
    setServiceCategories((prev) => [...prev, newCat]);
    try {
      await api.saveServiceCategory(newCat);
    } catch {}
    addAuditLog('CATEGORY_ADDED', `Admin created category "${newCat.name}"`);
    showToast(`Category "${newCat.name}" created!`);
  };

  const updateServiceCategory = async (id: string, catData: Partial<ServiceCategory>) => {
    setServiceCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...catData } : c))
    );
    try {
      await api.updateServiceCategory(id, catData);
    } catch {}
    addAuditLog('CATEGORY_UPDATED', `Admin updated category ${id}`);
    showToast(`Category updated.`);
  };

  const addNewService = async (serviceData: Partial<Service>) => {
    const newSvc: Service = {
      id: serviceData.id || `svc_${Date.now()}`,
      title: serviceData.title || 'New Service',
      category: serviceData.category || 'Home repairs',
      price: Number(serviceData.price) || 299,
      unit: serviceData.unit || 'visit & inspection',
      pricingType: serviceData.pricingType || 'fixed',
      rateApprovalStatus: 'pending_admin',
      hourlyRate: serviceData.hourlyRate,
      meteredRate: serviceData.meteredRate,
      estimatedDurationHours: serviceData.estimatedDurationHours || 1,
      requiresQuotation: serviceData.requiresQuotation || serviceData.pricingType === 'quotation_required',
      subServiceName: serviceData.subServiceName,
      categoryId: serviceData.categoryId,
      providerId: user.id || 'prov_general_specialist_1',
      providerName: user.name || 'NSO Verified Specialist Network',
      providerRating: 5.0,
      providerJobsCompleted: 0,
      modes: serviceData.modes || ['home_visit'],
      description: serviceData.description || 'Verified doorstep service.',
      cancellationPolicy: serviceData.cancellationPolicy || 'Free cancellation before technician dispatch.',
      availableSlots: serviceData.availableSlots || ['09:00 AM - 11:00 AM', '11:30 AM - 01:30 PM', '02:30 PM - 04:30 PM', '05:00 PM - 07:00 PM'],
      approvedByAdmin: false,
      approvalStatus: 'pending_approval'
    };
    setServices((prev) => [newSvc, ...prev]);
    try {
      await api.createService(newSvc);
    } catch {}
    addAuditLog('SERVICE_SUBMITTED', `Service "${newSvc.title}" submitted for Admin review`);
    showToast(`Service submitted! Pending Admin approval.`);
  };

  const updateProviderRate = async (serviceId: string, rateData: { price?: number; hourlyRate?: number; meteredRate?: number; pricingType?: PricingType; unit?: string; estimatedDurationHours?: number }) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === serviceId
          ? {
              ...s,
              ...rateData,
              price: rateData.price !== undefined ? rateData.price : s.price,
              rateApprovalStatus: 'pending_admin'
            }
          : s
      )
    );
    try {
      await api.updateProviderRate(serviceId, rateData);
    } catch {}
    addAuditLog('RATE_UPDATE_SUBMITTED', `Provider submitted rate change for service ${serviceId}. Pending Admin review.`);
    showToast('Rate change submitted for Admin approval.');
  };

  const approveProviderRate = async (serviceId: string, approved: boolean, adminNotes?: string) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === serviceId
          ? { ...s, rateApprovalStatus: approved ? 'approved' : 'rejected' }
          : s
      )
    );
    try {
      await api.approveProviderRate(serviceId, approved, adminNotes);
    } catch {}
    addAuditLog('RATE_ADMIN_DECISION', `Admin marked rate for service ${serviceId} as ${approved ? 'APPROVED' : 'REJECTED'}`);
    showToast(`Rate change ${approved ? 'approved' : 'rejected'}.`);
  };

  const approveServiceListing = async (serviceId: string, approved: boolean, adminNotes?: string) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === serviceId
          ? {
              ...s,
              approvedByAdmin: approved,
              approvalStatus: approved ? 'approved' : 'rejected',
              rateApprovalStatus: approved ? 'approved' : 'rejected'
            }
          : s
      )
    );
    try {
      await api.approveService(serviceId, approved, adminNotes);
    } catch {}
    addAuditLog('SERVICE_LISTING_DECISION', `Admin ${approved ? 'approved' : 'rejected'} service listing ${serviceId}`);
    showToast(`Service listing ${approved ? 'approved' : 'rejected'}.`);
  };

  const adminReviewProviderCancellation = async (reviewId: string, adminNotes: string, status = 'reviewed') => {
    setProviderCancellationReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, adminNotes, status: status as any } : r))
    );
    try {
      await api.reviewProviderCancellation(reviewId, adminNotes, status);
    } catch {}
    addAuditLog('PROVIDER_CANCELLATION_REVIEWED', `Admin reviewed provider cancellation case ${reviewId}: ${adminNotes}`);
    showToast('Provider cancellation review saved.');
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
    api.deleteProduct(productId);
    addAuditLog('PRODUCT_DELETED', `Listing ${productId} removed from catalog`);
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
        serviceCategories,
        providers,
        providerCancellationReviews,
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
        updateOrderDeliveryFee,
        updateBookingStatus,
        updateBookingPaymentStatus,
        submitRevisedQuote,
        sendProviderQuotation,
        respondToRevisedQuote,
        submitJobQuotation,
        adminReviewQuotation,
        customerDecideQuotation,
        requestHourlyExtraTime,
        customerDecideExtraTime,
        updateHourlyTimeUsed,
        markServiceComplete,
        confirmServiceCompletion,
        reportServiceProblem,
        adminReviewProblem,
        addServiceCategory,
        updateServiceCategory,
        addNewService,
        updateProviderRate,
        approveProviderRate,
        approveServiceListing,
        adminReviewProviderCancellation,
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

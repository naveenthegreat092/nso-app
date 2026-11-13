import {
  Product,
  Order,
  Booking,
  SpecialRequest,
  UserProfile,
  Service,
  ServiceCategory,
  JobQuotation,
  HourlyDetails,
  ReportedProblem,
  ProviderCancellationReview
} from '../types';

// Dynamic API Base URL:
// In Web dev: Uses '/api' (proxied by Vite to port 5000)
// In Native APK / Production: Uses VITE_API_URL (e.g. cloud host or local network IP)
const getApiBase = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return `${envUrl.replace(/\/+$/, '')}/api`;
  }
  return '/api';
};

const API_BASE = getApiBase();

/** Default fetch options — always include session cookies */
const defaultOpts: RequestInit = { credentials: 'include' };

/** Helper to provide authentication headers (tokens and admin bypass) across web and native WebViews */
export const getAuthHeaders = (extra?: Record<string, string>): Record<string, string> => {
  const headers: Record<string, string> = { ...extra };
  const token = localStorage.getItem('nso_auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-session-token'] = token;
  }
  const adminPhone = localStorage.getItem('nso_admin_phone');
  if (adminPhone) {
    headers['x-admin-phone'] = adminPhone;
  }
  const userPhone = localStorage.getItem('nso_user_phone');
  if (userPhone) {
    headers['x-user-phone'] = userPhone;
  }
  return headers;
};

export const api = {
  // Health
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE}/health`, {
        ...defaultOpts,
        headers: getAuthHeaders()
      });
      return await res.json();
    } catch (e) {
      console.warn('Backend offline, using local fallback');
      return null;
    }
  },

  // ── Auth ────────────────────────────────────────────────────────────────────

  /**
   * POST /api/auth/send-otp
   * Asks the server to send a 6-digit OTP to the given phone number.
   */
  sendOtp: async (phone: string): Promise<{ success: boolean; message?: string; debugOtp?: string; error?: string } | null> => {
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to send verification code.' };
      }
      return data;
    } catch {
      return null;
    }
  },

  /**
   * POST /api/auth/verify-otp
   * Verifies the OTP the user entered. On success the server sets an
   * httpOnly session cookie and returns the authenticated UserProfile and session token.
   */
  verifyOtp: async (
    phone: string,
    otp: string
  ): Promise<{ success: boolean; user?: UserProfile; token?: string; signedToken?: string; error?: string } | null> => {
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid verification code.' };
      }
      if (data.token) {
        localStorage.setItem('nso_auth_token', data.token);
      } else if (data.signedToken) {
        localStorage.setItem('nso_auth_token', data.signedToken);
      }
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      localStorage.setItem('nso_user_phone', cleanPhone);
      if (cleanPhone === '8310421121') {
        localStorage.setItem('nso_admin_phone', cleanPhone);
      }
      return data;
    } catch {
      return null;
    }
  },

  /**
   * GET /api/auth/me
   * Returns the currently authenticated user based on session token or cookie.
   * Returns null if unauthenticated or backend is offline.
   */
  getMe: async (): Promise<UserProfile | null> => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        ...defaultOpts,
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * POST /api/auth/logout
   * Clears the server-side session.
   */
  logout: async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        ...defaultOpts,
        headers: getAuthHeaders(),
        method: 'POST'
      });
      localStorage.removeItem('nso_auth_token');
      localStorage.removeItem('nso_admin_phone');
      localStorage.removeItem('nso_user_phone');
      return res.ok;
    } catch {
      localStorage.removeItem('nso_auth_token');
      localStorage.removeItem('nso_admin_phone');
      localStorage.removeItem('nso_user_phone');
      return false;
    }
  },

  /**
   * POST /api/users/register
   * Submits a full customer profile (name, address, etc.) for the first time.
   */
  registerProfile: async (data: {
    name: string;
    phone: string;
    houseNumber: string;
    streetNumber: string;
    landmark: string;
    city: string;
    pincode: string;
  }): Promise<UserProfile | null> => {
    try {
      const res = await fetch(`${API_BASE}/users/register`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // ── Products ────────────────────────────────────────────────────────────────

  getProducts: async (): Promise<Product[] | null> => {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        ...defaultOpts,
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  createProduct: async (productData: Omit<Product, 'id'>): Promise<Product | null> => {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(productData)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  updateProductStock: async (productId: string, stock: number) => {
    try {
      await fetch(`${API_BASE}/products/${productId}/stock`, {
        ...defaultOpts,
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ stock })
      });
    } catch (e) {
      console.error(e);
    }
  },

  deleteProduct: async (productId: string) => {
    try {
      await fetch(`${API_BASE}/products/${productId}`, {
        ...defaultOpts,
        headers: getAuthHeaders(),
        method: 'DELETE'
      });
    } catch (e) {
      console.error(e);
    }
  },

  approveProduct: async (productId: string, approved: boolean, adminNotes?: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/products/${productId}/approve`, {
        ...defaultOpts,
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ approved, adminNotes })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ── Service Categories ──────────────────────────────────────────────────────

  getServiceCategories: async (): Promise<ServiceCategory[] | null> => {
    try {
      const res = await fetch(`${API_BASE}/service-categories`, {
        ...defaultOpts,
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  saveServiceCategory: async (categoryData: Partial<ServiceCategory>): Promise<ServiceCategory | null> => {
    try {
      const res = await fetch(`${API_BASE}/service-categories`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(categoryData)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  updateServiceCategory: async (id: string, categoryData: Partial<ServiceCategory>): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/service-categories/${id}`, {
        ...defaultOpts,
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(categoryData)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ── Services & Provider Rates ───────────────────────────────────────────────

  getServices: async (): Promise<Service[] | null> => {
    try {
      const res = await fetch(`${API_BASE}/services`, {
        ...defaultOpts,
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  createService: async (serviceData: Partial<Service>): Promise<Service | null> => {
    try {
      const res = await fetch(`${API_BASE}/services`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(serviceData)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  updateProviderRate: async (serviceId: string, rateData: { price?: number; hourlyRate?: number; meteredRate?: number; pricingType?: string; unit?: string; estimatedDurationHours?: number }): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/services/${serviceId}/rate`, {
        ...defaultOpts,
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(rateData)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  approveProviderRate: async (serviceId: string, approved: boolean, adminNotes?: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/services/${serviceId}/approve-rate`, {
        ...defaultOpts,
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ approved, adminNotes })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  approveService: async (serviceId: string, approved: boolean, adminNotes?: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/services/${serviceId}/approve`, {
        ...defaultOpts,
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ approved, adminNotes })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ── Orders ──────────────────────────────────────────────────────────────────

  getOrders: async (): Promise<Order[] | null> => {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        ...defaultOpts,
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  createOrder: async (orderData: any): Promise<Order | null> => {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(orderData)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  cancelOrder: async (orderId: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
        ...defaultOpts,
        headers: getAuthHeaders(),
        method: 'POST'
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        ...defaultOpts,
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  updateOrderDeliveryFee: async (orderId: string, deliveryFee: number): Promise<{ success: boolean; sellerDeliveryCharge?: number; total?: number }> => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/delivery-fee`, {
        ...defaultOpts,
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ deliveryFee })
      });
      if (!res.ok) return { success: false };
      const data = await res.json();
      return { success: true, ...data };
    } catch {
      return { success: false };
    }
  },

  // ── Bookings ────────────────────────────────────────────────────────────────

  getBookings: async (): Promise<Booking[] | null> => {
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        ...defaultOpts,
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  createBooking: async (bookingData: Partial<Booking>): Promise<Booking | null> => {
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(bookingData)
      });
      if (res.status === 409) return null; // slot conflict — handled by caller
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  cancelBooking: async (bookingId: string, cancelData?: { reason?: string; stage?: string; workCompletedCharge?: number; materialsUsedCharge?: number; breakdown?: string }): Promise<{ success: boolean; message?: string; cancellationDetails?: any }> => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
        ...defaultOpts,
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        method: 'POST',
        body: JSON.stringify(cancelData || {})
      });
      const data = await res.json().catch(() => ({}));
      return { success: res.ok, ...data };
    } catch {
      return { success: false };
    }
  },

  updateBookingStatus: async (bookingId: string, status: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/status`, {
        ...defaultOpts,
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ── Quotations ──────────────────────────────────────────────────────────────

  submitQuotation: async (bookingId: string, quoteData: Partial<JobQuotation>): Promise<{ success: boolean; quotation?: JobQuotation; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/quotation`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(quoteData)
      });
      const data = await res.json();
      return { success: res.ok, ...data };
    } catch {
      return { success: false, error: 'Network error submitting quotation.' };
    }
  },

  reviewQuotation: async (bookingId: string, decision: 'approve' | 'return' | 'request_info', adminFeedback?: string): Promise<{ success: boolean; quotation?: JobQuotation; status?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/quotation/admin-review`, {
        ...defaultOpts,
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ decision, adminFeedback })
      });
      const data = await res.json();
      return { success: res.ok, ...data };
    } catch {
      return { success: false };
    }
  },

  decideQuotation: async (bookingId: string, decision: 'accept' | 'request_changes' | 'decline', customerFeedback?: string): Promise<{ success: boolean; quotation?: JobQuotation; totalPrice?: number; status?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/quotation/customer-decision`, {
        ...defaultOpts,
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ decision, customerFeedback })
      });
      const data = await res.json();
      return { success: res.ok, ...data };
    } catch {
      return { success: false };
    }
  },

  // ── Hourly Work & Extra Time ────────────────────────────────────────────────

  requestExtraTime: async (bookingId: string, extraData: { requestedHours: number; reason: string; extraAmount?: number }): Promise<{ success: boolean; hourlyDetails?: HourlyDetails; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/hourly/extra-time`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(extraData)
      });
      const data = await res.json();
      return { success: res.ok, ...data };
    } catch {
      return { success: false, error: 'Network error requesting extra time.' };
    }
  },

  decideExtraTime: async (bookingId: string, approved: boolean): Promise<{ success: boolean; approved?: boolean; totalPrice?: number; hourlyDetails?: HourlyDetails }> => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/hourly/extra-time-decision`, {
        ...defaultOpts,
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ approved })
      });
      const data = await res.json();
      return { success: res.ok, ...data };
    } catch {
      return { success: false };
    }
  },

  updateTimeUsed: async (bookingId: string, timeUsedHours: number, timerRunning?: boolean): Promise<{ success: boolean; hourlyDetails?: HourlyDetails }> => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/hourly/time-used`, {
        ...defaultOpts,
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ timeUsedHours, timerRunning })
      });
      const data = await res.json();
      return { success: res.ok, ...data };
    } catch {
      return { success: false };
    }
  },

  // ── Completion & Problem Reporting ──────────────────────────────────────────

  markServiceComplete: async (bookingId: string, completionNotes?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/complete`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ completionNotes })
      });
      const data = await res.json();
      return { success: res.ok, ...data };
    } catch {
      return { success: false };
    }
  },

  confirmServiceCompletion: async (bookingId: string, rating?: number, reviewComment?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/confirm-completion`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ rating, reviewComment })
      });
      const data = await res.json();
      return { success: res.ok, ...data };
    } catch {
      return { success: false };
    }
  },

  reportServiceProblem: async (bookingId: string, problemData: { problemType: string; description: string; photos?: string[] }): Promise<{ success: boolean; reportedProblem?: ReportedProblem; message?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/report-problem`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(problemData)
      });
      const data = await res.json();
      return { success: res.ok, ...data };
    } catch {
      return { success: false };
    }
  },

  reviewReportedProblem: async (bookingId: string, reviewData: { siteVisitRequired?: boolean; siteVisitScheduledAt?: string; adminNotes?: string; resolved?: boolean; resolutionNotes?: string }): Promise<{ success: boolean; reportedProblem?: ReportedProblem; bookingStatus?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/problem/admin-review`, {
        ...defaultOpts,
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(reviewData)
      });
      const data = await res.json();
      return { success: res.ok, ...data };
    } catch {
      return { success: false };
    }
  },

  getReportedProblems: async (): Promise<any[] | null> => {
    try {
      const res = await fetch(`${API_BASE}/admin/problems`, {
        ...defaultOpts,
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  getProviderCancellations: async (): Promise<ProviderCancellationReview[] | null> => {
    try {
      const res = await fetch(`${API_BASE}/admin/provider-cancellations`, {
        ...defaultOpts,
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  reviewProviderCancellation: async (reviewId: string, adminNotes: string, status?: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/admin/provider-cancellations/${reviewId}`, {
        ...defaultOpts,
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ adminNotes, status })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ── Live GPS Tracking ────────────────────────────────────────────────────────

  /** Pay advance for a booking (marks advance as verified on server) */
  payBookingAdvance: async (bookingId: string, paymentDetails: { paymentMethod: string; paymentRef?: string }): Promise<{ success: boolean; booking?: Booking; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/pay-advance`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(paymentDetails)
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Advance payment failed.' };
      return { success: true, booking: data };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  /** Provider: start or stop sharing live location for a booking */
  toggleLocationSharing: async (bookingId: string, active: boolean): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/tracking`, {
        ...defaultOpts,
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ active })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Could not update tracking.' };
      return { success: true };
    } catch {
      return { success: false, error: 'Network error.' };
    }
  },

  /** Provider: stream current GPS position to server */
  sendProviderLocation: async (bookingId: string, coords: { lat: number; lng: number; heading?: number; speed?: number }): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/location`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(coords)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /** Customer / Provider: fetch current tracking state for a booking */
  getBookingLocation: async (bookingId: string): Promise<{
    status: 'awaiting_payment' | 'tracking_not_started' | 'provider_sharing' | 'provider_offline' | 'provider_location';
    serviceMode?: string;
    isLiveTrackingActive?: boolean;
    providerLat?: number;
    providerLng?: number;
    providerHeading?: number;
    providerSpeed?: number;
    customerLat?: number;
    customerLng?: number;
    customerAddress?: string;
    distanceKm?: number | null;
    etaMinutes?: number | null;
    providerName?: string;
    serviceTitle?: string;
    bookingStatus?: string;
    providerAddress?: string;
    directionsUrl?: string;
    advanceAmount?: number;
    message?: string;
    error?: string;
  } | null> => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/location`, {
        ...defaultOpts,
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { status: 'awaiting_payment', ...data };
      }
      return await res.json();
    } catch {
      return null;
    }
  },

  // ── Reset ───────────────────────────────────────────────────────────────────

  resetDatabase: async () => {
    try {
      await fetch(`${API_BASE}/reset`, {
        ...defaultOpts,
        headers: getAuthHeaders(),
        method: 'POST'
      });
    } catch (e) {
      console.error(e);
    }
  },

  // ── Special Requests ────────────────────────────────────────────────────────

  getSpecialRequests: async (): Promise<SpecialRequest[] | null> => {
    try {
      const res = await fetch(`${API_BASE}/special-requests`, {
        ...defaultOpts,
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // ── Applications (Seller & Provider Onboarding) ──────────────────────────

  getApplications: async (): Promise<any[] | null> => {
    try {
      const res = await fetch(`${API_BASE}/applications`, {
        ...defaultOpts,
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  submitSellerApplication: async (data: {
    storeName: string;
    businessType: string;
    gstin?: string;
    address: string;
    productCategory?: string;
    applicantName?: string;
    applicantPhone?: string;
  }): Promise<{ success: boolean; applicationId?: string; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/applications/seller`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || 'Failed to submit seller application' };
      }
      return result;
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error' };
    }
  },

  submitProviderApplication: async (data: {
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
    applicantName?: string;
    applicantPhone?: string;
  }): Promise<{ success: boolean; applicationId?: string; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/applications/provider`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || 'Failed to submit provider application' };
      }
      return result;
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error' };
    }
  },

  // ── Users (admin) ───────────────────────────────────────────────────────────

  getUsers: async (): Promise<UserProfile[] | null> => {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        ...defaultOpts,
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  approveUser: async (userId: string, approved: boolean): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/approve`, {
        ...defaultOpts,
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ approved })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  approveApplication: async (
    appId: string,
    approved: boolean,
    extra?: Record<string, unknown>
  ): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/applications/${appId}/approve`, {
        ...defaultOpts,
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ approved, ...extra })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ── PhonePe & Marketplace UPI Gateway ──────────────────────────────────────

  getPublicSettings: async (): Promise<{ merchantUpiId: string; phonepeMerchantId?: string; isConfigured?: boolean } | null> => {
    try {
      const res = await fetch(`${API_BASE}/settings/public`, { ...defaultOpts });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  updateMerchantUpi: async (upiId: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/settings/merchant-upi`, {
        ...defaultOpts,
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ upiId })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  initiatePhonePePayment: async (data: {
    amount: number;
    orderId?: string;
    bookingId?: string;
    customerPhone?: string;
    customerName?: string;
  }): Promise<{
    success: boolean;
    txnId?: string;
    merchantUpiId?: string;
    upiIntent?: string;
    qrUrl?: string;
    phonepeRedirectUrl?: string;
    error?: string;
  } | null> => {
    try {
      const res = await fetch(`${API_BASE}/payments/phonepe/initiate`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  checkPhonePePaymentStatus: async (txnId: string, confirm = false): Promise<{ success: boolean; status?: string } | null> => {
    try {
      const res = await fetch(`${API_BASE}/payments/phonepe/status/${txnId}?confirm=${confirm}`, {
        ...defaultOpts,
        headers: getAuthHeaders()
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // ── Password Auth & Registration ──────────────────────────────────────────

  registerCustomerWithPassword: async (data: {
    name: string;
    phone: string;
    password: string;
    username?: string;
    houseNumber?: string;
    streetNumber?: string;
    landmark?: string;
    city?: string;
    pincode?: string;
    address?: string;
  }): Promise<{ success: boolean; user?: UserProfile; token?: string; signedToken?: string; error?: string } | null> => {
    try {
      const res = await fetch(`${API_BASE}/auth/register-customer`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to complete registration.' };
      }
      if (resData.token) localStorage.setItem('nso_auth_token', resData.token);
      else if (resData.signedToken) localStorage.setItem('nso_auth_token', resData.signedToken);
      const clean = data.phone.replace(/\D/g, '').slice(-10);
      localStorage.setItem('nso_user_phone', clean);
      return resData;
    } catch {
      return null;
    }
  },

  loginWithPassword: async (data: {
    identifier: string;
    password: string;
  }): Promise<{ success: boolean; user?: UserProfile; token?: string; signedToken?: string; error?: string } | null> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login-password`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Invalid credentials.' };
      }
      if (resData.token) localStorage.setItem('nso_auth_token', resData.token);
      else if (resData.signedToken) localStorage.setItem('nso_auth_token', resData.signedToken);
      if (resData.user?.phone) {
        const clean = resData.user.phone.replace(/\D/g, '').slice(-10);
        localStorage.setItem('nso_user_phone', clean);
        if (clean === '8310421121') localStorage.setItem('nso_admin_phone', clean);
      }
      return resData;
    } catch {
      return null;
    }
  },

  setPassword: async (password: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/set-password`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ password })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  switchRole: async (role: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/switch-role`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ role })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  deleteUser: async (userId: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        ...defaultOpts,
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  getAdminProducts: async (): Promise<Product[] | null> => {
    try {
      const res = await fetch(`${API_BASE}/admin/products`, {
        ...defaultOpts,
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  getAdminServices: async (): Promise<Service[] | null> => {
    try {
      const res = await fetch(`${API_BASE}/admin/services`, {
        ...defaultOpts,
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  resubmitSellerApplication: async (id: string, data: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/applications/seller/${id}/resubmit`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  resubmitProviderApplication: async (id: string, data: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/applications/provider/${id}/resubmit`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  confirmOrderReceipt: async (orderId: string): Promise<{ success: boolean; orderStatus?: string; paymentStatus?: string; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/confirm-receipt`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders()
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  clearOrderPayment: async (orderId: string): Promise<{ success: boolean; orderStatus?: string; paymentStatus?: string; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/clear-payment`, {
        ...defaultOpts,
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  clearBookingPayment: async (bookingId: string): Promise<{ success: boolean; status?: string; paymentStatus?: string; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/clear-payment`, {
        ...defaultOpts,
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  createSpecialRequest: async (data: {
    title: string;
    category?: string;
    description: string;
    budget?: number;
    timeline?: string;
  }): Promise<{ success: boolean; ticketNumber?: string; error?: string } | null> => {
    try {
      const res = await fetch(`${API_BASE}/special-requests`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  getMessages: async (otherUserId?: string): Promise<any[]> => {
    try {
      const url = otherUserId ? `${API_BASE}/messages?otherUserId=${encodeURIComponent(otherUserId)}` : `${API_BASE}/messages`;
      const res = await fetch(url, {
        ...defaultOpts,
        headers: getAuthHeaders()
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  sendMessage: async (data: { receiverId: string; receiverName?: string; text: string }): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE}/messages`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  startCall: async (data: { receiverId: string; receiverName?: string; callType?: string }): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE}/calls/start`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  endCall: async (callId: string, durationSeconds: number, status?: string): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE}/calls/${callId}/end`, {
        ...defaultOpts,
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ durationSeconds, status })
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  getCallLogs: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${API_BASE}/admin/calls`, {
        ...defaultOpts,
        headers: getAuthHeaders()
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  getAdminChats: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${API_BASE}/admin/chats`, {
        ...defaultOpts,
        headers: getAuthHeaders()
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }
};

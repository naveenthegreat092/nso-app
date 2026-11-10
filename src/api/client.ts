import { Product, Order, Booking, SpecialRequest, UserProfile } from '../types';

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

  cancelBooking: async (bookingId: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
        ...defaultOpts,
        headers: getAuthHeaders(),
        method: 'POST'
      });
      return res.ok;
    } catch {
      return false;
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
  }
};

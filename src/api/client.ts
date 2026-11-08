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

export const api = {
  // Health
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE}/health`, defaultOpts);
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
        headers: { 'Content-Type': 'application/json' },
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
   * Verifies the OTP the user entered.  On success the server sets an
   * httpOnly session cookie and returns the authenticated UserProfile.
   */
  verifyOtp: async (
    phone: string,
    otp: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string } | null> => {
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        ...defaultOpts,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid verification code.' };
      }
      return data;
    } catch {
      return null;
    }
  },

  /**
   * GET /api/auth/me
   * Returns the currently authenticated user based on the session cookie.
   * Returns null if unauthenticated or backend is offline.
   */
  getMe: async (): Promise<UserProfile | null> => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, defaultOpts);
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
        method: 'POST'
      });
      return res.ok;
    } catch {
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
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`${API_BASE}/products`, defaultOpts);
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock })
      });
    } catch (e) {
      console.error(e);
    }
  },

  // ── Orders ──────────────────────────────────────────────────────────────────

  getOrders: async (): Promise<Order[] | null> => {
    try {
      const res = await fetch(`${API_BASE}/orders`, defaultOpts);
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`${API_BASE}/bookings`, defaultOpts);
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
      await fetch(`${API_BASE}/reset`, { ...defaultOpts, method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  },

  // ── Special Requests ────────────────────────────────────────────────────────

  getSpecialRequests: async (): Promise<SpecialRequest[] | null> => {
    try {
      const res = await fetch(`${API_BASE}/special-requests`, defaultOpts);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // ── Users (admin) ───────────────────────────────────────────────────────────

  getUsers: async (): Promise<UserProfile[] | null> => {
    try {
      const res = await fetch(`${API_BASE}/users`, defaultOpts);
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved, ...extra })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ── AI Assistant ─────────────────────────────────────────────────────────────

  askAI: async (prompt: string, apiKey?: string) => {
    // --- Try direct Gemini API call first if apiKey is provided ---
    if (apiKey && apiKey.trim().startsWith('AIza')) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are NSO Smart AI, a shopping and home services assistant for NSO (New Shopping Orbit), an Indian marketplace app. Help the customer with product comparisons, service recommendations, and advice. Keep responses short and practical. Customer question: ${prompt}`
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500
              }
            })
          }
        );
        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return { text, source: 'gemini-live' as const };
          }
        }
      } catch (geminiErr) {
        console.warn('Direct Gemini API failed, trying backend', geminiErr);
      }
    }

    // --- Try backend server ---
    try {
      const res = await fetch(`${API_BASE}/ai/ask`, {
        ...defaultOpts,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, apiKey })
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error('API askAI error:', err);
      return null;
    }
  }
};

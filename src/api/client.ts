import { Product, Order, Booking, SpecialRequest } from '../types';

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

export const api = {
  // Health
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch (e) {
      console.warn('Backend offline, using local fallback');
      return null;
    }
  },

  // Products
  getProducts: async (): Promise<Product[] | null> => {
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  createProduct: async (productData: Omit<Product, 'id'>): Promise<Product | null> => {
    try {
      const res = await fetch(`${API_BASE}/products`, {
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
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock })
      });
    } catch (e) {
      console.error(e);
    }
  },

  // Orders
  getOrders: async (): Promise<Order[] | null> => {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  createOrder: async (orderData: Partial<Order>): Promise<Order | null> => {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
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
      const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, { method: 'POST' });
      return res.ok;
    } catch {
      return false;
    }
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Bookings
  getBookings: async (): Promise<Booking[] | null> => {
    try {
      const res = await fetch(`${API_BASE}/bookings`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  createBooking: async (bookingData: Partial<Booking>): Promise<Booking | null> => {
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  cancelBooking: async (bookingId: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, { method: 'POST' });
      return res.ok;
    } catch {
      return false;
    }
  },

  updateBookingStatus: async (bookingId: string, status: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Reset
  resetDatabase: async () => {
    try {
      await fetch(`${API_BASE}/reset`, { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  },

  // AI Assistant — tries backend first, then falls back to direct Gemini API
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

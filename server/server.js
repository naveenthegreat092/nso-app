import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(express.json());

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial Seeds
const DEFAULT_PRODUCTS = [
  {
    id: 'prod_earbuds_01',
    title: 'Orbit Sound Pro Wireless Earbuds (ANC 32dB)',
    category: 'Electronics',
    price: 1899,
    originalPrice: 3999,
    discountPercentage: 52,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 342,
    stock: 45,
    sellerId: 'sell_orbit_tech',
    sellerName: 'Orbit Electronics Store',
    deliveryEstimateDays: 2,
    regionalDeliveryFee: 49,
    variants: [
      { id: 'v_black', name: 'Midnight Black', inStock: true },
      { id: 'v_white', name: 'Pearl White', inStock: true }
    ],
    description: 'High-fidelity audio with 32dB Active Noise Cancellation, 38-hour playtime with fast-charge case, and ultra-low latency gaming mode.',
    highlights: ['32dB Active Noise Cancellation', '38-Hour Battery Life', 'Bluetooth 5.4 Quick Pair', 'IPX5 Water Resistant'],
    approvalStatus: 'approved'
  },
  {
    id: 'prod_smartwatch_02',
    title: 'Orbit Fit Track AMOLED Smartwatch (Bluetooth Calling)',
    category: 'Electronics',
    price: 2999,
    originalPrice: 5999,
    discountPercentage: 50,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewsCount: 189,
    stock: 28,
    sellerId: 'sell_orbit_tech',
    sellerName: 'Orbit Electronics Store',
    deliveryEstimateDays: 2,
    regionalDeliveryFee: 0,
    variants: [
      { id: 'v_silicone', name: 'Obsidian Black', inStock: true },
      { id: 'v_metal', name: 'Titanium Silver', inStock: true, priceModifier: 300 }
    ],
    description: '1.96" vivid AMOLED curved display with continuous heart rate monitor, blood oxygen SpO2, and crystal-clear Bluetooth calling.',
    highlights: ['1.96" AMOLED Always-on Display', 'Clear Bluetooth Calling', '100+ Sports Tracking Modes', '7-Day Battery Life'],
    approvalStatus: 'approved'
  },
  {
    id: 'prod_oil_03',
    title: 'Wood-Pressed Traditional Groundnut Oil (5 Litre Tin)',
    category: 'Groceries',
    price: 1350,
    originalPrice: 1650,
    discountPercentage: 18,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 520,
    stock: 60,
    sellerId: 'sell_organic_farms',
    sellerName: 'Karnataka Agro Collective',
    deliveryEstimateDays: 1,
    regionalDeliveryFee: 30,
    variants: [{ id: 'v_5l', name: '5 Litres Tin Can', inStock: true }],
    description: '100% pure cold-pressed unrefined groundnut oil extracted using traditional wooden ghani. Preserves natural nutrients, native aroma, and heart-healthy antioxidants.',
    highlights: ['Traditional Wood Churned', 'Zero Chemicals & Unrefined', 'Rich in Vitamin E', 'Authentic Indian Aroma'],
    approvalStatus: 'approved'
  },
  {
    id: 'prod_linen_shirt_04',
    title: 'Pure Organic Breathable Linen Relaxed Shirt',
    category: 'Fashion',
    price: 1299,
    originalPrice: 2299,
    discountPercentage: 43,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80',
    rating: 4.6,
    reviewsCount: 210,
    stock: 35,
    sellerId: 'sell_orbit_threads',
    sellerName: 'Orbit Threadworks',
    deliveryEstimateDays: 3,
    regionalDeliveryFee: 40,
    variants: [
      { id: 'v_m', name: 'Size M - Olive Green', inStock: true },
      { id: 'v_l', name: 'Size L - Olive Green', inStock: true },
      { id: 'v_xl', name: 'Size XL - Sand Beige', inStock: true }
    ],
    description: '100% natural organic linen crafted for tropical all-day comfort. Pre-washed for a soft feel without color fading.',
    highlights: ['100% Certified Linen', 'Open Breathable Weave', 'Machine Washable', 'Tailored Casual Silhouette'],
    approvalStatus: 'approved'
  },
  {
    id: 'prod_coffee_machine_05',
    title: 'Barista 15-Bar Espresso Machine & Steam Frother',
    category: 'Home & Living',
    price: 4999,
    originalPrice: 8999,
    discountPercentage: 44,
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 145,
    stock: 15,
    sellerId: 'sell_orbit_tech',
    sellerName: 'Home Crafters India',
    deliveryEstimateDays: 2,
    regionalDeliveryFee: 0,
    variants: [{ id: 'v_silver', name: 'Brushed Steel', inStock: true }],
    description: 'Commercial-grade 15-bar Italian pressure pump delivers velvety espresso crema. Features high-pressure steam wand for cafe-style cappuccinos and lattes.',
    highlights: ['15-Bar Italian Pump', 'Professional Steam Wand', '1.5L Removable Water Tank', 'Dual Temperature Control'],
    approvalStatus: 'approved'
  },
  {
    id: 'prod_bottle_06',
    title: 'Vacuum Insulated Stainless Steel Flask (1000ml)',
    category: 'Home & Living',
    price: 749,
    originalPrice: 1299,
    discountPercentage: 42,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 380,
    stock: 50,
    sellerId: 'sell_orbit_tech',
    sellerName: 'Home Crafters India',
    deliveryEstimateDays: 2,
    regionalDeliveryFee: 30,
    variants: [
      { id: 'v_matte_black', name: 'Matte Black', inStock: true },
      { id: 'v_steel', name: 'Brushed Silver', inStock: true }
    ],
    description: 'Double-walled vacuum insulation keeps beverages cold for 24 hours and piping hot for 12 hours. 100% leak-proof lid with food-grade 304 steel.',
    highlights: ['24-Hour Cold / 12-Hour Hot', '18/8 Food Grade Steel', '100% Leak-Proof Cap', 'BPA Free & Non-Toxic'],
    approvalStatus: 'approved'
  }
];

const DEFAULT_SERVICES = [
  {
    id: 'serv_plumbing_01',
    title: 'Tap Leakage, Drain Clog & Pipeline Diagnostics',
    category: 'Plumbing',
    price: 299,
    unit: 'inspection & minor repair',
    providerId: 'prov_rajesh_plumb',
    providerName: 'Rajesh Sharma (Master Plumber)',
    providerRating: 4.9,
    providerJobsCompleted: 312,
    modes: ['home_visit'],
    description: 'Complete inspection of bathroom & kitchen taps, flush valves, concealed leakage detection, and drain clearing with genuine spare parts.',
    cancellationPolicy: 'Free cancellation up to 2 hours before scheduled slot.',
    availableSlots: ['09:00 AM - 11:00 AM', '11:30 AM - 01:30 PM', '02:30 PM - 04:30 PM', '05:00 PM - 07:00 PM'],
    approvedByAdmin: true,
    approvalStatus: 'approved'
  },
  {
    id: 'serv_electrical_02',
    title: 'Switchboard, Fan & MCB Trip Troubleshooting',
    category: 'Electrical',
    price: 349,
    unit: 'visit & diagnostics',
    providerId: 'prov_suresh_elect',
    providerName: 'Suresh Kumar (Licensed Wireman)',
    providerRating: 4.8,
    providerJobsCompleted: 450,
    modes: ['home_visit'],
    description: 'Professional diagnosis of frequent tripping, burnt switchboard sockets, inverter/UPS line connectivity, and ceiling fan noise troubleshooting.',
    cancellationPolicy: 'Free cancellation up to 2 hours before scheduled slot.',
    availableSlots: ['10:00 AM - 12:00 PM', '01:00 PM - 03:00 PM', '04:00 PM - 06:00 PM'],
    approvedByAdmin: true,
    approvalStatus: 'approved'
  },
  {
    id: 'serv_cleaning_03',
    title: 'Deep Home Sanitization & Bathroom Descaling',
    category: 'Cleaning',
    price: 1499,
    unit: '2 BHK complete deep scrub',
    providerId: 'prov_anita_clean',
    providerName: 'Anita Devi (SparklePro Hygiene)',
    providerRating: 4.9,
    providerJobsCompleted: 180,
    modes: ['home_visit'],
    description: 'Hospital-grade mechanized scrubbing of hard-water tile stains, kitchen degreasing, germ sanitization, and mirror polishing.',
    cancellationPolicy: 'Free cancellation up to 4 hours before scheduled slot.',
    availableSlots: ['08:30 AM - 01:00 PM', '02:00 PM - 06:30 PM'],
    approvedByAdmin: true,
    approvalStatus: 'approved'
  },
  {
    id: 'serv_carpentry_04',
    title: 'Door Lock, Hinges & Custom Wardrobe Repair',
    category: 'Carpentry',
    price: 399,
    unit: 'fitting & alignment',
    providerId: 'prov_manoj_carp',
    providerName: 'Manoj S. (Woodcraft Specialist)',
    providerRating: 4.7,
    providerJobsCompleted: 220,
    modes: ['home_visit'],
    description: 'Precision alignment of hydraulic door closers, deadbolt installation, sagging drawer channels, and termite-resistant hinge fixes.',
    cancellationPolicy: 'Free cancellation up to 2 hours before slot.',
    availableSlots: ['09:30 AM - 12:00 PM', '02:30 PM - 05:00 PM'],
    approvedByAdmin: true,
    approvalStatus: 'approved'
  }
];

const DEFAULT_ORDERS = [];

const DEFAULT_BOOKINGS = [];

// Helper to read/write DB
function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialDB = {
      products: DEFAULT_PRODUCTS,
      services: DEFAULT_SERVICES,
      orders: DEFAULT_ORDERS,
      bookings: DEFAULT_BOOKINGS,
      specialRequests: [],
      applications: [],
      users: [],
      commission: {
        productsRate: 10,
        servicesRate: 15,
        totalEarned: 0,
        transactions: []
      },
      auditLogs: [
        {
          id: 'log_init',
          timestamp: new Date().toISOString(),
          actor: 'System Superadmin',
          action: 'SYSTEM_BOOT',
          details: 'NSO Cloud Database initialized successfully.'
        }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2));
    return initialDB;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (e) {
    return { products: DEFAULT_PRODUCTS, services: DEFAULT_SERVICES, orders: [], bookings: [], specialRequests: [], auditLogs: [] };
  }
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// ─── API ROUTES ───

// Health check with real-time database stats
app.get('/api/health', (req, res) => {
  const db = loadDB();
  res.json({
    status: 'online',
    app: 'NSO (New Shopping Orbit) Cloud API',
    version: '1.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    stats: {
      productsCount: db.products?.length || 0,
      ordersCount: db.orders?.length || 0,
      bookingsCount: db.bookings?.length || 0,
      specialRequestsCount: db.specialRequests?.length || 0
    },
    timestamp: new Date().toISOString()
  });
});

// Products
app.get('/api/products', (req, res) => {
  const db = loadDB();
  res.json(db.products);
});

app.post('/api/products', (req, res) => {
  const db = loadDB();
  const newProduct = {
    ...req.body,
    id: `prod_${Date.now()}`
  };
  db.products.unshift(newProduct);
  saveDB(db);
  res.status(201).json(newProduct);
});

app.patch('/api/products/:id/stock', (req, res) => {
  const db = loadDB();
  const { stock } = req.body;
  const prod = db.products.find((p) => p.id === req.params.id);
  if (prod) {
    prod.stock = stock;
    saveDB(db);
    return res.json(prod);
  }
  res.status(404).json({ error: 'Product not found' });
});

// Services
app.get('/api/services', (req, res) => {
  const db = loadDB();
  res.json(db.services);
});

// Orders
app.get('/api/orders', (req, res) => {
  const db = loadDB();
  res.json(db.orders);
});

app.post('/api/orders', (req, res) => {
  const db = loadDB();
  const newOrder = {
    ...req.body,
    id: `ord_${Date.now()}`,
    orderNumber: `NSO-ORD-${Math.floor(10000 + Math.random() * 90000)}`,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
  db.orders.unshift(newOrder);
  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: newOrder.customerName || 'Customer',
    action: 'ORDER_PLACED',
    details: `Order ${newOrder.orderNumber} placed for ₹${newOrder.total}`
  });
  saveDB(db);
  res.status(201).json(newOrder);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const db = loadDB();
  const { status } = req.body;
  const ord = db.orders.find((o) => o.id === req.params.id);
  if (ord) {
    ord.orderStatus = status;
    saveDB(db);
    return res.json(ord);
  }
  res.status(404).json({ error: 'Order not found' });
});

app.post('/api/orders/:id/cancel', (req, res) => {
  const db = loadDB();
  const ord = db.orders.find((o) => o.id === req.params.id);
  if (ord) {
    ord.orderStatus = 'cancelled';
    ord.paymentStatus = 'refunded';
    db.auditLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: ord.customerName,
      action: 'ORDER_CANCELLED',
      details: `Order ${ord.orderNumber} cancelled by customer. 100% refund credited.`
    });
    saveDB(db);
    return res.json(ord);
  }
  res.status(404).json({ error: 'Order not found' });
});

// Bookings
app.get('/api/bookings', (req, res) => {
  const db = loadDB();
  res.json(db.bookings);
});

app.post('/api/bookings', (req, res) => {
  const db = loadDB();
  const newBooking = {
    ...req.body,
    id: `bk_${Date.now()}`,
    bookingNumber: `NSO-SRV-${Math.floor(10000 + Math.random() * 90000)}`
  };
  db.bookings.unshift(newBooking);
  saveDB(db);
  res.status(201).json(newBooking);
});

app.patch('/api/bookings/:id/status', (req, res) => {
  const db = loadDB();
  const { status } = req.body;
  const b = db.bookings.find((item) => item.id === req.params.id);
  if (b) {
    b.status = status;
    saveDB(db);
    return res.json(b);
  }
  res.status(404).json({ error: 'Booking not found' });
});

app.post('/api/bookings/:id/cancel', (req, res) => {
  const db = loadDB();
  const b = db.bookings.find((item) => item.id === req.params.id);
  if (b) {
    b.status = 'cancelled';
    b.paymentStatus = 'refunded';
    saveDB(db);
    return res.json(b);
  }
  res.status(404).json({ error: 'Booking not found' });
});

// Special Requests
app.get('/api/special-requests', (req, res) => {
  const db = loadDB();
  res.json(db.specialRequests);
});

app.post('/api/special-requests', (req, res) => {
  const db = loadDB();
  const newReq = {
    ...req.body,
    id: `spec_${Date.now()}`,
    ticketNumber: `SR-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'submitted',
    createdAt: new Date().toISOString().substring(0, 10)
  };
  db.specialRequests.unshift(newReq);
  saveDB(db);
  res.status(201).json(newReq);
});

// AI Assistant Endpoint (Powered by Gemini API with Smart Catalog RAG)
app.post('/api/ai/ask', async (req, res) => {
  try {
    const { prompt, history, apiKey: clientKey } = req.body;
    const db = loadDB();
    const apiKey = clientKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const availableProducts = db.products.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      price: p.price,
      rating: p.rating,
      description: p.description
    }));

    const availableServices = db.services.map(s => ({
      id: s.id,
      title: s.title,
      category: s.category,
      price: s.price,
      providerName: s.providerName,
      description: s.description
    }));

    // If Gemini API Key is available, call live Google Gemini API
    if (apiKey) {
      try {
        const systemPrompt = `You are NSO AI, an expert e-commerce and local services assistant for NewShopping Orbit.
You have direct access to our live inventory. Recommend only items from this catalog:
PRODUCTS: ${JSON.stringify(availableProducts)}
SERVICES: ${JSON.stringify(availableServices)}

Output strictly valid JSON with this exact schema:
{
  "text": "friendly, helpful response explaining your recommendations and rationale",
  "comparison": {
    "type": "product" or "service",
    "items": [
      {
        "id": "exact catalog id",
        "title": "item title",
        "price": number,
        "rating": number,
        "badge": "e.g. Best Value, Top Pick, Instant Match",
        "matchReason": "short explanation why it matches"
      }
    ]
  },
  "recommendedItem": {
    "id": "top item catalog id",
    "title": "item title",
    "price": number,
    "type": "product" or "service",
    "reason": "why this is the #1 pick"
  },
  "bundleDeal": null or {
    "title": "bundle title",
    "totalPrice": number,
    "savings": number,
    "itemIds": ["prod_id_1", "prod_id_2"],
    "items": [{"id": "...", "title": "...", "price": number}]
  }
}`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nUser Question: "${prompt}"` }]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.3
            }
          })
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return res.json({ source: 'gemini-live', ...parsed });
          }
        } else {
          console.warn('Gemini API call returned non-200, falling back to smart semantic catalog matcher');
        }
      } catch (err) {
        console.error('Gemini error, using fallback:', err.message);
      }
    }

    // Smart Catalog Semantic RAG Fallback (Instant, Zero Latency)
    const lower = prompt.toLowerCase();
    const isService = lower.includes('plumb') || lower.includes('repair') || lower.includes('clean') || lower.includes('electric') || lower.includes('salon') || lower.includes('service') || lower.includes('leak');
    const isBundle = lower.includes('bundle') || lower.includes('combo') || lower.includes('wfh') || lower.includes('pack');

    if (isBundle) {
      const p1 = db.products[0];
      const p2 = db.products[1] || db.products[0];
      const savings = 350;
      const total = p1.price + p2.price - savings;
      return res.json({
        source: 'smart-catalog-rag',
        text: `Here is a curated Smart Productivity Bundle tailored to "${prompt}", combining top-rated gear with an exclusive ₹${savings} discount:`,
        bundleDeal: {
          title: 'NSO Executive Productivity Bundle',
          totalPrice: total,
          savings,
          itemIds: [p1.id, p2.id],
          items: [
            { id: p1.id, title: p1.title, price: p1.price },
            { id: p2.id, title: p2.title, price: p2.price }
          ]
        },
        recommendedItem: {
          id: p1.id,
          title: p1.title,
          price: p1.price,
          type: 'product',
          reason: 'Flagship product with active noise cancellation and verified customer satisfaction.'
        }
      });
    }

    if (isService) {
      const matched = db.services.find(s => lower.includes(s.category.toLowerCase()) || lower.includes(s.title.toLowerCase())) || db.services[0];
      return res.json({
        source: 'smart-catalog-rag',
        text: `I scanned our verified technicians network. Here is the highest-rated on-time specialist for your request:`,
        comparison: {
          type: 'service',
          items: [
            {
              id: matched.id,
              title: matched.title,
              price: matched.price,
              rating: matched.providerRating,
              badge: 'Verified & Background-Checked',
              matchReason: `${matched.providerJobsCompleted}+ completed jobs, 4.9★ rating with zero overlap conflicts.`
            }
          ]
        },
        recommendedItem: {
          id: matched.id,
          title: matched.title,
          price: matched.price,
          type: 'service',
          reason: `Certified specialist ${matched.providerName} available for instant slot booking today.`
        }
      });
    }

    // Default: Product Matcher
    const matchedProd = db.products.find(p => lower.includes(p.category.toLowerCase()) || lower.includes(p.title.toLowerCase()) || lower.includes(p.description.toLowerCase())) || db.products[0];
    return res.json({
      source: 'smart-catalog-rag',
      text: `Based on verified seller reliability and real-time inventory, here is the top recommendation matching "${prompt}":`,
      comparison: {
        type: 'product',
        items: [
          {
            id: matchedProd.id,
            title: matchedProd.title,
            price: matchedProd.price,
            rating: matchedProd.rating,
            badge: `${matchedProd.discountPercentage}% OFF Deal`,
            matchReason: `${matchedProd.description.substring(0, 75)}... Fast regional delivery.`
          }
        ]
      },
      recommendedItem: {
        id: matchedProd.id,
        title: matchedProd.title,
        price: matchedProd.price,
        type: 'product',
        reason: `${matchedProd.title} has a top rating of ${matchedProd.rating}★ with manufacturer warranty.`
      }
    });
  } catch (err) {
    console.error('AI route error:', err);
    res.status(500).json({ error: 'AI processing error' });
  }
});

// ─── USER REGISTRATION (cloud-persisted) ───
app.get('/api/users', (req, res) => {
  const db = loadDB();
  res.json(db.users || []);
});

app.post('/api/users/register', (req, res) => {
  const db = loadDB();
  if (!db.users) db.users = [];
  const existing = db.users.find(u => u.phone === req.body.phone);
  if (existing) return res.json(existing);
  const newUser = {
    ...req.body,
    id: `usr_${Date.now()}`,
    providerStatus: 'none',
    sellerStatus: 'none',
    createdAt: new Date().toISOString()
  };
  db.users.unshift(newUser);
  db.auditLogs.unshift({ id: `log_${Date.now()}`, timestamp: new Date().toISOString(), actor: newUser.name || newUser.phone, action: 'USER_REGISTERED', details: `New customer registered: ${newUser.phone}` });
  saveDB(db);
  res.status(201).json(newUser);
});

app.patch('/api/users/:id', (req, res) => {
  const db = loadDB();
  if (!db.users) db.users = [];
  const idx = db.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  db.users[idx] = { ...db.users[idx], ...req.body };
  saveDB(db);
  res.json(db.users[idx]);
});

// ─── PROVIDER / SELLER APPLICATIONS ───
app.get('/api/applications', (req, res) => {
  const db = loadDB();
  res.json(db.applications || []);
});

app.post('/api/applications/provider', (req, res) => {
  const db = loadDB();
  if (!db.applications) db.applications = [];
  const app_ = {
    ...req.body,
    id: `app_${Date.now()}`,
    type: 'provider',
    status: 'pending',
    submittedAt: new Date().toISOString()
  };
  db.applications.unshift(app_);
  db.auditLogs.unshift({ id: `log_${Date.now()}`, timestamp: new Date().toISOString(), actor: req.body.applicantName || 'Unknown', action: 'PROVIDER_APPLICATION', details: `Provider application submitted: ${req.body.tradeCategory}` });
  saveDB(db);
  res.status(201).json(app_);
});

app.post('/api/applications/seller', (req, res) => {
  const db = loadDB();
  if (!db.applications) db.applications = [];
  const app_ = {
    ...req.body,
    id: `app_${Date.now()}`,
    type: 'seller',
    status: 'pending',
    submittedAt: new Date().toISOString()
  };
  db.applications.unshift(app_);
  db.auditLogs.unshift({ id: `log_${Date.now()}`, timestamp: new Date().toISOString(), actor: req.body.applicantName || 'Unknown', action: 'SELLER_APPLICATION', details: `Seller application submitted: ${req.body.storeName}` });
  saveDB(db);
  res.status(201).json(app_);
});

app.patch('/api/applications/:id/approve', (req, res) => {
  const db = loadDB();
  if (!db.applications) db.applications = [];
  const appl = db.applications.find(a => a.id === req.params.id);
  if (!appl) return res.status(404).json({ error: 'Application not found' });
  appl.status = req.body.approved ? 'approved' : 'rejected';
  appl.reviewedAt = new Date().toISOString();
  appl.adminNotes = req.body.adminNotes || '';
  // Also update user record if exists
  if (!db.users) db.users = [];
  const user = db.users.find(u => u.phone === appl.applicantPhone);
  if (user) {
    if (appl.type === 'provider') user.providerStatus = appl.status;
    if (appl.type === 'seller') user.sellerStatus = appl.status;
  }
  db.auditLogs.unshift({ id: `log_${Date.now()}`, timestamp: new Date().toISOString(), actor: 'Admin', action: appl.status === 'approved' ? 'APPLICATION_APPROVED' : 'APPLICATION_REJECTED', details: `${appl.type} application ${appl.status}: ${appl.applicantName}` });
  saveDB(db);
  res.json(appl);
});

// ─── SERVICES POSTED BY PROVIDERS (need Admin approval) ───
app.post('/api/services', (req, res) => {
  const db = loadDB();
  const newService = {
    ...req.body,
    id: `svc_${Date.now()}`,
    approvalStatus: 'pending_approval',
    createdAt: new Date().toISOString()
  };
  db.services.unshift(newService);
  db.auditLogs.unshift({ id: `log_${Date.now()}`, timestamp: new Date().toISOString(), actor: req.body.providerName || 'Provider', action: 'SERVICE_SUBMITTED', details: `Service submitted for approval: ${req.body.title}` });
  saveDB(db);
  res.status(201).json(newService);
});

app.patch('/api/services/:id/approve', (req, res) => {
  const db = loadDB();
  const svc = db.services.find(s => s.id === req.params.id);
  if (!svc) return res.status(404).json({ error: 'Service not found' });
  svc.approvalStatus = req.body.approved ? 'approved' : 'rejected';
  saveDB(db);
  res.json(svc);
});

// ─── PRODUCTS POSTED BY SELLERS (need Admin approval) ───
app.patch('/api/products/:id/approve', (req, res) => {
  const db = loadDB();
  const prod = db.products.find(p => p.id === req.params.id);
  if (!prod) return res.status(404).json({ error: 'Product not found' });
  prod.approvalStatus = req.body.approved ? 'approved' : 'rejected';
  saveDB(db);
  res.json(prod);
});

// ─── COMMISSION SETTINGS ───
app.get('/api/commission', (req, res) => {
  const db = loadDB();
  res.json(db.commission || { productsRate: 10, servicesRate: 15, totalEarned: 0, transactions: [] });
});

app.patch('/api/commission/settings', (req, res) => {
  const db = loadDB();
  if (!db.commission) db.commission = { productsRate: 10, servicesRate: 15, totalEarned: 0, transactions: [] };
  db.commission.productsRate = req.body.productsRate ?? db.commission.productsRate;
  db.commission.servicesRate = req.body.servicesRate ?? db.commission.servicesRate;
  saveDB(db);
  res.json(db.commission);
});

// ─── PAYMENT STATUS UPDATE ───
app.patch('/api/orders/:id/payment', (req, res) => {
  const db = loadDB();
  const ord = db.orders.find(o => o.id === req.params.id);
  if (!ord) return res.status(404).json({ error: 'Order not found' });
  ord.paymentStatus = req.body.paymentStatus;
  if (req.body.paymentStatus === 'paid') {
    // Record commission
    if (!db.commission) db.commission = { productsRate: 10, servicesRate: 15, totalEarned: 0, transactions: [] };
    const commission = Math.round(ord.total * (db.commission.productsRate / 100));
    db.commission.totalEarned += commission;
    db.commission.transactions.unshift({ id: `comm_${Date.now()}`, type: 'product', orderId: ord.id, orderTotal: ord.total, commissionRate: db.commission.productsRate, commissionAmount: commission, createdAt: new Date().toISOString() });
  }
  saveDB(db);
  res.json(ord);
});

app.patch('/api/bookings/:id/payment', (req, res) => {
  const db = loadDB();
  const b = db.bookings.find(x => x.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Booking not found' });
  b.paymentStatus = req.body.paymentStatus;
  if (req.body.paymentStatus === 'paid') {
    if (!db.commission) db.commission = { productsRate: 10, servicesRate: 15, totalEarned: 0, transactions: [] };
    const commission = Math.round((b.finalAmount || b.amount || 0) * (db.commission.servicesRate / 100));
    db.commission.totalEarned += commission;
    db.commission.transactions.unshift({ id: `comm_${Date.now()}`, type: 'service', bookingId: b.id, bookingTotal: b.finalAmount || b.amount, commissionRate: db.commission.servicesRate, commissionAmount: commission, createdAt: new Date().toISOString() });
  }
  saveDB(db);
  res.json(b);
});

// Audit Logs
app.get('/api/audit-logs', (req, res) => {
  const db = loadDB();
  res.json(db.auditLogs);
});

// Reset
app.post('/api/reset', (req, res) => {
  if (fs.existsSync(DB_FILE)) {
    fs.unlinkSync(DB_FILE);
  }
  const db = loadDB();
  res.json({ message: 'Database reset to factory defaults', db });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 NSO Cloud Backend Server running at http://0.0.0.0:${PORT}`);
});

import {
  Product,
  Service,
  UserProfile,
  Order,
  Booking,
  SpecialRequest,
  AuditLog,
  ProviderDetail,
  SavedAddress
} from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'usr_owner_01',
  name: 'NSO Store Owner',
  email: 'owner@nso.in',
  phone: '+91 8310421121',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  activeRole: 'customer',
  authorizedRoles: ['customer', 'seller', 'provider', 'admin'],
  sellerStatus: 'approved',
  providerStatus: 'approved',
  adminVerified: true,
  address: 'Flat 402, Orbit Towers, Indiranagar, Bengaluru - 560038',
  isLoggedIn: true
};

export const INITIAL_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr_1',
    label: 'Home',
    title: 'Indiranagar Residence',
    fullAddress: 'Flat 402, Orbit Towers, 100ft Road, Indiranagar, Bengaluru - 560038',
    landmark: 'Near Metro Pillar 84',
    isDefault: true
  },
  {
    id: 'addr_2',
    label: 'Work',
    title: 'Office Hub',
    fullAddress: '43 Residency Road, Bengaluru - 560025',
    landmark: 'Opposite Ritz Carlton',
    isDefault: false
  }
];

export const MOCK_PROVIDERS: ProviderDetail[] = [
  {
    id: 'prov_rajesh_plumb',
    name: 'Rajesh Sharma',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80',
    tradeTitle: 'Master Certified Plumber & Pipe Specialist',
    experienceYears: 8,
    rating: 4.9,
    reviewsCount: 248,
    jobsCompleted: 312,
    onTimeRate: '99%',
    phoneMasked: '+91 ••••• ••210',
    bio: 'Government-certified master plumber with 8+ years hands-on experience in residential pipeline diagnostics, sanitary fittings, pressure pumps, and concealed leak detection.',
    certifications: [
      'National Trade Certificate (Plumbing Grade 1)',
      'Police Clearance Verified',
      'NSO Identity & Skill Vetted'
    ],
    verificationBadges: ['Aadhaar Verified', 'Police Checked', 'Trade Licensed', 'Top Rated 2026'],
    portfolio: [
      {
        id: 'port_1',
        title: 'Concealed Wall Leakage Repair',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=80',
        tag: 'Leak Fixed'
      }
    ],
    reviews: [
      {
        id: 'rev_1',
        customerName: 'Priya N.',
        rating: 5,
        date: '2 days ago',
        comment: 'Rajesh arrived in 20 minutes! Brought his own pressure tool and fixed a 2-month hidden wall seep cleanly.',
        tags: ['Punctual', 'Clean Work', 'Polite']
      }
    ],
    ratingsBreakdown: { quality: 5.0, punctuality: 4.9, behavior: 4.9 }
  },
  {
    id: 'prov_suresh_elect',
    name: 'Suresh Kumar',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    tradeTitle: 'Licensed Electrical Diagnostics Engineer',
    experienceYears: 11,
    rating: 4.8,
    reviewsCount: 312,
    jobsCompleted: 450,
    onTimeRate: '98%',
    phoneMasked: '+91 ••••• ••842',
    bio: 'Over a decade specializing in short-circuit diagnostics, MCB trip troubleshooting, smart home wiring, and ceiling appliances.',
    certifications: ['State Wireman License', 'Industrial Safety Level 2', 'NSO Background Checked'],
    verificationBadges: ['License Verified', 'Aadhaar Verified', 'Emergency Standby'],
    portfolio: [
      {
        id: 'port_2',
        title: 'Distribution Board MCB Overhaul',
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
        tag: 'Rewiring'
      }
    ],
    reviews: [
      {
        id: 'rev_2',
        customerName: 'Vikram M.',
        rating: 5,
        date: '4 days ago',
        comment: 'Solved a power fluctuation issue in 30 minutes that two others failed to diagnose. Outstanding.',
        tags: ['Quick Fix', 'Master Electrician']
      }
    ],
    ratingsBreakdown: { quality: 4.9, punctuality: 4.8, behavior: 4.8 }
  },
  {
    id: 'prov_sparkle_clean',
    name: 'SparklePro Care Team',
    avatar: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&auto=format&fit=crop&q=80',
    tradeTitle: 'Deep Sanitization & Housekeeping Specialists',
    experienceYears: 6,
    rating: 4.9,
    reviewsCount: 580,
    jobsCompleted: 640,
    onTimeRate: '98%',
    phoneMasked: '+91 ••••• ••109',
    bio: 'Professional crew equipped with heavy-duty steam extractors, non-toxic eco-detergents, and mechanized tile scrubbers.',
    certifications: ['Sanitation Certified', 'Eco-Friendly Chemical Safe'],
    verificationBadges: ['Agency Verified', 'Uniformed Crew', 'Insured Equipment'],
    portfolio: [
      {
        id: 'port_3',
        title: 'Modular Kitchen Oil & Grease Descaling',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=80',
        tag: 'Deep Clean'
      }
    ],
    reviews: [
      {
        id: 'rev_3',
        customerName: 'Rohit B.',
        rating: 5,
        date: 'Yesterday',
        comment: 'Our 5-year-old apartment looks brand new. Sofa shampooing and balcony wash were top tier.',
        tags: ['Immaculate', 'Heavy Equipment']
      }
    ],
    ratingsBreakdown: { quality: 4.9, punctuality: 4.8, behavior: 4.9 }
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod_earbuds_01',
    title: 'Orbit Pro ANC Wireless Earbuds (32dB Noise Cancellation)',
    category: 'Electronics',
    price: 2499,
    originalPrice: 4999,
    discountPercentage: 50,
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
    price: 5999,
    originalPrice: 8999,
    discountPercentage: 33,
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewsCount: 145,
    stock: 14,
    sellerId: 'sell_orbit_tech',
    sellerName: 'Home Crafters India',
    deliveryEstimateDays: 2,
    regionalDeliveryFee: 80,
    variants: [
      { id: 'v_black', name: 'Matte Black Stainless', inStock: true }
    ],
    description: '15-bar Italian pressure pump extracts rich aromatic crema. Includes stainless steel steam wand for cafe-style cappuccinos and lattes.',
    highlights: ['15 Bar High Pressure Pump', 'Stainless Dual Spout', 'Adjustable Steam Wand', '1.2L Detachable Water Reservoir'],
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

export const MOCK_SERVICES: Service[] = [
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
    approvedByAdmin: true
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
    description: 'Short-circuit troubleshooting, tripped MCB breaker diagnostics, ceiling fan fitment, inverter checks, and household wiring safety audit.',
    cancellationPolicy: 'Free cancellation up to 2 hours before scheduled appointment.',
    availableSlots: ['10:00 AM - 12:00 PM', '01:00 PM - 03:00 PM', '04:00 PM - 06:00 PM'],
    approvedByAdmin: true
  },
  {
    id: 'serv_ac_03',
    title: 'Split / Window AC Deep Jet Cleaning & Gas Audit',
    category: 'Electrical',
    price: 599,
    unit: 'per indoor + outdoor unit',
    providerId: 'prov_suresh_elect',
    providerName: 'Suresh Kumar (Licensed Technician)',
    providerRating: 4.8,
    providerJobsCompleted: 450,
    modes: ['home_visit'],
    description: 'High-pressure water jet cleaning of AC cooling coils, blower wheel, drain tray wash, and freon gas pressure audit for optimal cooling.',
    cancellationPolicy: 'Free cancellation up to 3 hours before appointment.',
    availableSlots: ['09:30 AM - 11:30 AM', '02:00 PM - 04:00 PM'],
    approvedByAdmin: true
  },
  {
    id: 'serv_deep_clean_04',
    title: 'Complete 2BHK Home Deep Cleaning & Sanitization',
    category: 'Cleaning',
    price: 1899,
    unit: 'complete apartment',
    providerId: 'prov_sparkle_clean',
    providerName: 'SparklePro Care Team',
    providerRating: 4.9,
    providerJobsCompleted: 640,
    modes: ['home_visit'],
    description: 'Mechanized bathroom tile descaling, kitchen grease removal, sofa fabric shampooing, balcony wash, and disinfectant floor buffing.',
    cancellationPolicy: 'Free cancellation up to 4 hours before slot.',
    availableSlots: ['08:30 AM - 12:30 PM', '01:30 PM - 05:30 PM'],
    approvedByAdmin: true
  }
];

export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_BOOKINGS: Booking[] = [];
export const INITIAL_SPECIAL_REQUESTS: SpecialRequest[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

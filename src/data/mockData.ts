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
  id: '',
  name: 'Guest',
  email: '',
  phone: '',
  avatar: '',
  activeRole: 'customer',
  authorizedRoles: ['customer'],
  approvalStatus: 'none' as any,
  sellerStatus: 'none',
  providerStatus: 'none',
  adminVerified: false,
  address: '',
  isLoggedIn: false
};

export const INITIAL_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr_1',
    label: 'Home',
    title: 'Primary Residence',
    fullAddress: 'Flat 402, 100ft Road, Indiranagar, Bengaluru - 560038',
    landmark: 'Near Indiranagar Metro',
    isDefault: true
  }
];

// Clean slate: ZERO fake demo products or services!
// Real products only appear when an approved seller or admin creates them.
// Real services only appear when approved providers apply.
export const MOCK_PROVIDERS: ProviderDetail[] = [];
export const MOCK_PRODUCTS: Product[] = [];
export const MOCK_SERVICES: Service[] = [];

export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_BOOKINGS: Booking[] = [];
export const INITIAL_SPECIAL_REQUESTS: SpecialRequest[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_REGISTERED_USERS: UserProfile[] = [
  {
    id: 'usr_cust_pending_1',
    name: 'Ananya Sharma',
    phone: '+91 9845112233',
    email: 'ananya.sharma@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    activeRole: 'customer',
    authorizedRoles: ['customer'],
    approvalStatus: 'pending',
    sellerStatus: 'none',
    providerStatus: 'none',
    adminVerified: false,
    houseNumber: 'Flat 304, Green Glen Layout',
    streetNumber: 'Outer Ring Road, Bellandur',
    landmark: 'Behind Central Mall',
    city: 'Bengaluru',
    pincode: '560103',
    address: 'Flat 304, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru - 560103',
    isLoggedIn: false
  },
  {
    id: 'usr_cust_pending_2',
    name: 'Karthik Raman',
    phone: '+91 9741234567',
    email: 'karthik.raman@outlook.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    activeRole: 'customer',
    authorizedRoles: ['customer'],
    approvalStatus: 'pending',
    sellerStatus: 'none',
    providerStatus: 'none',
    adminVerified: false,
    houseNumber: '#42, 12th Main Road',
    streetNumber: '4th Block, Koramangala',
    landmark: 'Near Sony World Junction',
    city: 'Bengaluru',
    pincode: '560034',
    address: '#42, 12th Main Road, 4th Block, Koramangala, Bengaluru - 560034',
    isLoggedIn: false
  }
];

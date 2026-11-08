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
  activeRole: 'admin',
  authorizedRoles: ['customer', 'seller', 'provider', 'admin'],
  approvalStatus: 'approved',
  sellerStatus: 'approved',
  providerStatus: 'approved',
  adminVerified: true,
  address: 'Owner Suite, Orbit HQ, Central Station, Bengaluru - 560001',
  houseNumber: 'Owner Suite',
  streetNumber: 'Orbit HQ',
  landmark: 'Central Station',
  city: 'Bengaluru',
  pincode: '560001',
  isLoggedIn: true
};

export const INITIAL_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr_1',
    label: 'Home',
    title: 'Primary Residence',
    fullAddress: 'Flat 101, Main Road, Bengaluru - 560001',
    landmark: 'Near Central Station',
    isDefault: true
  }
];

// Clean catalog: No fake demo providers or demo services!
// Real services only appear when providers apply and are approved by the Owner.
export const MOCK_PROVIDERS: ProviderDetail[] = [];
export const MOCK_PRODUCTS: Product[] = [];
export const MOCK_SERVICES: Service[] = [];

export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_BOOKINGS: Booking[] = [];
export const INITIAL_SPECIAL_REQUESTS: SpecialRequest[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

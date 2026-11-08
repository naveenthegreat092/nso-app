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

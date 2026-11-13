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

import { INITIAL_SERVICE_CATALOG, INITIAL_VERIFIED_PROVIDERS } from './serviceCatalog';

// Initial verified provider network and catalog - Empty by default (Only real admin-approved submissions shown)
export const MOCK_PROVIDERS: ProviderDetail[] = [];
export const MOCK_PRODUCTS: Product[] = [];
export const MOCK_SERVICES: Service[] = [];

export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_BOOKINGS: Booking[] = [];
export const INITIAL_SPECIAL_REQUESTS: SpecialRequest[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

// Clean slate: Real customer registrations appear only when real users register.
export const INITIAL_REGISTERED_USERS: UserProfile[] = [];

export type Role = 'customer' | 'seller' | 'provider' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  activeRole: Role;
  authorizedRoles: Role[];
  sellerStatus: 'none' | 'pending' | 'approved' | 'rejected';
  sellerApplication?: {
    storeName: string;
    businessType: string;
    gstin?: string;
    address: string;
    submittedAt: string;
  };
  providerStatus: 'none' | 'pending' | 'approved' | 'rejected';
  providerApplication?: {
    tradeCategory: string;
    experienceYears: number;
    hourlyRate: number;
    submittedAt: string;
  };
  adminVerified: boolean;
  address?: string;
  isLoggedIn: boolean;
}

export interface SavedAddress {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  title: string;
  fullAddress: string;
  landmark?: string;
  isDefault?: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  inStock: boolean;
  priceModifier?: number;
}

export interface Product {
  id: string;
  title: string;
  category: 'Electronics' | 'Fashion' | 'Home & Living' | 'Groceries' | 'Beauty';
  price: number;
  originalPrice: number;
  discountPercentage: number;
  image: string;
  rating: number;
  reviewsCount: number;
  stock: number;
  sellerId: string;
  sellerName: string;
  deliveryEstimateDays: number;
  regionalDeliveryFee: number;
  variants: ProductVariant[];
  description: string;
  highlights: string[];
  approvalStatus: 'approved' | 'pending_approval' | 'rejected';
  submittedAt?: string;
  adminRejectionReason?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
}

export interface ProviderDetail {
  id: string;
  name: string;
  avatar: string;
  tradeTitle: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  jobsCompleted: number;
  onTimeRate: string;
  phoneMasked: string;
  bio: string;
  certifications: string[];
  verificationBadges: string[];
  portfolio: {
    id: string;
    title: string;
    image: string;
    tag: string;
  }[];
  reviews: {
    id: string;
    customerName: string;
    rating: number;
    date: string;
    comment: string;
    tags: string[];
  }[];
  ratingsBreakdown: {
    quality: number;
    punctuality: number;
    behavior: number;
  };
}

export interface Service {
  id: string;
  title: string;
  category: string;
  price: number;
  unit: string;
  providerId: string;
  providerName: string;
  providerRating: number;
  providerJobsCompleted: number;
  modes: ('home_visit' | 'provider_location')[];
  description: string;
  cancellationPolicy: string;
  availableSlots: string[];
  approvedByAdmin: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
}

export type OrderStatus = 'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refund_requested';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  variant?: string;
  image: string;
  sellerId: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  sellerDeliveryCharge: number;
  platformFee: number;
  couponDiscount?: number;
  tipAmount?: number;
  total: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  createdAt: string;
  deliveryAddress: string;
  notes?: string;
  rating?: number;
  reviewComment?: string;
}

export type BookingStatus = 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';

export interface RevisedQuote {
  amount: number;
  reason: string;
  status: 'pending_admin' | 'admin_approved' | 'customer_approved' | 'rejected';
  submittedAt: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  serviceId: string;
  serviceTitle: string;
  providerId: string;
  providerName: string;
  customerId: string;
  customerName: string;
  date: string;
  timeSlot: string;
  serviceMode: 'home_visit' | 'provider_location';
  customerAddress: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  cancellationTerms: string;
  createdAt: string;
  revisedQuote?: RevisedQuote;
  completionNotes?: string;
  rating?: number;
  reviewComment?: string;
  technicianEtaMinutes?: number;
}

export type SpecialRequestStatus = 'submitted' | 'under_review' | 'quote_offered' | 'accepted' | 'declined';

export interface SpecialRequest {
  id: string;
  requestNumber: string;
  customerId: string;
  customerName: string;
  title: string;
  category: string;
  description: string;
  estimatedBudget: number;
  targetTimeline: string;
  status: SpecialRequestStatus;
  adminNotes?: string;
  adminQuotation?: number;
  submittedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: Role;
  action: string;
  details: string;
}

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'peer';
  text: string;
  timestamp: string;
}

export type Role = 'customer' | 'seller' | 'provider' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  activeRole: Role;
  authorizedRoles: Role[];
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  houseNumber?: string;
  streetNumber?: string;
  landmark?: string;
  city?: string;
  pincode?: string;
  sellerStatus: 'none' | 'pending' | 'approved' | 'rejected';
  sellerApplication?: {
    storeName: string;
    businessType: string;
    gstin?: string;
    address: string;
    productCategory?: string;
    storeLogo?: string;
    submittedAt: string;
  };
  providerStatus: 'none' | 'pending' | 'approved' | 'rejected';
  providerApplication?: {
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
    issuedProviderId?: string;
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

export type PricingType = 'fixed' | 'hourly' | 'metered' | 'quotation_required';

export type RateApprovalStatus = 'approved' | 'pending_admin' | 'rejected';

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
  subServices?: string[];
  displayOrder?: number;
  isActive?: boolean;
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
  hourlyRate?: number;
  cancellationCount?: number;
  totalBookingsCount?: number;
  cancellationRate?: number;
  cancellationReviewFlagged?: boolean;
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
  pricingType?: PricingType;
  rateApprovalStatus?: RateApprovalStatus;
  hourlyRate?: number;
  meteredRate?: number;
  estimatedDurationHours?: number;
  requiresQuotation?: boolean;
  subServiceName?: string;
  categoryId?: string;
  providerId: string;
  providerName: string;
  providerRating: number;
  providerJobsCompleted: number;
  modes: ('home_visit' | 'provider_location')[];
  description: string;
  cancellationPolicy: string;
  availableSlots: string[];
  approvedByAdmin: boolean;
  approvalStatus?: 'approved' | 'pending_approval' | 'rejected';
  hubAddress?: string;
  hubLat?: number;
  hubLng?: number;
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

export type BookingStatus =
  | 'confirmed'
  | 'assessing'
  | 'quotation_pending'
  | 'quotation_admin_review'
  | 'quotation_customer_review'
  | 'quotation_declined'
  | 'travelling'
  | 'in_progress'
  | 'work_paused_extra_time'
  | 'completed_pending_review'
  | 'problem_reported'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export interface RevisedQuote {
  amount: number;
  reason: string;
  status: 'pending_admin' | 'admin_approved' | 'customer_approved' | 'rejected';
  submittedAt: string;
}

export interface JobQuotation {
  id: string;
  proposedWork: string;
  laborCost: number;
  partsCost: number;
  additionalFees: number;
  totalAmount: number;
  assumptions: string;
  estimatedDuration: string;
  expiryDate: string;
  notes?: string;
  status:
    | 'pending_admin'
    | 'admin_approved'
    | 'admin_returned'
    | 'customer_accepted'
    | 'customer_changes_requested'
    | 'customer_declined';
  adminFeedback?: string;
  customerFeedback?: string;
  submittedAt: string;
  decidedAt?: string;
}

export interface HourlyDetails {
  hourlyRate: number;
  approvedTimeLimitHours: number;
  timeUsedHours: number;
  timerStartedAt?: string;
  timerRunning?: boolean;
  calculatedAmount: number;
  extraTimeRequest?: {
    requestedHours: number;
    rate: number;
    reason: string;
    extraAmount: number;
    status: 'pending_customer' | 'approved' | 'declined';
    requestedAt: string;
    decidedAt?: string;
  };
}

export interface ReportedProblem {
  id: string;
  problemType: 'poor_quality' | 'incomplete_work' | 'damage' | 'other';
  description: string;
  photos?: string[];
  reportedAt: string;
  adminReviewStatus: 'under_review' | 'site_visit_scheduled' | 'resolved';
  siteVisitRequired?: boolean;
  siteVisitScheduledAt?: string;
  adminNotes?: string;
  resolutionNotes?: string;
  clearedAt?: string;
}

export interface CancellationDetails {
  cancelledBy: 'customer' | 'provider' | 'admin';
  reason: string;
  stage: 'before_assignment' | 'after_assignment' | 'travelling' | 'work_started';
  cancellationFee: number;
  adminFeeApproved?: boolean;
  workCompletedCharge?: number;
  materialsUsedCharge?: number;
  breakdown?: string;
  replacementProviderOffered?: boolean;
  replacementProviderId?: string;
  replacementProviderName?: string;
  timestamp: string;
}

export interface ProviderCancellationReview {
  id: string;
  providerId: string;
  providerName: string;
  totalBookings: number;
  cancelledBookings: number;
  cancellationRate: number;
  reason: string;
  status: 'pending_admin_review' | 'reviewed';
  adminNotes?: string;
  createdAt: string;
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
  customerPhone?: string;
  date: string;
  timeSlot: string;
  serviceMode: 'home_visit' | 'provider_location';
  customerAddress: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  cancellationTerms: string;
  createdAt: string;
  pricingType?: PricingType;
  jobDescription?: string;
  jobAttachments?: string[];
  providerAssigned?: boolean;
  quotation?: JobQuotation;
  hourlyDetails?: HourlyDetails;
  meteredUnits?: number;
  meteredRate?: number;
  reportedProblem?: ReportedProblem;
  cancellationDetails?: CancellationDetails;
  completedAt?: string;
  confirmedCompletedAt?: string;
  revisedQuote?: RevisedQuote;
  completionNotes?: string;
  problemDescription?: string;
  problemPhoto?: string;
  requestType?: 'site_visit' | 'repair' | 'inspection';
  rating?: number;
  reviewComment?: string;
  technicianEtaMinutes?: number;
  advanceAmount?: number;
  advancePaymentStatus?: 'pending' | 'paid' | 'waived';
  isLiveTrackingActive?: boolean;
  providerLat?: number;
  providerLng?: number;
  providerHeading?: number;
  providerSpeed?: number;
  providerLocationUpdatedAt?: string;
  providerAddress?: string;
  providerHubLat?: number;
  providerHubLng?: number;
  customerLat?: number;
  customerLng?: number;
  distanceKm?: number;
  directionsUrl?: string;
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

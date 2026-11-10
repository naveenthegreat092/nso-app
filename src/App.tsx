import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { MobileFrame } from './components/common/MobileFrame';
import { BrandHeader } from './components/common/BrandHeader';
import { BottomNav } from './components/common/BottomNav';
import { JourneyNavigator } from './components/common/JourneyNavigator';
import { OnboardingFlow } from './components/auth/OnboardingFlow';
import { HomeScreen } from './components/customer/HomeScreen';
import { ExploreScreen } from './components/customer/ExploreScreen';
import { OrdersScreen } from './components/customer/OrdersScreen';
import { AccountScreen } from './components/account/AccountScreen';
import { ProductDetailModal } from './components/customer/ProductDetailModal';
import { ServiceBookingModal } from './components/customer/ServiceBookingModal';
import { CartCheckoutModal } from './components/customer/CartCheckoutModal';
import { SpecialRequestModal } from './components/special/SpecialRequestModal';
import { AuthModal } from './components/auth/AuthModal';
import { SellerDashboard } from './components/seller/SellerDashboard';
import { ProviderDashboard } from './components/provider/ProviderDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ProviderProfileModal } from './components/provider/ProviderProfileModal';
import { ChatModal } from './components/common/ChatModal';
import { TrackingMapModal } from './components/common/TrackingMapModal';
import { AddressModal } from './components/common/AddressModal';
import { ReviewModal } from './components/common/ReviewModal';
import { FloatingCartBar } from './components/common/FloatingCartBar';
import { SmartSearchModal } from './components/customer/SmartSearchModal';
import { NotificationTrayModal } from './components/common/NotificationTrayModal';
import { ProviderMapDiscoveryModal } from './components/customer/ProviderMapDiscoveryModal';
import { WishlistModal } from './components/customer/WishlistModal';
import { Product, Service } from './types';

export const AppContent: React.FC = () => {
  const {
    user,
    switchRole,
    activeTab,
    setActiveTab,
    selectedProduct,
    setSelectedProduct,
    selectedService,
    setSelectedService,
    services,
    selectedProviderDetail,
    closeProviderProfile,
    openProviderProfile,
    openChat,
    chatPeerName,
    closeChat,
    trackingModalData,
    closeTracking,
    reviewModalData,
    closeReviewModal,
    submitReview,
    isAddressModalOpen,
    openAddressModal,
    closeAddressModal,
    addresses,
    selectedAddress,
    selectAddress,
    isWishlistOpen,
    openWishlist,
    closeWishlist
  } = useApp();

  const [isOnboardingMode, setIsOnboardingMode] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSpecialRequestOpen, setIsSpecialRequestOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMapRadiusOpen, setIsMapRadiusOpen] = useState(false);

  const getCurrentSectionId = (): string => {
    if (isOnboardingMode) return 'onboarding';
    if (user.activeRole === 'seller') return 'seller';
    if (user.activeRole === 'provider') return 'provider';
    if (user.activeRole === 'admin') return 'admin';
    if (activeTab === 'explore') return 'services';
    return 'customer_home';
  };

  const handleSelectSection = (sectionId: string) => {
    setIsOnboardingMode(false);
    if (sectionId === 'onboarding') {
      setIsOnboardingMode(true);
      return;
    }
    if (sectionId === 'seller') {
      switchRole('seller');
      return;
    }
    if (sectionId === 'provider') {
      switchRole('provider');
      return;
    }
    if (sectionId === 'admin') {
      switchRole('admin');
      return;
    }
    if (sectionId === 'services') {
      switchRole('customer');
      setActiveTab('explore');
      return;
    }
    if (sectionId === 'special_request') {
      switchRole('customer');
      setIsSpecialRequestOpen(true);
      return;
    }
    // Default: Customer Home
    switchRole('customer');
    setActiveTab('home');
  };

  const handleOpenDirectCheckout = () => {
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] flex flex-col antialiased">
      <MobileFrame>
        {/* Real Flowchart Gate (Splash -> Login & Role Choice) */}
        {isOnboardingMode || !user.isLoggedIn ? (
          <OnboardingFlow onComplete={() => setIsOnboardingMode(false)} />
        ) : (
          <>
            {/* Brand Header */}
            <BrandHeader
              onOpenCart={() => setIsCartOpen(true)}
              onOpenSpecialRequest={() => setIsSpecialRequestOpen(true)}
              onOpenSearch={() => setIsSearchOpen(true)}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
            />

          {/* Main Role-Specific View */}
          {user.activeRole === 'seller' ? (
            <SellerDashboard />
          ) : user.activeRole === 'provider' ? (
            <ProviderDashboard />
          ) : user.activeRole === 'admin' ? (
            <AdminDashboard />
          ) : (
            /* Customer View */
            <>
              {activeTab === 'home' && (
                <HomeScreen
                  onSelectProduct={(p: Product) => setSelectedProduct(p)}
                  onSelectService={(s: Service) => setSelectedService(s)}
                  onOpenSpecialRequest={() => setIsSpecialRequestOpen(true)}
                  onOpenMapRadius={() => setIsMapRadiusOpen(true)}
                />
              )}

              {activeTab === 'explore' && (
                <ExploreScreen
                  onSelectProduct={(p: Product) => setSelectedProduct(p)}
                  onSelectService={(s: Service) => setSelectedService(s)}
                  onOpenMapRadius={() => setIsMapRadiusOpen(true)}
                />
              )}

              {activeTab === 'orders' && <OrdersScreen />}

              {activeTab === 'account' && (
                <AccountScreen
                  onOpenSpecialRequest={() => setIsSpecialRequestOpen(true)}
                />
              )}
            </>
          )}

          {/* Persistent Bottom Bar */}
          <BottomNav />

          {/* Blinkit Floating Mini-Cart Pill */}
          <FloatingCartBar onOpenCart={() => setIsCartOpen(true)} />
        </>
      )}

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={closeWishlist}
        onSelectProduct={(p: Product) => setSelectedProduct(p)}
      />

      {/* Customer Modals */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onOpenCheckoutDirect={handleOpenDirectCheckout}
        />
      )}

      {selectedService && (
        <ServiceBookingModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}

      <CartCheckoutModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      <SpecialRequestModal
        isOpen={isSpecialRequestOpen}
        onClose={() => setIsSpecialRequestOpen(false)}
      />

      <AuthModal />

      {/* ── Provider Profile Modal ── */}
      {selectedProviderDetail && (
        <ProviderProfileModal
          provider={selectedProviderDetail}
          onClose={closeProviderProfile}
          onBookService={() => {
            // Find first service for this provider and open booking modal
            const svc = services.find((s) => s.providerId === selectedProviderDetail.id);
            closeProviderProfile();
            if (svc) setSelectedService(svc);
          }}
          onOpenChat={(name) => {
            closeProviderProfile();
            openChat(name);
          }}
        />
      )}

      {/* ── In-App Masked Chat Modal ── */}
      {chatPeerName && (
        <ChatModal
          isOpen={!!chatPeerName}
          peerName={chatPeerName}
          onClose={closeChat}
        />
      )}

      {/* ── Live GPS Tracking Modal ── */}
      {trackingModalData && (
        <TrackingMapModal
          isOpen={!!trackingModalData}
          trackingTitle={trackingModalData.title}
          partnerName={trackingModalData.partnerName}
          partnerType={trackingModalData.type}
          bookingId={trackingModalData.bookingId}
          onClose={closeTracking}
          onOpenChat={(name) => {
            closeTracking();
            openChat(name);
          }}
        />
      )}

      {/* ── Saved Addresses Modal ── */}
      <AddressModal
        isOpen={isAddressModalOpen}
        addresses={addresses}
        selectedAddressId={selectedAddress.id}
        onSelectAddress={(addr) => {
          selectAddress(addr);
          closeAddressModal();
        }}
        onClose={closeAddressModal}
      />

      {/* ── Instant Smart Search Full-Screen Modal ── */}
      <SmartSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onSelectService={(s) => setSelectedService(s)}
      />

      {/* ── Live In-App Notifications Drawer ── */}
      <NotificationTrayModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onOpenOrders={() => {
          setActiveTab('orders');
          setIsNotificationsOpen(false);
        }}
      />

      {/* ── Interactive Specialist Radius Map Modal ── */}
      <ProviderMapDiscoveryModal
        isOpen={isMapRadiusOpen}
        onClose={() => setIsMapRadiusOpen(false)}
        onSelectService={(s) => {
          setIsMapRadiusOpen(false);
          setSelectedService(s);
        }}
      />

      {/* ── Post-Service / Post-Order Review Modal ── */}
      {reviewModalData && (
        <ReviewModal
          isOpen={!!reviewModalData}
          itemTitle={reviewModalData.title}
          targetType={reviewModalData.type}
          onClose={closeReviewModal}
          onSubmitReview={(rating, comment, tags) => {
            submitReview(rating, comment, tags);
            closeReviewModal();
          }}
        />
      )}

      </MobileFrame>
    </div>
  );
};

export default function App() {
  return <AppContent />;
}

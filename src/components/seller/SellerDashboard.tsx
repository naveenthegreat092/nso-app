import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, OrderStatus } from '../../types';
import { resizeImageFile } from '../../utils/imageUpload';
import {
  Store,
  Plus,
  Package,
  TrendingUp,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Tag,
  X,
  Minus,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Camera,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const { products, orders, updateOrderStatus, addProduct, updateProductStock, user, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'earnings'>('orders');

  // New product form modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('1499');
  const [newOriginalPrice, setNewOriginalPrice] = useState('2499');
  const [newStock, setNewStock] = useState('25');
  const [newCategory, setNewCategory] = useState<'Electronics' | 'Fashion' | 'Home & Living' | 'Groceries' | 'Beauty'>('Electronics');
  const [newDeliveryFee, setNewDeliveryFee] = useState('49');
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingImage(true);
      const base64 = await resizeImageFile(file, 800, 800, 0.85);
      setNewImage(base64);
      showToast('📸 Product photo uploaded successfully!');
    } catch (err) {
      showToast('Failed to load image. Please try another.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const imagePresets = [
    { label: 'Audio/Earbuds', url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80' },
    { label: 'Smart Watch', url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=80' },
    { label: 'Organic Oil', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80' },
    { label: 'Desk Lamp', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=80' }
  ];

  // Filter seller's orders
  const sellerOrders = orders;

  const totalEarnings = orders
    .filter((o) => o.paymentStatus === 'success' && o.orderStatus === 'delivered')
    .reduce((sum, o) => sum + o.total * 0.9, 0); // 10% platform commission as per brief

  const pendingFulfillment = orders.filter(
    (o) => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled'
  );

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const priceNum = parseFloat(newPrice) || 999;
    const origPriceNum = parseFloat(newOriginalPrice) || 1499;
    const discount = Math.round(((origPriceNum - priceNum) / origPriceNum) * 100);

    addProduct({
      title: newTitle,
      category: newCategory,
      price: priceNum,
      originalPrice: origPriceNum,
      discountPercentage: discount > 0 ? discount : 10,
      image: newImage,
      rating: 5.0,
      reviewsCount: 0,
      stock: parseInt(newStock) || 20,
      sellerId: user.id,
      sellerName: user.sellerApplication?.storeName || user.name || 'Store Partner',
      deliveryEstimateDays: 2,
      regionalDeliveryFee: parseFloat(newDeliveryFee) || 0,
      variants: [{ id: 'v1', name: 'Standard Edition', inStock: true }],
      description: `High performance authentic ${newTitle} backed by manufacturer warranty.`,
      highlights: ['1 Year Warranty', 'Instant Regional Dispatch', '100% Genuine'],
      approvalStatus: 'pending_approval'
    });

    setShowAddModal(false);
    setNewTitle('');
    setActiveTab('products');
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Top Banner */}
      <div className="px-4 pt-3">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-4 text-white shadow-lg shadow-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                <Store className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold tracking-tight">Seller Operations</h2>
                <p className="text-[10px] text-emerald-100">{user.sellerApplication?.storeName || user.name || 'Verified Store'} (ID: {user.id.slice(-6)})</p>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-400/30 text-emerald-100 border border-emerald-300/30 px-2 py-0.5 rounded-full font-bold">
              Status: APPROVED
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/20 text-center">
            <div>
              <span className="text-[10px] text-emerald-100 block">Pending Orders</span>
              <span className="text-base font-extrabold">{pendingFulfillment.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-100 block">Active Listings</span>
              <span className="text-base font-extrabold">{products.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-100 block">Net Eligible (90%)</span>
              <span className="text-base font-extrabold">₹{Math.round(totalEarnings).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-gray-100 p-1 rounded-xl mt-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'orders' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500'
            }`}
          >
            Fulfillment ({pendingFulfillment.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'products' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500'
            }`}
          >
            Catalogue ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'earnings' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500'
            }`}
          >
            Finances & Commission
          </button>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {/* Fulfillment Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Orders requiring delivery dispatch</span>
              <span className="font-semibold text-gray-700">{sellerOrders.length} total</span>
            </div>

            {sellerOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Package className="w-8 h-8 mx-auto text-gray-300 mb-1" />
                <p className="text-xs font-bold">No customer orders yet</p>
              </div>
            ) : (
              sellerOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-gray-900">{order.orderNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      order.orderStatus === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.orderStatus === 'out_for_delivery'
                        ? 'bg-indigo-100 text-indigo-800'
                        : order.orderStatus === 'shipped'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-gray-700">
                    <p className="font-semibold">{order.items[0]?.title}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Customer: <span className="font-semibold text-gray-800">{order.customerName}</span>
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Deliver to: {order.deliveryAddress}
                    </p>
                  </div>

                  {/* Stage-by-Stage Dispatch Actions */}
                  <div className="pt-2 border-t border-gray-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      Dispatch Pipeline Actions:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {order.orderStatus === 'confirmed' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'packed')}
                          className="py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-sm"
                        >
                          Mark as Packed
                        </button>
                      )}
                      {order.orderStatus === 'packed' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'shipped')}
                          className="py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-sm"
                        >
                          Handover to Logistics
                        </button>
                      )}
                      {order.orderStatus === 'shipped' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                          className="py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm"
                        >
                          Out for Delivery
                        </button>
                      )}
                      {order.orderStatus === 'out_for_delivery' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm"
                        >
                          Confirm Delivered
                        </button>
                      )}
                      {order.orderStatus === 'delivered' && (
                        <span className="col-span-2 text-center text-xs font-bold text-emerald-700 bg-emerald-50 py-1.5 rounded-lg flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Order Delivered & Eligible for Payout
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Catalogue Tab */}
        {activeTab === 'products' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">Inventory Items ({products.length})</span>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="space-y-2">
              {products.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm flex items-center justify-between gap-3 text-xs">
                  <img src={p.image} alt={p.title} className="w-12 h-12 rounded-xl object-cover bg-gray-50 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-gray-900 truncate">{p.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-black text-gray-900">₹{p.price}</span>
                      <span className="text-[10px] text-gray-400 line-through">₹{p.originalPrice}</span>
                      <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1 rounded">
                        {p.discountPercentage}% OFF
                      </span>
                    </div>
                  </div>

                  {/* Stock Stepper */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => updateProductStock(p.id, Math.max(0, p.stock - 1))}
                      className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="text-[11px] font-black w-7 text-center">{p.stock}</span>
                    <button
                      onClick={() => updateProductStock(p.id, p.stock + 1)}
                      className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Finances & Commission Tab (Page 8 Brief Rule: Zero buyer fee, Commission from seller post-delivery) */}
        {activeTab === 'earnings' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4 text-xs">
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Escrow-Compliant Payout Ledger</h4>
              <p className="text-gray-500 text-[11px] mt-0.5">
                Rule: Per Indian payments & marketplace guidelines, seller funds are held in escrow and released post-delivery less 10% platform commission.
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex justify-between text-emerald-950 font-bold">
                <span>Total Delivered Orders Volume:</span>
                <span>₹{orders.filter(o => o.orderStatus === 'delivered').reduce((s, o) => s + o.total, 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-700 text-[11px]">
                <span>Platform Commission (10%):</span>
                <span>-₹{Math.round(orders.filter(o => o.orderStatus === 'delivered').reduce((s, o) => s + o.total * 0.1, 0)).toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-emerald-200 flex justify-between font-black text-sm text-emerald-950">
                <span>Net Eligible Seller Payout:</span>
                <span>₹{Math.round(totalEarnings).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-gray-900">List New Product on NSO</h4>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-full text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Over-Ear ANC Headphones"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newOriginalPrice}
                    onChange={(e) => setNewOriginalPrice(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home & Living">Home & Living</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Beauty">Beauty</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Photo Upload: Camera / Gallery + Presets */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Product Photo</label>
                
                {/* Hidden File Input */}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {/* Upload Button & Live Preview Box */}
                <div className="flex gap-2.5 items-center mb-2">
                  <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-emerald-300 overflow-hidden bg-slate-50 flex items-center justify-center flex-shrink-0 relative">
                    {newImage ? (
                      <img src={newImage} alt="Product Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                    )}
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white font-bold">
                        Loading...
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-600" />
                      Take Photo / Upload Image
                    </button>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Camera or Phone Gallery (JPG, PNG auto-compressed)
                    </p>
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Or choose quick sample image:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {imagePresets.map((img) => (
                      <div
                        key={img.label}
                        onClick={() => setNewImage(img.url)}
                        className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                          newImage === img.url ? 'border-emerald-600 ring-2 ring-emerald-200' : 'border-gray-200'
                        }`}
                      >
                        <img src={img.url} alt="" className="w-full h-10 object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  List Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

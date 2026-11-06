import React from 'react';
import { X, Download, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InvoiceModal: React.FC<{
  isOpen: boolean;
  orderData: {
    orderNumber: string;
    date: string;
    customerName: string;
    address: string;
    items: { title: string; price: number; quantity: number }[];
    total: number;
    platformFee: number;
    deliveryFee: number;
    discount?: number;
  } | null;
  onClose: () => void;
}> = ({ isOpen, orderData, onClose }) => {
  const { showToast } = useApp();

  if (!isOpen || !orderData) return null;

  const handleDownload = () => {
    showToast(`📄 Invoice ${orderData.orderNumber}.pdf generated & downloaded`);
    setTimeout(() => onClose(), 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 text-xs">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-150 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white font-black text-sm flex items-center justify-center shadow-sm">
              NSO
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">Tax Invoice</h3>
              <p className="text-[10px] text-slate-500 font-mono">GSTIN: 29AABCN5829P1Z8</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Meta */}
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-500">Invoice No:</span>
            <span className="font-mono font-bold text-slate-900">{orderData.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Invoice Date:</span>
            <span className="font-semibold text-slate-900">{orderData.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Billed To:</span>
            <span className="font-bold text-slate-900">{orderData.customerName}</span>
          </div>
          <p className="text-[10px] text-slate-500 truncate pt-1 border-t border-slate-200">
            {orderData.address}
          </p>
        </div>

        {/* Items Table */}
        <div className="space-y-1.5">
          <span className="font-black text-slate-800 block text-[11px]">Item Summary</span>
          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {orderData.items.map((item, idx) => (
              <div key={idx} className="p-2 flex justify-between items-center text-[11px]">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="font-bold text-slate-900 truncate">{item.title}</p>
                  <p className="text-[10px] text-slate-500">Qty: {item.quantity}</p>
                </div>
                <span className="font-bold text-slate-900 whitespace-nowrap">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="space-y-1 text-[11px] pt-1">
          <div className="flex justify-between text-slate-600">
            <span>Delivery Charges:</span>
            <span>{orderData.deliveryFee === 0 ? 'FREE' : `₹${orderData.deliveryFee}`}</span>
          </div>
          {orderData.discount && orderData.discount > 0 ? (
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Coupon Savings:</span>
              <span>-₹{orderData.discount}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-slate-600">
            <span>Platform Commission:</span>
            <span className="font-bold text-emerald-600">₹0 (Zero Buyer Fee)</span>
          </div>
          <div className="flex justify-between text-xs font-black text-slate-950 pt-1.5 border-t border-slate-200">
            <span>Total Paid (Inclusive of GST):</span>
            <span className="text-red-600 font-black">₹{orderData.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Trust Stamp */}
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>Digitally signed & authorized under Indian E-Commerce rules.</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={onClose}
            className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

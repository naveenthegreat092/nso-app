import React, { useState } from 'react';
import { X, MapPin, Plus, CheckCircle2, Home, Briefcase, Building, Trash2 } from 'lucide-react';
import { SavedAddress } from '../../types';
import { useApp } from '../../context/AppContext';

export const AddressModal: React.FC<{
  isOpen: boolean;
  addresses: SavedAddress[];
  selectedAddressId: string;
  onSelectAddress: (addr: SavedAddress) => void;
  onClose: () => void;
}> = ({ isOpen, addresses, selectedAddressId, onSelectAddress, onClose }) => {
  const { showToast, deleteAddress } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [houseNo, setHouseNo] = useState('');
  const [area, setArea] = useState('Indiranagar, Bengaluru');
  const [landmark, setLandmark] = useState('');

  if (!isOpen) return null;

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseNo.trim()) return;

    const newAddr: SavedAddress = {
      id: `addr_${Date.now()}`,
      label,
      title: `${label} Address`,
      fullAddress: `${houseNo}, ${area}`,
      landmark,
      isDefault: false
    };

    onSelectAddress(newAddr);
    setShowAddForm(false);
    showToast(`Added new ${label} address`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-600" />
            <h4 className="font-black text-sm text-slate-900">Delivery Address</h4>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
          {!showAddForm ? (
            <>
              {/* Address List */}
              <div className="space-y-2">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  const Icon = addr.label === 'Home' ? Home : addr.label === 'Work' ? Briefcase : Building;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => {
                        onSelectAddress(addr);
                        onClose();
                      }}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start justify-between ${
                        isSelected
                          ? 'border-red-600 bg-red-50/70 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-xs text-slate-900">{addr.label}</span>
                            <span className="text-[10px] text-slate-500 font-semibold">• {addr.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 leading-snug">{addr.fullAddress}</p>
                          {addr.landmark && (
                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                              Landmark: {addr.landmark}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-red-600" />}
                        {addresses.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAddress(addr.id);
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Remove address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Address Button */}
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 hover:border-red-500 text-slate-700 hover:text-red-600 font-black text-xs flex items-center justify-center gap-2 transition-colors active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </>
          ) : (
            /* Add Address Form */
            <form onSubmit={handleAddNewAddress} className="space-y-3 pt-1">
              <span className="font-black text-xs text-slate-900 block">Add New Delivery Location</span>

              {/* Label selector */}
              <div className="flex gap-2">
                {(['Home', 'Work', 'Other'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLabel(l)}
                    className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      label === l ? 'border-red-600 bg-red-50 text-red-600 font-black' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Flat / House No. / Building Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 301, Rosewood Manor"
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Area / Colony / Street</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Nearby Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Behind Metro station"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-red-600 text-white font-black text-xs rounded-xl shadow-md shadow-red-500/20"
                >
                  Save & Select
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

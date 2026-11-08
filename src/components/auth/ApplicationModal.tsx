import React, { useState, useRef } from 'react';
import { X, Wrench, Store, ChevronRight, CheckCircle2, Clock, XCircle, Upload, Phone, User, Briefcase, IndianRupee, Camera, FileCheck, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { resizeImageFile } from '../../utils/imageUpload';

type AppType = 'provider' | 'seller';

interface Props {
  type: AppType;
  isOpen: boolean;
  onClose: () => void;
}

const TRADE_CATEGORIES = [
  'Plumber', 'Electrician', 'Carpenter', 'Painter', 'AC Technician',
  'Cleaning', 'Pest Control', 'Home Appliance Repair', 'CCTV Installation',
  'Interior Designer', 'Mason / Civil Work', 'Gardening', 'Other'
];

const BUSINESS_TYPES = [
  'Retail Store', 'Wholesale Distributor', 'Manufacturer', 'Home Business',
  'Online Seller', 'Service Reseller', 'Other'
];

export const ApplicationModal: React.FC<Props> = ({ type, isOpen, onClose }) => {
  const { user, applyForProvider, applyForSeller, showToast } = useApp();
  const [step, setStep] = useState<'form' | 'submitted'>('form');

  // Provider form state
  const [tradeCategory, setTradeCategory] = useState('Plumber');
  const [experience, setExperience] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [providerPhone, setProviderPhone] = useState(user.phone || '');
  const [providerName, setProviderName] = useState(user.name || '');
  const [idProofType, setIdProofType] = useState('Aadhaar Card');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [previousWork, setPreviousWork] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80');
  const [idDocumentPhoto, setIdDocumentPhoto] = useState('');
  const profileInputRef = useRef<HTMLInputElement>(null);
  const idDocInputRef = useRef<HTMLInputElement>(null);

  // Seller form state
  const [storeName, setStoreName] = useState('');
  const [businessType, setBusinessType] = useState('Retail Store');
  const [gstin, setGstin] = useState('');
  const [sellerAddress, setSellerAddress] = useState('');
  const [sellerPhone, setSellerPhone] = useState(user.phone || '');
  const [sellerName, setSellerName] = useState(user.name || '');
  const [productCategory, setProductCategory] = useState('');
  const [storeLogo, setStoreLogo] = useState('https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&auto=format&fit=crop&q=80');
  const storeLogoRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void, msg: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await resizeImageFile(file, 800, 800, 0.85);
      setter(base64);
      showToast(msg);
    } catch {
      showToast('Could not load photo. Please try another.');
    }
  };

  if (!isOpen) return null;

  // Show current status if already applied
  if (type === 'provider' && (user.providerStatus === 'pending' || user.providerStatus === 'approved' || user.providerStatus === 'rejected')) {
    return (
      <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-end">
        <div className="w-full bg-white rounded-t-3xl p-6 pb-10 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-black text-lg text-slate-900">Provider Application</h2>
            <button onClick={onClose} className="p-2 rounded-full bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
          </div>
          {user.providerStatus === 'pending' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="font-black text-slate-900 text-lg mb-2">Application Under Review</h3>
              <p className="text-slate-500 text-sm">Your provider application has been submitted. The admin will review and approve it shortly. You'll be notified once approved.</p>
            </div>
          )}
          {user.providerStatus === 'approved' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="font-black text-slate-900 text-lg mb-2">You're an Approved Provider!</h3>
              <p className="text-slate-500 text-sm mb-4">Your provider account is active. You can now list your services.</p>
              <button onClick={onClose} className="w-full py-3 rounded-2xl bg-green-500 text-white font-black text-sm">Open Provider Dashboard</button>
            </div>
          )}
          {user.providerStatus === 'rejected' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="font-black text-slate-900 text-lg mb-2">Application Not Approved</h3>
              <p className="text-slate-500 text-sm">Your application was not approved this time. Please contact support for more details.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'seller' && (user.sellerStatus === 'pending' || user.sellerStatus === 'approved' || user.sellerStatus === 'rejected')) {
    return (
      <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-end">
        <div className="w-full bg-white rounded-t-3xl p-6 pb-10 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-black text-lg text-slate-900">Seller Application</h2>
            <button onClick={onClose} className="p-2 rounded-full bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
          </div>
          {user.sellerStatus === 'pending' && (
            <div className="text-center py-6">
              <Clock className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h3 className="font-black text-slate-900 mb-2">Application Under Review</h3>
              <p className="text-slate-500 text-sm">Admin will verify your store details and approve shortly.</p>
            </div>
          )}
          {user.sellerStatus === 'approved' && (
            <div className="text-center py-6">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-black text-slate-900 mb-2">Store Approved!</h3>
              <button onClick={onClose} className="w-full py-3 rounded-2xl bg-green-500 text-white font-black text-sm mt-4">Open Seller Dashboard</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleProviderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!experience || !hourlyRate || !serviceArea || !idProofNumber || !previousWork.trim()) {
      showToast('Please fill all required fields including previous work details');
      return;
    }
    setLoading(true);
    try {
      if (providerPhone) {
        localStorage.setItem('nso_user_phone', providerPhone.replace(/\D/g, '').slice(-10));
      }
      await applyForProvider({
        tradeCategory,
        experienceYears: parseInt(experience),
        hourlyRate: parseFloat(hourlyRate),
        serviceArea,
        resumeText,
        previousWork,
        idProofType,
        idProofNumber,
        profilePhoto,
        idDocumentPhoto
      });
      setStep('submitted');
    } catch (err: any) {
      showToast(err?.message || 'Error submitting application');
    } finally {
      setLoading(false);
    }
  };

  const handleSellerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !sellerAddress || !productCategory) {
      showToast('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      if (sellerPhone) {
        localStorage.setItem('nso_user_phone', sellerPhone.replace(/\D/g, '').slice(-10));
      }
      await applyForSeller({
        storeName,
        businessType,
        gstin,
        address: sellerAddress,
        productCategory,
        storeLogo
      });
      setStep('submitted');
    } catch (err: any) {
      showToast(err?.message || 'Error submitting application');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'submitted') {
    return (
      <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-end">
        <div className="w-full bg-white rounded-t-3xl p-6 pb-12 shadow-2xl text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="font-black text-xl text-slate-900 mb-2">Application Submitted!</h2>
          <p className="text-slate-500 text-sm mb-6">
            Your application is now with the Admin for review. Once approved, your {type === 'provider' ? 'Service Provider' : 'Seller'} portal will automatically unlock. You'll see the status here.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-6 text-xs text-amber-700 font-medium">
            ⏱ Approval usually takes 24–48 hours. Admin verifies all applications manually.
          </div>
          <button onClick={onClose} className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-sm">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-end overflow-hidden">
      <div className="w-full bg-white rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${type === 'provider' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
              {type === 'provider' ? <Wrench className="w-5 h-5" /> : <Store className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-black text-base text-slate-900">
                {type === 'provider' ? 'Become a Service Provider' : 'Open Your Store'}
              </h2>
              <p className="text-xs text-slate-400 font-medium">Fill details → Admin approves → Portal unlocks</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-100 text-slate-500 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto flex-1 p-5">
          {type === 'provider' ? (
            <form onSubmit={handleProviderSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 mb-1.5 block">Your Full Name *</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                  <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input value={providerName} onChange={e => setProviderName(e.target.value)} required placeholder="e.g. Ravi Kumar" className="bg-transparent text-sm font-medium text-slate-900 outline-none flex-1 placeholder:text-slate-400" />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 mb-1.5 block">Phone Number *</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input value={providerPhone} onChange={e => setProviderPhone(e.target.value)} required placeholder="+91 9876543210" className="bg-transparent text-sm font-medium text-slate-900 outline-none flex-1 placeholder:text-slate-400" />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 mb-1.5 block">Trade / Skill Category *</label>
                <select value={tradeCategory} onChange={e => setTradeCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 outline-none">
                  {TRADE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-700 mb-1.5 block">Experience (Years) *</label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                    <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <input type="number" min="0" max="50" value={experience} onChange={e => setExperience(e.target.value)} required placeholder="e.g. 5" className="bg-transparent text-sm font-medium text-slate-900 outline-none flex-1 placeholder:text-slate-400 w-0" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 mb-1.5 block">Rate per Hour (₹) *</label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                    <IndianRupee className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <input type="number" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} required placeholder="e.g. 300" className="bg-transparent text-sm font-medium text-slate-900 outline-none flex-1 placeholder:text-slate-400 w-0" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 mb-1.5 block">Service Area (City / Area) *</label>
                <input value={serviceArea} onChange={e => setServiceArea(e.target.value)} required placeholder="e.g. Koramangala, Bengaluru" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400" />
              </div>

              {/* Resume / Background Summary */}
              <div>
                <label className="text-xs font-black text-slate-700 mb-1.5 block">Your Resume / Qualifications & Background *</label>
                <textarea
                  rows={2}
                  required
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                  placeholder="e.g. Certified technician, 5 years at HomeCraft, ITI Electrical diploma, trained in safety standards."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-medium text-slate-900 outline-none placeholder:text-slate-400 resize-none"
                />
              </div>

              {/* Previous Work & Projects */}
              <div>
                <label className="text-xs font-black text-slate-700 mb-1.5 block">Previous Work Done & Experience *</label>
                <textarea
                  rows={3}
                  required
                  value={previousWork}
                  onChange={e => setPreviousWork(e.target.value)}
                  placeholder="e.g. Completed 200+ residential tap replacements, pipeline repairs, commercial apartment drainage systems."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-medium text-slate-900 outline-none placeholder:text-slate-400 resize-none"
                />
              </div>

              {/* Specialist Profile Photo Upload */}
              <div>
                <label className="text-xs font-black text-slate-700 mb-1.5 block">Your Profile Photo (Face Photo) *</label>
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  ref={profileInputRef}
                  onChange={(e) => handlePhotoUpload(e, setProfilePhoto, '📸 Profile photo updated!')}
                  className="hidden"
                />
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-300">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => profileInputRef.current?.click()}
                      className="py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Take Selfie / Upload Photo
                    </button>
                    <p className="text-[10px] text-slate-400 mt-1">Displayed to customers when you arrive</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 mb-1.5 block">ID Proof Type *</label>
                <select value={idProofType} onChange={e => setIdProofType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 outline-none">
                  <option>Aadhaar Card</option>
                  <option>PAN Card</option>
                  <option>Driving Licence</option>
                  <option>Voter ID</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 mb-1.5 block">ID Proof Number *</label>
                <input value={idProofNumber} onChange={e => setIdProofNumber(e.target.value)} required placeholder="Enter your ID number" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400" />
              </div>

              {/* ID Proof Card / Document Photo Upload */}
              <div>
                <label className="text-xs font-black text-slate-700 mb-1.5 block">Upload ID Proof Document Photo *</label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={idDocInputRef}
                  onChange={(e) => handlePhotoUpload(e, setIdDocumentPhoto, '📄 ID proof document uploaded!')}
                  className="hidden"
                />
                <div className="bg-slate-50 border border-dashed border-blue-300 rounded-2xl p-3 text-center">
                  {idDocumentPhoto ? (
                    <div className="space-y-2">
                      <img src={idDocumentPhoto} alt="ID Document Preview" className="w-full h-28 object-cover rounded-xl border border-slate-200" />
                      <button
                        type="button"
                        onClick={() => idDocInputRef.current?.click()}
                        className="text-xs text-blue-600 font-bold underline"
                      >
                        Change ID Document Photo
                      </button>
                    </div>
                  ) : (
                    <div className="py-2">
                      <FileCheck className="w-8 h-8 text-blue-400 mx-auto mb-1.5" />
                      <button
                        type="button"
                        onClick={() => idDocInputRef.current?.click()}
                        className="py-2 px-3 bg-blue-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Take Photo of {idProofType}
                      </button>
                      <p className="text-[10px] text-slate-400 mt-1">Clear photo of original Aadhaar, PAN, or Licence</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-xs text-blue-700 font-medium">
                📋 Admin will verify your details and approve your account. After approval, you can list your services on NSO.
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? 'Submitting...' : (<><span>Submit Application</span><ChevronRight className="w-4 h-4" /></>)}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSellerSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 mb-1.5 block">Your Full Name *</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                  <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input value={sellerName} onChange={e => setSellerName(e.target.value)} required placeholder="Your name" className="bg-transparent text-sm font-medium text-slate-900 outline-none flex-1 placeholder:text-slate-400" />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 mb-1.5 block">Phone Number *</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input value={sellerPhone} onChange={e => setSellerPhone(e.target.value)} required placeholder="+91 9876543210" className="bg-transparent text-sm font-medium text-slate-900 outline-none flex-1 placeholder:text-slate-400" />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 mb-1.5 block">Store / Business Name *</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                  <Store className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input value={storeName} onChange={e => setStoreName(e.target.value)} required placeholder="e.g. Ravi Electronics" className="bg-transparent text-sm font-medium text-slate-900 outline-none flex-1 placeholder:text-slate-400" />
                </div>
              </div>

              {/* Store Logo / Banner Upload */}
              <div>
                <label className="text-xs font-black text-slate-700 mb-1.5 block">Store Logo / Shop Front Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={storeLogoRef}
                  onChange={(e) => handlePhotoUpload(e, setStoreLogo, '🏪 Store photo updated!')}
                  className="hidden"
                />
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3">
                  <div className="w-14 h-14 rounded-2xl bg-orange-100 overflow-hidden flex-shrink-0 border border-orange-200">
                    <img src={storeLogo} alt="Store Logo" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => storeLogoRef.current?.click()}
                      className="py-2 px-3 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Take Shop Photo / Upload Logo
                    </button>
                    <p className="text-[10px] text-slate-400 mt-1">Displayed on your seller storefront</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 mb-1.5 block">Business Type *</label>
                <select value={businessType} onChange={e => setBusinessType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 outline-none">
                  {BUSINESS_TYPES.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 mb-1.5 block">Product Category *</label>
                <input value={productCategory} onChange={e => setProductCategory(e.target.value)} required placeholder="e.g. Electronics, Clothing, Food..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400" />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 mb-1.5 block">GSTIN (optional)</label>
                <input value={gstin} onChange={e => setGstin(e.target.value)} placeholder="GST number if registered" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400" />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 mb-1.5 block">Business Address *</label>
                <textarea value={sellerAddress} onChange={e => setSellerAddress(e.target.value)} required rows={2} placeholder="Full address of your shop/warehouse" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 outline-none resize-none placeholder:text-slate-400" />
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 text-xs text-orange-700 font-medium">
                🏪 Admin will verify your store KYC. After approval, you can list products. NSO takes 10% commission on each sale.
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl bg-orange-500 text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? 'Submitting...' : (<><span>Submit Store Application</span><ChevronRight className="w-4 h-4" /></>)}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { UserCategory, UserProfile } from '../types';
import { ChevronRight, ChevronLeft, Check, TrendingUp, ShieldCheck, MapPin, UserCheck } from 'lucide-react';

interface ProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    age: 18,
    gender: 'Male',
    state: 'Maharashtra',
    category: UserCategory.Farmer,
    annualIncome: 50000,
    hasAadhaar: false,
    hasPan: false,
    hasRationCard: false,
    hasIncomeCertificate: false
  });

  const handleChange = (key: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);
  
  const handleFinish = () => {
    onComplete(formData as UserProfile);
  };

  const strengthScore = () => {
    let score = 0;
    if (formData.name) score += 20;
    if (formData.state) score += 20;
    if (formData.hasAadhaar) score += 15;
    if (formData.hasPan) score += 15;
    if (formData.hasRationCard) score += 15;
    if (formData.hasIncomeCertificate) score += 15;
    return Math.min(100, score);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full flex flex-col md:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Progress Side */}
        <div className="w-full md:w-80 bg-[#003366] p-8 text-white flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-8">Build Your Profile</h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${step >= 1 ? 'bg-[#FF9933] border-[#FF9933] shadow-lg shadow-orange-500/30' : 'border-blue-300'}`}>
                  {step > 1 ? <Check className="w-6 h-6" /> : '1'}
                </div>
                <div>
                  <p className="font-bold">Personal</p>
                  <p className="text-xs text-blue-200">Basic identification</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${step >= 2 ? 'bg-[#FF9933] border-[#FF9933] shadow-lg shadow-orange-500/30' : 'border-blue-300'}`}>
                  {step > 2 ? <Check className="w-6 h-6" /> : '2'}
                </div>
                <div>
                  <p className="font-bold">Economic</p>
                  <p className="text-xs text-blue-200">Income & Occupation</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 p-4 rounded-2xl mt-8">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold">Profile Strength</p>
              <p className="text-lg font-bold text-[#FF9933]">{strengthScore()}%</p>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#FF9933] transition-all duration-500" 
                style={{ width: `${strengthScore()}%` }}
              />
            </div>
            <p className="text-[10px] mt-2 text-blue-200">Higher score reveals more schemes</p>
          </div>
        </div>

        {/* Content Side */}
        <div className="flex-1 p-8 md:p-12">
          {step === 1 ? (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Who are you?</h3>
                <p className="text-gray-500">We use this to find documents relevant to your identity.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#003366] outline-none text-black placeholder:text-gray-400" 
                    placeholder="As per Aadhaar"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Age</label>
                  <input 
                    type="number" 
                    value={formData.age}
                    onChange={(e) => handleChange('age', parseInt(e.target.value))}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#003366] outline-none text-black" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Gender</label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#003366] outline-none text-black"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">State</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select 
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#003366] outline-none appearance-none text-black"
                    >
                      <option>Maharashtra</option>
                      <option>Gujarat</option>
                      <option>Uttar Pradesh</option>
                      <option>Punjab</option>
                      <option>Bihar</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-8 flex justify-end">
                <button 
                  onClick={handleNext}
                  className="bg-[#003366] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#002244] transition-all"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Economic Profile</h3>
                <p className="text-gray-500">Eligibility for most schemes depends on your occupation and income.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Primary Occupation</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.values(UserCategory).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleChange('category', cat)}
                        className={`p-4 rounded-2xl border text-sm font-medium transition-all ${
                          formData.category === cat 
                          ? 'border-[#003366] bg-blue-50 text-[#003366]' 
                          : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-semibold text-gray-700">Approx. Annual Family Income</label>
                    <span className="text-[#003366] font-bold">₹{formData.annualIncome?.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="10000" 
                    max="1000000" 
                    step="10000"
                    value={formData.annualIncome}
                    onChange={(e) => handleChange('annualIncome', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#003366]" 
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                    <span>Low Income</span>
                    <span>High Income</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-semibold text-gray-700">Documents You Already Have</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'hasAadhaar', label: 'Aadhaar Card', icon: ShieldCheck },
                      { id: 'hasPan', label: 'PAN Card', icon: TrendingUp },
                      { id: 'hasRationCard', label: 'Ration Card', icon: MapPin },
                      { id: 'hasIncomeCertificate', label: 'Income Cert', icon: UserCheck },
                    ].map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => handleChange(doc.id as keyof UserProfile, !formData[doc.id as keyof UserProfile])}
                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                          formData[doc.id as keyof UserProfile]
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'bg-gray-50 border-gray-100 text-gray-500'
                        }`}
                      >
                        <doc.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-xs font-bold">{doc.label}</span>
                        {formData[doc.id as keyof UserProfile] && <Check className="w-4 h-4 ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-8 flex justify-between">
                <button 
                  onClick={handlePrev}
                  className="px-8 py-4 text-gray-500 font-bold flex items-center gap-2 hover:bg-gray-100 rounded-2xl transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
                <button 
                  onClick={handleFinish}
                  className="bg-[#003366] text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#002244] transition-all shadow-xl shadow-blue-900/10"
                >
                  Finish & Explore
                  <Check className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;

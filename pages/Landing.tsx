
import React, { useState } from 'react';
import { Globe, ArrowRight, ShieldCheck, UserCheck, Heart } from 'lucide-react';
import { LANGUAGES } from '../constants.tsx';

interface LandingProps {
  onLogin: () => void;
}

const Landing: React.FC<LandingProps> = ({ onLogin }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [lang, setLang] = useState('en');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length === 10) setShowOtp(true);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) onLogin();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Visual Side */}
      <div className="hidden md:flex flex-1 bg-[#003366] p-12 flex-col justify-between text-white relative">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl">
            <ShieldCheck className="text-[#003366] w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">YojanaMitra AI</h1>
        </div>

        <div className="relative z-10 space-y-8 max-w-lg">
          <h2 className="text-5xl font-bold leading-tight">
            Your Smart Guide to <span className="text-[#FF9933]">Government Benefits</span>
          </h2>
          <p className="text-xl text-blue-100 leading-relaxed">
            Simplified access to 500+ government schemes and documents for every Indian citizen.
          </p>
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <UserCheck className="w-8 h-8 text-[#FF9933] mb-2" />
              <p className="text-sm font-semibold">Farmers & Students</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <Heart className="w-8 h-8 text-[#FF9933] mb-2" />
              <p className="text-sm font-semibold">Senior Citizens</p>
            </div>
          </div>
        </div>

        <div className="text-blue-300 text-sm flex gap-6">
          <span>Digital India Initiative</span>
          <span>•</span>
          <span>Verified Portals</span>
        </div>

        {/* Decor */}
        <div className="absolute top-1/2 -right-20 transform -translate-y-1/2 w-64 h-64 bg-[#FF9933] rounded-full blur-[120px] opacity-30"></div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-20 py-12 relative">
        <div className="absolute top-8 right-8">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors">
            <Globe className="w-4 h-4 text-gray-500" />
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none text-black"
            >
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto space-y-10">
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-gray-900">Welcome Back</h3>
            <p className="text-gray-500">Sign in to access your government portal</p>
          </div>

          {!showOtp ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                <div className="flex items-center gap-3 border-2 border-gray-100 focus-within:border-[#003366] rounded-2xl p-4 transition-all bg-gray-50/50">
                  <span className="text-gray-400 font-bold border-r border-gray-200 pr-3">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10 digit number"
                    className="flex-1 bg-transparent focus:outline-none text-lg font-medium text-black placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-[#003366] hover:bg-[#002244] text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-900/10 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                Send OTP
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-700">Enter OTP</label>
                  <button type="button" onClick={() => setShowOtp(false)} className="text-[#003366] text-xs font-bold hover:underline">Change Number</button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="0 0 0 0 0 0"
                  className="w-full text-center tracking-[1em] border-2 border-[#003366] rounded-2xl p-4 text-2xl font-bold focus:outline-none bg-blue-50/50 text-black"
                  required
                />
                <p className="text-center text-sm text-gray-500 pt-2">
                  Didn't receive code? <button type="button" className="text-[#FF9933] font-bold hover:underline">Resend in 30s</button>
                </p>
              </div>
              <button
                type="submit"
                className="w-full bg-[#FF9933] hover:bg-[#e68a2e] text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-orange-900/10 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                Verify & Login
              </button>
            </form>
          )}

          <div className="pt-10 flex flex-col items-center gap-4">
            <div className="w-full h-px bg-gray-100 relative">
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs text-gray-400 font-medium">TRUSTED BY OVER 1M+ INDIANS</span>
            </div>
            <img src="https://picsum.photos/id/1011/400/200" alt="Rural citizen illustration" className="w-full rounded-2xl opacity-80 grayscale-[30%] shadow-inner" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;

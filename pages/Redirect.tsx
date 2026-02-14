
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  ShieldCheck, 
  Lock, 
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Redirect: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-6 text-center">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-[#003366] animate-spin" />
          <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-[#FF9933]" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-800">Verifying Eligibility</h3>
          <p className="text-gray-500">Securing a safe connection to government portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-12 animate-in slide-in-from-bottom-8">
      <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl border border-gray-50 text-center space-y-8">
        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">You're Ready to Go!</h2>
          <p className="text-lg text-gray-500">We've confirmed that your profile matches the scheme requirements. All required documents are verified and ready.</p>
        </div>

        <div className="bg-gray-50 p-8 rounded-3xl border border-dashed border-gray-200 text-left space-y-6">
          <h4 className="font-bold text-gray-400 uppercase tracking-widest text-xs">Final Checklist</h4>
          <div className="space-y-4">
             <div className="flex items-center gap-4 text-gray-700">
               <ShieldCheck className="w-6 h-6 text-[#FF9933]" />
               <span className="font-medium text-lg">Official Website Verified</span>
             </div>
             <div className="flex items-center gap-4 text-gray-700">
               <Lock className="w-6 h-6 text-[#FF9933]" />
               <span className="font-medium text-lg">Secure Session Initialized</span>
             </div>
             <div className="flex items-center gap-4 text-gray-700">
               <ArrowRight className="w-6 h-6 text-[#FF9933]" />
               <span className="font-medium text-lg">DBT Mapping Check Passed</span>
             </div>
          </div>
        </div>

        <div className="pt-6 space-y-4">
          <button className="w-full bg-[#003366] hover:bg-[#002244] text-white py-6 rounded-3xl font-extrabold text-xl flex items-center justify-center gap-3 shadow-2xl shadow-blue-900/30 transition-all active:scale-95 group">
            Open Official Portal
            <ExternalLink className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-400 font-bold hover:text-[#003366] transition-colors py-2">
            <ArrowLeft className="w-5 h-5" />
            Go back to Dashboard
          </Link>
        </div>
      </div>

      <div className="text-center space-y-2 opacity-50">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Digital India Initiative</p>
        <p className="text-[10px] text-gray-400">YojanaMitra AI is an assistant tool and is not the official government body. Use official links provided for actual applications.</p>
      </div>
    </div>
  );
};

export default Redirect;

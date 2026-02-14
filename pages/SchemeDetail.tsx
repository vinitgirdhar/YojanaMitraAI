
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { SCHEMES } from '../constants.tsx';
import { 
  ChevronLeft, 
  CheckCircle, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowUpRight, 
  FileCheck,
  Info,
  ExternalLink,
  Clock
} from 'lucide-react';

const SchemeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const scheme = SCHEMES.find(s => s.id === id);

  if (!scheme) return <div className="p-10 text-center">Scheme not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Link to="/schemes" className="inline-flex items-center gap-2 text-gray-500 font-bold hover:text-[#003366] transition-colors">
        <ChevronLeft className="w-5 h-5" />
        Back to Schemes
      </Link>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        {/* Banner Section */}
        <div className="bg-[#003366] p-10 md:p-14 text-white relative">
          <div className="relative z-10 space-y-6">
             <div className="flex items-center gap-2 bg-white/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-md">
                <CheckCircle className="w-4 h-4 text-[#FF9933]" />
                <span className="text-xs font-bold uppercase tracking-widest">{scheme.category} Welfare</span>
             </div>
             <h1 className="text-3xl md:text-5xl font-bold leading-tight max-w-2xl">{scheme.name}</h1>
             <div className="flex flex-wrap gap-8 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-[#FF9933]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-blue-200 uppercase font-bold">Eligibility</p>
                    <p className="text-lg font-bold">{scheme.matchPercentage}% Verified</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-[#FF9933]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-blue-200 uppercase font-bold">Process</p>
                    <p className="text-lg font-bold">Fully Online</p>
                  </div>
                </div>
             </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        </div>

        {/* Content Section */}
        <div className="p-10 md:p-14 space-y-12">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Info className="w-6 h-6 text-[#003366]" />
              Scheme Overview
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              {scheme.description}
            </p>
          </div>

          <div className="bg-[#FFF9F3] p-8 rounded-[2rem] border border-orange-100 space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#FF9933]" />
              Who can Apply?
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                `Residents of ${scheme.category === 'Farmer' ? 'Rural Area' : 'India'}`,
                `Age between ${scheme.category === 'Senior Citizen' ? '60+' : '18-50'} years`,
                'Annual family income below ₹2.5 Lakh',
                'Not currently receiving similar benefits'
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700 bg-white p-4 rounded-xl shadow-sm border border-orange-50">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <FileCheck className="w-6 h-6 text-[#003366]" />
              Required Documents
            </h3>
            <div className="space-y-3">
              {scheme.requiredDocs.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <span className="text-xs font-bold text-gray-400">{i + 1}</span>
                    </div>
                    <span className="font-bold text-gray-800">{doc}</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Available</span>
                </div>
              ))}
            </div>

            {scheme.id === '3' && (
              <div className="bg-red-50 p-6 rounded-2xl flex items-center gap-4 border border-red-100 animate-pulse">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <div className="flex-1">
                  <p className="font-bold text-red-800">Income Certificate Missing</p>
                  <p className="text-sm text-red-600">You must update your income certificate to apply for this scholarship.</p>
                </div>
                <Link to="/docs" className="bg-red-500 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-red-500/20">
                  Apply Now
                </Link>
              </div>
            )}
          </div>

          <div className="pt-8 flex flex-col md:flex-row gap-4">
            <Link to="/redirect" className="flex-1 bg-[#003366] hover:bg-[#002244] text-white py-5 rounded-[1.5rem] font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20 transition-all active:scale-95">
              Proceed to Official Website
              <ExternalLink className="w-6 h-6" />
            </Link>
            <button className="flex-1 bg-white border-2 border-gray-100 hover:border-[#003366] text-gray-700 hover:text-[#003366] py-5 rounded-[1.5rem] font-bold text-lg flex items-center justify-center gap-3 transition-all">
              Save for Later
              <Clock className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeDetail;

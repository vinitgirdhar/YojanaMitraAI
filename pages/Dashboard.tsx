
import React from 'react';
import { UserProfile, UserCategory } from '../types';
import { 
  FileText, 
  Coins, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Hero */}
      <section className="bg-[#003366] rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <p className="text-blue-200 font-medium tracking-wide uppercase text-xs">Namaste, {profile.name} 👋</p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            You are eligible for <span className="text-[#FF9933]">12 Government Schemes</span>
          </h1>
          <p className="text-blue-100 text-lg opacity-80">
            Based on your profile as a <span className="font-bold underline decoration-[#FF9933]">{profile.category}</span> from {profile.state}.
          </p>
          <div className="pt-6 flex flex-wrap gap-4">
            <Link to="/schemes" className="bg-[#FF9933] hover:bg-[#e68a2e] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-orange-900/20">
              View All Schemes
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
        
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
      </section>

      {/* Main Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/docs" className="group bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all border border-gray-100 flex items-start gap-6">
          <div className="bg-blue-50 p-5 rounded-3xl group-hover:bg-[#003366] transition-colors">
            <FileText className="w-10 h-10 text-[#003366] group-hover:text-white" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-2xl font-bold text-gray-800">My Documentation</h3>
            <p className="text-gray-500 leading-relaxed">Renew, apply for new IDs, or store your digital documents securely.</p>
            <div className="pt-4 flex items-center gap-2 text-[#003366] font-bold">
              <span>Go to Docs</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        <Link to="/schemes" className="group bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all border border-gray-100 flex items-start gap-6">
          <div className="bg-orange-50 p-5 rounded-3xl group-hover:bg-[#FF9933] transition-colors">
            <Coins className="w-10 h-10 text-[#FF9933] group-hover:text-white" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-2xl font-bold text-gray-800">Find Schemes</h3>
            <p className="text-gray-500 leading-relaxed">Discover financial aids, health benefits, and subsidies you qualify for.</p>
            <div className="pt-4 flex items-center gap-2 text-[#FF9933] font-bold">
              <span>Find Benefits</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </div>

      {/* Stats and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Stats */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-gray-800">Profile Health</h4>
            <Award className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="relative flex flex-col items-center py-4">
             <div className="w-32 h-32 rounded-full border-8 border-gray-50 flex items-center justify-center relative overflow-hidden">
                <div 
                  className="absolute inset-0 border-8 border-[#003366] border-t-transparent border-l-transparent rounded-full rotate-45"
                  style={{ transform: `rotate(${profile.hasAadhaar ? 180 : 45}deg)` }}
                />
                <span className="text-3xl font-extrabold text-[#003366]">85%</span>
             </div>
             <p className="mt-4 text-center text-sm text-gray-500 font-medium">Almost complete! Link your mobile number to hit 100%.</p>
          </div>
          <button className="w-full py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-600 font-bold text-sm transition-all">
            Update Profile
          </button>
        </div>

        {/* Missing Documents Alert */}
        <div className="lg:col-span-2 bg-[#FFF9F3] p-8 rounded-[2rem] border border-orange-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-[#FF9933]" />
            <h4 className="font-bold text-gray-800">Important Alerts</h4>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl flex items-center justify-between border border-orange-50 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">Income Certificate Expired</p>
                  <p className="text-xs text-gray-400">Expired on 31 Dec 2023</p>
                </div>
              </div>
              <Link to="/docs" className="bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-600">
                Renew Now
              </Link>
            </div>

            {!profile.hasPan && (
              <div className="bg-white p-4 rounded-2xl flex items-center justify-between border border-orange-50 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">PAN Card Missing</p>
                    <p className="text-xs text-gray-400">Required for direct cash benefits over ₹50,000</p>
                  </div>
                </div>
                <button className="bg-[#003366] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#002244]">
                  Apply New
                </button>
              </div>
            )}

            <div className="bg-white p-4 rounded-2xl flex items-center justify-between border border-orange-50 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">Aadhaar Linked Successfully</p>
                  <p className="text-xs text-gray-400">Bank account mapped for DBT</p>
                </div>
              </div>
              <span className="text-green-600 font-bold text-xs">Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

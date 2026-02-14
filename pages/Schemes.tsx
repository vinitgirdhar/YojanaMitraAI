
import React, { useState } from 'react';
import { SCHEMES } from '../constants.tsx';
import { UserProfile, UserCategory } from '../types';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Schemes: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => {
  const [activeCategory, setActiveCategory] = useState<UserCategory | 'All'>('All');
  const [search, setSearch] = useState('');

  const filteredSchemes = SCHEMES.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Search Header */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Government Schemes</h2>
          <p className="text-gray-500 font-medium">Recommended based on your profile as a {userProfile.category}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, benefit, or category..."
              className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 shadow-sm rounded-[1.5rem] focus:ring-2 focus:ring-[#003366] outline-none text-lg text-black placeholder:text-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
             <div className="flex gap-2 bg-white p-2 rounded-[1.5rem] border border-gray-100 shadow-sm">
                <button 
                  onClick={() => setActiveCategory('All')}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                    activeCategory === 'All' ? 'bg-[#003366] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  All
                </button>
                {Object.values(UserCategory).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                      activeCategory === cat ? 'bg-[#003366] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchemes.map((scheme) => (
          <div key={scheme.id} className="group bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden">
            <div className="p-8 space-y-6 flex-1">
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  scheme.eligibility === 'High' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                }`}>
                  {scheme.eligibility === 'High' ? <TrendingUp className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
                </div>
                <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  scheme.eligibility === 'High' ? 'bg-green-500 text-white' : 'bg-[#FF9933] text-white'
                }`}>
                  <Zap className="w-3 h-3 fill-current" />
                  {scheme.matchPercentage}% Match
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-800 leading-tight group-hover:text-[#003366] transition-colors">{scheme.name}</h3>
                <p className="text-sm text-gray-500 font-medium">{scheme.category} Welfare</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Key Benefit</p>
                <p className="text-sm text-gray-700 line-clamp-2">{scheme.benefits}</p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Required Documents</p>
                <div className="flex flex-wrap gap-2">
                  {scheme.requiredDocs.slice(0, 3).map((doc, i) => (
                    <span key={i} className="text-[10px] font-bold bg-white border border-gray-100 px-3 py-1.5 rounded-lg text-gray-500">
                      {doc}
                    </span>
                  ))}
                  {scheme.requiredDocs.length > 3 && (
                    <span className="text-[10px] font-bold text-[#003366]">+ {scheme.requiredDocs.length - 3} more</span>
                  )}
                </div>
              </div>
            </div>

            <Link 
              to={`/schemes/${scheme.id}`}
              className="mt-auto bg-gray-50 hover:bg-[#003366] group-hover:bg-[#003366] hover:text-white group-hover:text-white p-6 flex items-center justify-center gap-2 font-bold transition-all border-t border-gray-100"
            >
              View Eligibility & Apply
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        ))}
      </div>

      {filteredSchemes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <HelpCircle className="w-16 h-16 text-gray-200" />
          <h3 className="text-xl font-bold text-gray-400">No schemes found matching your search.</h3>
          <button onClick={() => {setSearch(''); setActiveCategory('All');}} className="text-[#003366] font-bold underline">Clear all filters</button>
        </div>
      )}
    </div>
  );
};

export default Schemes;

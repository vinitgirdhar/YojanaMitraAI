
import React, { useState } from 'react';
import { DOCUMENTS } from '../constants.tsx';
import { 
  FileText, 
  Search, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  PlusCircle, 
  Download,
  Info
} from 'lucide-react';

const Documentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'verified' | 'missing'>('all');
  const [search, setSearch] = useState('');

  const filteredDocs = DOCUMENTS.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 'verified') return matchesSearch && doc.status === 'Verified';
    if (activeTab === 'missing') return matchesSearch && (doc.status === 'Missing' || doc.status === 'Expired');
    return matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Documentation</h2>
          <p className="text-gray-500 font-medium">Manage your digital identity documents</p>
        </div>
        <button className="bg-[#003366] hover:bg-[#002244] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-blue-900/10">
          <PlusCircle className="w-5 h-5" />
          Add New Document
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="flex bg-gray-50 p-1.5 rounded-2xl flex-1 max-w-md">
            {(['all', 'verified', 'missing'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all capitalize ${
                  activeTab === tab ? 'bg-white text-[#003366] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#003366] outline-none text-black placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-px bg-gray-100">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="bg-white p-8 hover:bg-gray-50 transition-all flex flex-col justify-between group">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-3xl ${
                  doc.status === 'Verified' ? 'bg-green-50 text-green-600' : 
                  doc.status === 'Expired' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                }`}>
                  <FileText className="w-8 h-8" />
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${
                  doc.status === 'Verified' ? 'bg-green-50 border-green-200 text-green-700' : 
                  doc.status === 'Expired' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-orange-50 border-orange-200 text-orange-700'
                }`}>
                  {doc.status === 'Verified' && <CheckCircle className="w-3 h-3" />}
                  {doc.status === 'Expired' && <Clock className="w-3 h-3" />}
                  {doc.status === 'Missing' && <AlertTriangle className="w-3 h-3" />}
                  {doc.status}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-800">{doc.name}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{doc.description}</p>
                </div>

                {doc.expiryDate && (
                  <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                    <p className="text-xs text-red-600 font-bold uppercase tracking-wider mb-1">Attention Required</p>
                    <p className="text-sm text-red-700">Expired on {doc.expiryDate}. Update immediately for scheme continuity.</p>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Info className="w-3 h-3" />
                    Instructions
                  </p>
                  <ul className="space-y-1">
                    {doc.instructions.map((ins, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                        <div className="w-1 h-1 bg-gray-300 rounded-full" />
                        {ins}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <a 
                  href={doc.officialUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 bg-white border border-gray-200 hover:border-[#003366] hover:text-[#003366] text-gray-700 px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Official Portal
                </a>
                {doc.status === 'Verified' ? (
                  <button className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-500 px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                ) : (
                  <button className="flex-1 bg-[#FF9933] hover:bg-[#e68a2e] text-white px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-900/10">
                    {doc.status === 'Expired' ? 'Renew Now' : 'Apply New'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Documentation;

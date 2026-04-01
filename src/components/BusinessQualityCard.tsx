import React from 'react';
import { BusinessSnapshot } from '../services/business';
import { Briefcase, TrendingUp, AlertCircle, DollarSign, Building, ShieldCheck, ShieldAlert, Landmark, Info, CheckCircle, XCircle } from 'lucide-react';

interface BusinessQualityCardProps {
  snapshot: BusinessSnapshot;
}

export function BusinessQualityCard({ snapshot }: BusinessQualityCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Very Easy': return 'text-green-600';
      case 'Easy': return 'text-green-500';
      case 'Medium': return 'text-yellow-600';
      case 'Difficult': return 'text-orange-600';
      case 'Very Difficult': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="brutal-card bg-white p-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-4 border-[#1e1e24] pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Briefcase className="w-10 h-10 text-[#ffde59]" />
            <h2 className="text-4xl font-black uppercase tracking-tighter">{snapshot.city} Business Intel</h2>
          </div>
          <p className="text-lg font-bold text-gray-600 max-w-2xl">{snapshot.summary}</p>
        </div>
        <div className="flex flex-col items-center">
          <div className={`w-20 h-20 rounded-full border-4 border-[#1e1e24] ${getScoreColor(snapshot.overallFriendlinessScore)} flex items-center justify-center text-3xl font-black shadow-[4px_4px_0px_0px_#1e1e24]`}>
            {snapshot.overallFriendlinessScore}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest mt-2">Friendliness Score</span>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="brutal-card bg-gray-50 p-4 flex flex-col items-center text-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-500" />
          <div className={`text-xl font-black ${getDifficultyColor(snapshot.registrationProcess)}`}>{snapshot.registrationProcess}</div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Registration Process</div>
        </div>
        <div className="brutal-card bg-gray-50 p-4 flex flex-col items-center text-center gap-2">
          <DollarSign className="w-6 h-6 text-green-500" />
          <div className="text-xl font-black">{snapshot.investmentAmount}</div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Typical Investment</div>
        </div>
        <div className="brutal-card bg-gray-50 p-4 flex flex-col items-center text-center gap-2">
          <Building className="w-6 h-6 text-purple-500" />
          <div className="text-xl font-black">{snapshot.commercialRent}</div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Commercial Rent</div>
        </div>
      </div>

      {/* Market Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="brutal-card bg-green-50 p-6 space-y-4">
          <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 text-green-700">
            <TrendingUp className="w-5 h-5" /> Thriving
          </h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-green-600/60">High Demand, Low Competition</p>
          <ul className="space-y-2">
            {snapshot.thrivingBusinesses.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm font-bold">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="brutal-card bg-yellow-50 p-6 space-y-4">
          <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 text-yellow-700">
            <Info className="w-5 h-5" /> Viable
          </h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-yellow-600/60">Good Demand, Moderate Competition</p>
          <ul className="space-y-2">
            {snapshot.viableBusinesses.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm font-bold">
                <div className="w-4 h-4 rounded-full bg-yellow-400 shrink-0" /> {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="brutal-card bg-red-50 p-6 space-y-4">
          <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" /> Difficult
          </h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-red-600/60">Saturated or Restricted</p>
          <ul className="space-y-2">
            {snapshot.difficultBusinesses.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm font-bold">
                <XCircle className="w-4 h-4 text-red-500 shrink-0" /> {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Ownership & Realities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-6">
          <div className="brutal-card bg-white p-6 space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-500" /> Foreign Ownership
            </h3>
            <p className="text-sm font-bold text-gray-700 leading-relaxed">
              {snapshot.foreignOwnership}
            </p>
          </div>

          <div className="border-4 border-[#1e1e24] rounded-2xl bg-[#1e1e24] text-white p-6 space-y-4 shadow-[8px_8px_0px_0px_#ffde59]">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 text-[#ffde59]">
              <AlertCircle className="w-6 h-6" /> Unfiltered Realities
            </h3>
            <p className="text-sm font-bold leading-relaxed opacity-90 italic">
              "{snapshot.businessRealities}"
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="brutal-card bg-white p-6 space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <Landmark className="w-6 h-6 text-purple-500" /> Banking & Currency
            </h3>
            <p className="text-sm font-bold text-gray-700 leading-relaxed">
              {snapshot.bankingAndCurrency}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="brutal-card bg-green-50 p-4 space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-green-700">Can Do</h4>
              <ul className="space-y-1">
                {snapshot.restrictions.canDo.map((item, i) => (
                  <li key={i} className="text-xs font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="brutal-card bg-red-50 p-4 space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-red-700">Can't Do</h4>
              <ul className="space-y-1">
                {snapshot.restrictions.cantDo.map((item, i) => (
                  <li key={i} className="text-xs font-bold flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-red-500" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Company Types */}
      <section className="space-y-4">
        <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <Building className="w-6 h-6" /> Available Company Types
        </h3>
        <div className="flex flex-wrap gap-3">
          {snapshot.companyTypes.map((type, i) => (
            <span key={i} className="px-4 py-2 bg-gray-100 border-2 border-[#1e1e24] rounded-xl font-black uppercase text-xs">
              {type}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

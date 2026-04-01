import React from 'react';
import { EducationSnapshot } from '../services/education';
import { 
  GraduationCap, 
  Users, 
  DollarSign, 
  BookOpen, 
  Heart, 
  Globe, 
  Bus, 
  Star, 
  ShieldCheck, 
  Info,
  Building2,
  Trophy,
  Clock,
  Wifi,
  Briefcase,
  Award,
  MessageSquare,
  Plane
} from 'lucide-react';

interface EducationCardProps {
  snapshot: EducationSnapshot;
}

export function EducationCard({ snapshot }: EducationCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-400';
    return 'bg-red-500';
  };

  return (
    <div className="brutal-card bg-white overflow-hidden flex flex-col gap-8 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-4 border-[#1e1e24] pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-10 h-10 text-[#1e1e24]" />
            <h2 className="text-4xl font-black uppercase tracking-tighter">{snapshot.city}</h2>
          </div>
          <p className="text-lg font-bold text-gray-600 max-w-2xl">{snapshot.summary}</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className={`w-20 h-20 rounded-full border-4 border-[#1e1e24] flex items-center justify-center text-3xl font-black shadow-[4px_4px_0px_0px_#1e1e24] ${getScoreColor(snapshot.overallScore)}`}>
            {snapshot.overallScore}
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Overall Quality</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* HIGHER EDUCATION - LEFT COLUMN: Recognition & Financials */}
        <div className="space-y-8">
          <div className="bg-purple-600 text-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-3xl font-black uppercase italic flex items-center gap-2">
              <Award className="w-8 h-8" /> Recognition & Costs
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Recognition & Types */}
            <section className="space-y-4">
              <h4 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <Globe className="w-5 h-5" /> Global Standing
              </h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {snapshot.higherEd.types.map((type, i) => (
                  <span key={i} className="px-3 py-1 bg-purple-100 border-2 border-purple-600 rounded-full text-[10px] font-black uppercase tracking-tight">
                    {type}
                  </span>
                ))}
              </div>
              <div className="p-4 bg-purple-50 border-2 border-purple-600 rounded-xl space-y-3">
                <div className="flex items-start gap-2">
                  <Trophy className="w-4 h-4 mt-0.5 text-purple-600" />
                  <p className="text-xs font-bold"><span className="uppercase text-[10px] text-gray-500">Global Ranking:</span> {snapshot.higherEd.accreditation.globalRanking}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-gray-500 block">National</span>
                    <p className="text-xs font-bold">{snapshot.higherEd.accreditation.national}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-gray-500 block">International</span>
                    <p className="text-xs font-bold">{snapshot.higherEd.accreditation.international}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Financials */}
            <section className="space-y-4">
              <h4 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <DollarSign className="w-5 h-5" /> Financial Reality
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 border-2 border-black rounded-xl">
                  <span className="text-[10px] font-black uppercase text-gray-500 block mb-1">Local Tuition</span>
                  <p className="text-sm font-black">{snapshot.higherEd.financials.tuitionLocal}</p>
                </div>
                <div className="p-4 bg-gray-50 border-2 border-black rounded-xl">
                  <span className="text-[10px] font-black uppercase text-gray-500 block mb-1">Intl Tuition</span>
                  <p className="text-sm font-black">{snapshot.higherEd.financials.tuitionIntl}</p>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 border-2 border-[#1e1e24] rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-yellow-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Funding & Fees</span>
                </div>
                <p className="text-xs font-bold mb-1"><span className="opacity-60">Admin Fees:</span> {snapshot.higherEd.financials.adminFees}</p>
                <p className="text-xs font-bold"><span className="opacity-60">Loans:</span> {snapshot.higherEd.financials.loanAvailability}</p>
              </div>
            </section>

            {/* International Experience */}
            <section className="space-y-4">
              <h4 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <Plane className="w-5 h-5" /> International Student Life
              </h4>
              <div className="p-4 bg-blue-50 border-2 border-blue-600 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-gray-500">Intl Student Body</span>
                  <span className="text-lg font-black text-blue-600">{snapshot.higherEd.internationalExperience.percentIntl}</span>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-gray-500 block">Support Services</span>
                  <div className="flex flex-wrap gap-2">
                    {snapshot.higherEd.internationalExperience.supportServices.map((service, i) => (
                      <span key={i} className="px-2 py-1 bg-white border border-blue-200 rounded text-[10px] font-bold">{service}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* HIGHER EDUCATION - RIGHT COLUMN: Outcomes & Top Unis */}
        <div className="space-y-8">
          <div className="bg-green-600 text-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-3xl font-black uppercase italic flex items-center gap-2">
              <Briefcase className="w-8 h-8" /> Career & Outcomes
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Outcomes */}
            <section className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 border-2 border-black rounded-lg">
                  <span className="text-[10px] font-black uppercase text-gray-500 block mb-1">Employment Rate</span>
                  <p className="text-lg font-black">{snapshot.higherEd.outcomes.employmentRate}</p>
                </div>
                <div className="p-3 bg-gray-50 border-2 border-black rounded-lg">
                  <span className="text-[10px] font-black uppercase text-gray-500 block mb-1">Avg Salary</span>
                  <p className="text-lg font-black">{snapshot.higherEd.outcomes.startingSalary}</p>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-gray-500 block">Top Employers in Region</span>
                <div className="flex flex-wrap gap-2">
                  {snapshot.higherEd.outcomes.topEmployers.map((emp, i) => (
                    <span key={i} className="px-2 py-1 bg-black text-white text-[10px] font-black uppercase">{emp}</span>
                  ))}
                </div>
              </div>
            </section>

            {/* Student Reviews */}
            <section className="space-y-4">
              <h4 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> Student Reviews
              </h4>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {Object.entries(snapshot.higherEd.studentReviews).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                      <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span>{value}/10</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 border border-black">
                      <div className="h-full bg-purple-600" style={{ width: `${(value as number) * 10}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Universities */}
            <section className="space-y-4">
              <h4 className="text-xl font-black uppercase tracking-tight italic">Top Institutions</h4>
              <div className="grid grid-cols-1 gap-4">
                {snapshot.higherEd.topUniversities.map((uni, i) => (
                  <div key={i} className="brutal-card bg-white p-4 relative border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="absolute -top-3 -right-2 bg-purple-600 text-white border-2 border-[#1e1e24] px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">
                      {uni.type}
                    </div>
                    <h5 className="font-black text-lg uppercase tracking-tight mb-1">{uni.name}</h5>
                    <p className="text-xs font-bold text-gray-600 italic">"{uni.highlight}"</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
}

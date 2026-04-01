import React from 'react';
import { SchoolQualitySnapshot } from '../services/schools';
import { GraduationCap, Star, Users, Globe, Monitor, CheckCircle, Info, BookOpen } from 'lucide-react';

interface SchoolQualityCardProps {
  snapshot: SchoolQualitySnapshot;
}

export function SchoolQualityCard({ snapshot }: SchoolQualityCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="brutal-card bg-white p-4 sm:p-8 space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-4 border-[#1e1e24] pb-6 sm:pb-8">
        <div className="space-y-2 w-full">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 sm:w-10 h-10 text-[#5ce1e6]" />
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter">{snapshot.city}</h2>
          </div>
          <p className="text-base sm:text-lg font-bold text-gray-600 max-w-2xl">{snapshot.summary}</p>
        </div>
        <div className="flex flex-row md:flex-col items-center gap-4 md:gap-2 w-full md:w-auto justify-between md:justify-center bg-gray-50 md:bg-transparent p-4 md:p-0 rounded-xl md:rounded-none border-2 md:border-0 border-[#1e1e24] md:border-transparent">
          <div className={`w-14 h-14 sm:w-20 h-20 rounded-full border-4 border-[#1e1e24] ${getScoreColor(snapshot.overallScore)} flex items-center justify-center text-xl sm:text-3xl font-black shadow-[3px_3px_0px_0px_#1e1e24] sm:shadow-[4px_4px_0px_0px_#1e1e24]`}>
            {snapshot.overallScore}
          </div>
          <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Overall Score</span>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="brutal-card bg-gray-50 p-4 flex flex-col items-center text-center gap-2">
          <Star className="w-6 h-6 text-yellow-500" />
          <div className="text-2xl font-black">{snapshot.satisfactionScore}/10</div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Parent Satisfaction</div>
        </div>
        <div className="brutal-card bg-gray-50 p-4 flex flex-col items-center text-center gap-2">
          <Users className="w-6 h-6 text-blue-500" />
          <div className="text-2xl font-black">{snapshot.teacherQualityRating}/10</div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Teacher Quality</div>
        </div>
        <div className="brutal-card bg-gray-50 p-4 flex flex-col items-center text-center gap-2">
          <Info className="w-6 h-6 text-purple-500" />
          <div className="text-lg font-black">{snapshot.ageRangesCovered}</div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Age Ranges Covered</div>
        </div>
      </div>

      {/* Classification & Curriculums */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <Info className="w-6 h-6" /> School Classifications
          </h3>
          <div className="space-y-3">
            {Object.entries(snapshot.classificationDistribution).map(([type, desc]) => (
              <div key={type} className="p-4 border-2 border-[#1e1e24] rounded-xl bg-white shadow-[2px_2px_0px_0px_#1e1e24]">
                <h4 className="font-black uppercase text-sm mb-1 text-[#5ce1e6]">{type}</h4>
                <p className="text-xs font-bold text-gray-700">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6" /> Curriculums Available
          </h3>
          <div className="flex flex-wrap gap-3">
            {snapshot.availableCurriculums.map((curr, i) => (
              <span key={i} className="px-4 py-2 bg-[#ffde59] border-2 border-[#1e1e24] rounded-full font-black uppercase text-xs shadow-[2px_2px_0px_0px_#1e1e24]">
                {curr}
              </span>
            ))}
          </div>
          
          <div className="mt-8 space-y-6">
            <div className="space-y-2">
              <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" /> English Language Support
              </h4>
              <p className="text-sm font-bold text-gray-600 bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                {snapshot.englishSupport}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Monitor className="w-4 h-4 text-purple-500" /> Tech Infrastructure
              </h4>
              <p className="text-sm font-bold text-gray-600 bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
                {snapshot.techInfrastructure}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Top Rated Schools */}
      <section className="space-y-6">
        <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-500" /> Top Rated Schools
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {snapshot.topRatedSchools.map((school, i) => (
            <div key={i} className="brutal-card bg-white p-6 hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-black uppercase leading-tight">{school.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black bg-[#1e1e24] text-white px-2 py-0.5 rounded">{school.type}</span>
                    <span className="text-[10px] font-black bg-[#5ce1e6] text-[#1e1e24] px-2 py-0.5 rounded">{school.curriculum}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded border border-yellow-300">
                  <Star className="w-3 h-3 text-yellow-600 fill-yellow-600" />
                  <span className="text-xs font-black">{school.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                <Users className="w-3 h-3" /> {school.ageRange}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

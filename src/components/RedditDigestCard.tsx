import React from 'react';
import { RedditDigest } from '../services/gemini';
import { MessageSquare, ArrowUp, Info, AlertTriangle, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface RedditDigestCardProps {
  digest: RedditDigest;
  isLoading?: boolean;
}

export const RedditDigestCard: React.FC<RedditDigestCardProps> = ({ digest, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white border-2 border-[#1e1e24] p-6 animate-pulse">
        <div className="h-6 bg-gray-200 w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-20 bg-gray-100"></div>
          <div className="h-20 bg-gray-100"></div>
          <div className="h-20 bg-gray-100"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-2 border-[#1e1e24] overflow-hidden"
    >
      {/* Header */}
      <div className="bg-[#1e1e24] text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#ffde59]" />
          <h3 className="font-black uppercase tracking-tight text-lg">
            {digest.subreddit} Digest
          </h3>
        </div>
        <div className="text-[10px] font-bold opacity-70 uppercase tracking-widest text-right">
          Last 7 days • {digest.postsScanned} posts scanned
        </div>
      </div>

      {/* Content */}
      <div className="p-0 divide-y-2 divide-[#1e1e24]">
        {digest.items.map((item, index) => (
          <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {item.type === 'tip' && <Info className="w-4 h-4 text-blue-600" />}
                {item.type === 'complaint' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                {item.type === 'gem' && <Star className="w-4 h-4 text-[#ffde59] fill-[#ffde59]" />}
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <ArrowUp className="w-3 h-3" />
                <span className="text-[10px] font-bold">{item.upvotes}</span>
              </div>
            </div>
            <p className="text-sm font-bold leading-relaxed text-[#1e1e24]">
              "{item.content}"
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-3 border-t-2 border-[#1e1e24]">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center">
          Summarized by TripIntel Intelligence • Data from Reddit
        </p>
      </div>
    </motion.div>
  );
};

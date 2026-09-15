import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function RecommendationCard({ recommendations, onTailorClick, isTailoring }) {
  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border-blue-500/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Tailoring Recommendations</h3>
            <p className="text-xs text-slate-400">
              Actions to optimize your genuine experience for maximum relevance.
            </p>
          </div>
        </div>

        {onTailorClick && (
          <button
            onClick={onTailorClick}
            disabled={isTailoring}
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            {isTailoring ? 'Tailoring Resume...' : 'Tailor My Resume'}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {recommendations && recommendations.length > 0 ? (
          recommendations.map((rec, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-200">
              <ArrowRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 italic">No recommendations available.</p>
        )}
      </div>
    </div>
  );
}

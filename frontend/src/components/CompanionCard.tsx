import { Video } from 'lucide-react';
import type { Companion } from '../types';

interface CompanionCardProps {
  companion: Companion;
  onSelect: () => void;
}

export function CompanionCard({ companion, onSelect }: CompanionCardProps) {
  return (
    <div className="group bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 cursor-pointer">
      <div className="aspect-square relative overflow-hidden bg-slate-900">
        <img
          src={companion.avatar_url}
          alt={companion.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
          {companion.name}
        </h3>

        <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
          {companion.description}
        </p>

        {companion.specialties && companion.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {companion.specialties.slice(0, 3).map((specialty, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-lg group-hover:bg-slate-600 transition-colors"
              >
                {specialty}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={onSelect}
          className="w-full py-2.5 sm:py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-500/50 active:scale-95"
        >
          <Video className="w-4 h-4" />
          <span className="text-sm sm:text-base">Start Call</span>
        </button>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCallStore } from '../stores/useCallStore';
import type { Companion } from '../types';
import { CompanionCard } from '../components/CompanionCard';
import { Search, Loader as Loader2 } from 'lucide-react';

export function Companions() {
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [filteredCompanions, setFilteredCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const setCompanion = useCallStore((state) => state.setCompanion);

  useEffect(() => {
    loadCompanions();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = companions.filter(companion =>
        companion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        companion.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        companion.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredCompanions(filtered);
    } else {
      setFilteredCompanions(companions);
    }
  }, [searchQuery, companions]);

  const loadCompanions = async () => {
    try {
      const data = await api.getCompanions();
      setCompanions(data.filter(c => c.is_active));
      setFilteredCompanions(data.filter(c => c.is_active));
    } catch (err: any) {
      setError(err.message || 'Failed to load companions');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCompanion = async (companion: Companion) => {
    try {
      setCompanion(companion);
      const room = await api.createRoom(companion.id);
      navigate(`/call/${room.room_id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Choose Your AI Companion
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Select an AI companion to start your video conversation. Each companion has unique expertise and personality.
            </p>
          </div>

          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search companions by name or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {error && (
            <div className="mb-8 max-w-2xl mx-auto bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCompanions.map(companion => (
              <CompanionCard
                key={companion.id}
                companion={companion}
                onSelect={() => handleSelectCompanion(companion)}
              />
            ))}
          </div>

          {filteredCompanions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">No companions found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

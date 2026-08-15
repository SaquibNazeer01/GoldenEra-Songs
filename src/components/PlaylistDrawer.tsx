import React, { useState } from 'react';
import { Song, RadioStation } from '../types';
import { CATEGORIES } from '../data/songs';
import { audioEngine } from '../services/audioEngine';
import { 
  X, 
  Search, 
  Heart, 
  Plus, 
  Music, 
  Disc, 
  Sparkles, 
  Radio as RadioIcon,
  Play,
  Pause
} from 'lucide-react';

interface PlaylistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  favorites: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onSelectSong: (song: Song) => void;
  onToggleFavorite: (songId: string) => void;
  onOpenAddAudioModal: () => void;
}

export const PlaylistDrawer: React.FC<PlaylistDrawerProps> = ({
  isOpen,
  onClose,
  songs,
  currentSong,
  isPlaying,
  favorites,
  selectedCategory,
  onSelectCategory,
  onSelectSong,
  onToggleFavorite,
  onOpenAddAudioModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  if (!isOpen) return null;

  // Filter songs
  const filteredSongs = songs.filter(song => {
    // 1. Search Query
    const matchesSearch =
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.movie && song.movie.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (song.hindiTitle && song.hindiTitle.includes(searchQuery));

    if (!matchesSearch) return false;

    // 2. Favorites Filter
    if (showOnlyFavorites) {
      return favorites.includes(song.id);
    }

    // 3. Category Filter
    if (selectedCategory === 'All Melodies') return true;
    return song.category === selectedCategory;
  });

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-gradient-to-b from-[#24130a] via-[#1a0e08] to-[#120804] border-l-4 border-[#8c5a2c] shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col text-[#f4ecd8] animate-slideIn">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[#4a2e16] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Music className="w-6 h-6 text-[#dfba48]" />
          <div>
            <h2 className="text-base font-cinzel font-bold text-[#dfba48]">
              PAHADI ARCHIVAL LIBRARY
            </h2>
            <p className="text-[11px] font-serif-vintage text-amber-200/70 italic">
              {songs.length} Nostalgic Hindi Classics & Ragas
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            audioEngine.playClickSound();
            onClose();
          }}
          className="w-8 h-8 rounded-full bg-[#3d2414] hover:bg-[#5c3a21] border border-[#dfba48]/40 text-amber-200 flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Bar & Favorites Filter Button */}
      <div className="p-4 space-y-3 border-b border-[#3d2414]">
        <div className="relative">
          <Search className="w-4 h-4 text-amber-400/60 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search singer, movie, title or lyrics..."
            className="w-full bg-[#140b06] border border-[#5c3a21] rounded-xl pl-9 pr-3 py-2 text-xs text-amber-100 placeholder-amber-200/40 focus:border-[#dfba48] outline-none"
          />
        </div>

        {/* Categories Horizontal Scroll Strip */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-serif-vintage">
          <button
            onClick={() => {
              audioEngine.playClickSound();
              setShowOnlyFavorites(!showOnlyFavorites);
            }}
            className={`px-3 py-1 rounded-full border shrink-0 transition-all flex items-center space-x-1 ${
              showOnlyFavorites
                ? 'bg-red-900/60 border-red-500 text-red-200'
                : 'bg-[#1e1008] border-[#5c3a21] text-amber-200/80 hover:text-amber-100'
            }`}
          >
            <Heart className={`w-3 h-3 ${showOnlyFavorites ? 'fill-current' : ''}`} />
            <span>Favorites ({favorites.length})</span>
          </button>

          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => {
                audioEngine.playClickSound();
                setShowOnlyFavorites(false);
                onSelectCategory(cat);
              }}
              className={`px-3 py-1 rounded-full border shrink-0 transition-all ${
                !showOnlyFavorites && selectedCategory === cat
                  ? 'bg-[#dfba48] text-[#140b06] border-[#dfba48] font-bold shadow'
                  : 'bg-[#1e1008] border-[#5c3a21] text-amber-200/80 hover:text-amber-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Song List Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredSongs.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-sm font-serif-vintage text-amber-200/60 italic">
              No melodies matched your search.
            </p>
            <button
              onClick={onOpenAddAudioModal}
              className="text-xs font-serif-vintage text-[#dfba48] hover:underline"
            >
              + Add a custom song or MP3 file
            </button>
          </div>
        ) : (
          filteredSongs.map((song, index) => {
            const isThisPlaying = currentSong?.id === song.id;
            const isFav = favorites.includes(song.id);

            return (
              <div
                key={song.id}
                onClick={() => {
                  audioEngine.playClickSound();
                  onSelectSong(song);
                }}
                className={`group p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  isThisPlaying
                    ? 'bg-[#3d2414] border-[#dfba48] shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                    : 'bg-[#160b06] hover:bg-[#27150c] border-[#3d2414]'
                }`}
              >
                {/* Track Left: Number / Play Icon */}
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-[#0e0704] border border-[#5c3a21] flex items-center justify-center shrink-0">
                    {isThisPlaying && isPlaying ? (
                      <div className="w-3 h-3 flex items-end space-x-0.5">
                        <span className="w-0.5 h-3 bg-[#dfba48] animate-bounce" />
                        <span className="w-0.5 h-2 bg-[#dfba48] animate-pulse" />
                        <span className="w-0.5 h-3 bg-[#dfba48] animate-bounce" />
                      </div>
                    ) : (
                      <span className="text-xs font-mono-radio text-amber-400/60">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-serif-vintage font-bold text-amber-100 truncate flex items-center space-x-1.5">
                      <span>{song.title}</span>
                      {song.isCustom && (
                        <span className="text-[9px] font-mono-radio bg-amber-900/60 text-[#dfba48] px-1 rounded">
                          Custom
                        </span>
                      )}
                    </div>

                    {song.hindiTitle && (
                      <div className="text-[11px] font-display-hindi text-amber-300/80 truncate">
                        {song.hindiTitle}
                      </div>
                    )}

                    <div className="text-[10px] font-mono-radio text-amber-400/70 truncate pt-0.5">
                      {song.artist} • {song.movie || song.category} ({song.year})
                    </div>
                  </div>
                </div>

                {/* Track Right: Duration & Favorite */}
                <div className="flex items-center space-x-2 shrink-0 ml-2">
                  <span className="text-[10px] font-mono-radio text-amber-400/50">
                    {formatDuration(song.duration)}
                  </span>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      audioEngine.playClickSound();
                      onToggleFavorite(song.id);
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                      isFav
                        ? 'text-red-400 hover:text-red-300'
                        : 'text-neutral-600 hover:text-amber-300'
                    }`}
                    title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Add Custom Audio Button */}
      <div className="p-4 border-t border-[#4a2e16] bg-[#140b06]">
        <button
          onClick={() => {
            audioEngine.playClickSound();
            onOpenAddAudioModal();
          }}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#3d2414] to-[#24130a] hover:from-[#52311f] hover:to-[#341e11] border border-[#dfba48]/40 text-amber-100 font-serif-vintage text-xs flex items-center justify-center space-x-2 transition-all shadow"
        >
          <Plus className="w-4 h-4 text-[#dfba48]" />
          <span>Add Custom Audio / Authorized MP3</span>
        </button>
      </div>
    </div>
  );
};

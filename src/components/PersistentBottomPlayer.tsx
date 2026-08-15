import React from 'react';
import { Song, EnvironmentMode } from '../types';
import { audioEngine } from '../services/audioEngine';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Shuffle, 
  Repeat, 
  Heart, 
  ListMusic, 
  Sliders, 
  Disc, 
  Maximize, 
  Minimize,
  Sun,
  Sunset,
  Moon,
  CloudRain,
  Snowflake
} from 'lucide-react';

interface PersistentBottomPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  isRadioPowered: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  isRepeat: boolean;
  isFavorite: boolean;
  environment: EnvironmentMode;
  isFullscreen: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleFavorite: () => void;
  onTogglePlaylist: () => void;
  onToggleAmbience: () => void;
  onSelectEnvironment: (env: EnvironmentMode) => void;
  onToggleFullscreen: () => void;
}

export const PersistentBottomPlayer: React.FC<PersistentBottomPlayerProps> = ({
  currentSong,
  isPlaying,
  isRadioPowered,
  currentTime,
  duration,
  volume,
  isShuffle,
  isRepeat,
  isFavorite,
  environment,
  isFullscreen,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleShuffle,
  onToggleRepeat,
  onToggleFavorite,
  onTogglePlaylist,
  onToggleAmbience,
  onSelectEnvironment,
  onToggleFullscreen
}) => {
  const formatTime = (sec: number) => {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const envOptions: { mode: EnvironmentMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'morning', label: 'Morning', icon: <Sun className="w-3.5 h-3.5 text-amber-300" /> },
    { mode: 'sunset', label: 'Sunset', icon: <Sunset className="w-3.5 h-3.5 text-orange-400" /> },
    { mode: 'night', label: 'Night', icon: <Moon className="w-3.5 h-3.5 text-blue-300" /> },
    { mode: 'rainy', label: 'Rainy', icon: <CloudRain className="w-3.5 h-3.5 text-sky-400" /> },
    { mode: 'snowy', label: 'Snowy', icon: <Snowflake className="w-3.5 h-3.5 text-slate-200" /> },
  ];

  return (
    <footer
      id="persistent-bottom-player"
      className="fixed bottom-0 inset-x-0 z-40 bg-gradient-to-t from-[#120804] via-[#1a0e08] to-[#24130a] border-t-2 border-[#5c3a21] shadow-[0_-10px_30px_rgba(0,0,0,0.85)] px-3 sm:px-6 py-2.5 sm:py-3 text-[#f4ecd8]"
    >
      {/* Mini Scrubber Progress Bar at the top of the player */}
      <div className="absolute -top-1.5 inset-x-0 h-2 group cursor-pointer">
        <div className="w-full h-1 bg-[#3d2414] group-hover:h-2 transition-all relative">
          <div
            className="h-full bg-gradient-to-r from-[#dfba48] to-[#f7df87] relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#f7df87] rounded-full shadow-[0_0_8px_#dfba48] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="1"
          value={currentTime}
          onChange={e => onSeek(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* LEFT SECTION: Spinning Tape Reel / Vinyl + Song Info + Favorite */}
        <div className="flex items-center space-x-3 w-full md:w-1/3 min-w-0">
          {/* Animated Vinyl / Tape Reel Icon */}
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#0e0704] border border-[#dfba48]/50 p-1 flex items-center justify-center shrink-0 shadow-md">
            <Disc
              className={`w-full h-full text-[#dfba48] ${
                isPlaying && isRadioPowered ? 'animate-spin' : ''
              }`}
              style={{ animationDuration: '3.5s' }}
            />
            <div className="absolute w-2.5 h-2.5 rounded-full bg-amber-950 border border-[#dfba48]" />
          </div>

          {/* Title & Artist */}
          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-serif-vintage font-bold text-amber-100 truncate">
              {currentSong ? currentSong.title : 'Pahadi Radio 102.4 FM'}
            </div>
            {currentSong?.hindiTitle && (
              <div className="text-[11px] font-display-hindi text-amber-300/80 truncate">
                {currentSong.hindiTitle}
              </div>
            )}
            <div className="text-[10px] font-mono-radio text-amber-400/70 truncate">
              {currentSong ? `${currentSong.artist} (${currentSong.year})` : 'Tuned to Mountain Frequency'}
            </div>
          </div>

          {/* Favorite Heart Button */}
          {currentSong && (
            <button
              onClick={() => {
                audioEngine.playClickSound();
                onToggleFavorite();
              }}
              className={`p-1.5 rounded-full hover:bg-[#3d2414] transition-colors shrink-0 ${
                isFavorite ? 'text-red-500' : 'text-neutral-500 hover:text-amber-300'
              }`}
              title={isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* CENTER SECTION: Controls (Shuffle, Prev, Play/Pause, Next, Repeat, Timestamps) */}
        <div className="flex flex-col items-center justify-center w-full md:w-1/3">
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Shuffle */}
            <button
              onClick={() => {
                audioEngine.playClickSound();
                onToggleShuffle();
              }}
              className={`p-1.5 rounded-full transition-colors ${
                isShuffle ? 'text-[#dfba48]' : 'text-neutral-500 hover:text-amber-300'
              }`}
              title="Shuffle Playlist"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            {/* Prev */}
            <button
              onClick={() => {
                audioEngine.playClickSound();
                onPrev();
              }}
              disabled={!isRadioPowered}
              className="p-2 rounded-full hover:bg-[#3d2414] text-amber-100 disabled:opacity-40 transition-colors"
              title="Previous Song"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play/Pause Main */}
            <button
              onClick={() => {
                audioEngine.playClickSound();
                onTogglePlay();
              }}
              disabled={!isRadioPowered}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#dfba48] to-[#f7df87] hover:brightness-110 text-[#140b06] flex items-center justify-center font-bold shadow-md active:scale-95 transition-all disabled:opacity-40"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={() => {
                audioEngine.playClickSound();
                onNext();
              }}
              disabled={!isRadioPowered}
              className="p-2 rounded-full hover:bg-[#3d2414] text-amber-100 disabled:opacity-40 transition-colors"
              title="Next Song"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Repeat */}
            <button
              onClick={() => {
                audioEngine.playClickSound();
                onToggleRepeat();
              }}
              className={`p-1.5 rounded-full transition-colors ${
                isRepeat ? 'text-[#dfba48]' : 'text-neutral-500 hover:text-amber-300'
              }`}
              title="Repeat Current Song"
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Time text indicator */}
          <div className="flex items-center space-x-2 text-[10px] font-mono-radio text-amber-400/60 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* RIGHT SECTION: Environment Selector + Ambience Mixer + Playlist + Fullscreen */}
        <div className="flex items-center justify-end space-x-2 sm:space-x-3 w-full md:w-1/3">
          {/* Environment Selector Pills */}
          <div className="hidden lg:flex items-center space-x-1 bg-[#120804] p-1 rounded-full border border-[#4a2e16]">
            {envOptions.map(env => (
              <button
                key={env.mode}
                onClick={() => {
                  audioEngine.playClickSound();
                  onSelectEnvironment(env.mode);
                }}
                className={`px-2 py-1 rounded-full text-[10px] font-mono-radio flex items-center space-x-1 transition-all ${
                  environment === env.mode
                    ? 'bg-[#3d2414] border border-[#dfba48]/60 text-amber-100 shadow'
                    : 'text-neutral-400 hover:text-amber-200'
                }`}
                title={`Switch to ${env.label} Atmosphere`}
              >
                <span>{env.icon}</span>
                <span className="capitalize">{env.label}</span>
              </button>
            ))}
          </div>

          {/* Ambient Sound Mixer Drawer Button */}
          <button
            onClick={() => {
              audioEngine.playClickSound();
              onToggleAmbience();
            }}
            className="p-2 rounded-xl bg-[#24130a] hover:bg-[#3d2414] border border-[#5c3a21] text-amber-200 hover:text-amber-100 text-xs flex items-center space-x-1 transition-all shadow"
            title="Mountain Ambient Sound Mixer"
          >
            <Sliders className="w-4 h-4 text-[#dfba48]" />
            <span className="hidden sm:inline font-serif-vintage">Ambience</span>
          </button>

          {/* Playlist Library Button */}
          <button
            onClick={() => {
              audioEngine.playClickSound();
              onTogglePlaylist();
            }}
            className="p-2 rounded-xl bg-[#24130a] hover:bg-[#3d2414] border border-[#5c3a21] text-amber-200 hover:text-amber-100 text-xs flex items-center space-x-1 transition-all shadow"
            title="Open Archival Music Library"
          >
            <ListMusic className="w-4 h-4 text-[#dfba48]" />
            <span className="hidden sm:inline font-serif-vintage">Songs</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={() => {
              audioEngine.playClickSound();
              onToggleFullscreen();
            }}
            className="p-2 rounded-xl bg-[#24130a] hover:bg-[#3d2414] border border-[#5c3a21] text-amber-200 hover:text-amber-100 text-xs transition-all shadow"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </footer>
  );
};

import React, { useState, useEffect } from 'react';
import { CabinWindow } from './CabinWindow';
import { VintageRadio } from './VintageRadio';
import { Song, RadioStation, EnvironmentMode } from '../types';
import { audioEngine } from '../services/audioEngine';
import { 
  Flame, 
  BookOpen, 
  Clock, 
  Coffee, 
  Disc, 
  Image as ImageIcon, 
  Compass, 
  Sparkles,
  Maximize2
} from 'lucide-react';

interface CabinSceneProps {
  currentSong: Song | null;
  isPlaying: boolean;
  isRadioPowered: boolean;
  currentStation: RadioStation;
  stations: RadioStation[];
  environment: EnvironmentMode;
  volume: number;
  isFireplaceOn: boolean;
  onTogglePower: () => void;
  onTogglePlay: () => void;
  onNextSong: () => void;
  onPrevSong: () => void;
  onVolumeChange: (vol: number) => void;
  onStationSelect: (station: RadioStation) => void;
  onToggleFireplace: () => void;
  onOpenTeaModal: () => void;
  onOpenPoetryModal: () => void;
  onOpenCassetteModal: () => void;
  onOpenClockModal: () => void;
  onOpenStationModal: () => void;
  onOpenSongLoreModal: () => void;
  onOpenAddAudioModal: () => void;
}

export const CabinScene: React.FC<CabinSceneProps> = ({
  currentSong,
  isPlaying,
  isRadioPowered,
  currentStation,
  stations,
  environment,
  volume,
  isFireplaceOn,
  onTogglePower,
  onTogglePlay,
  onNextSong,
  onPrevSong,
  onVolumeChange,
  onStationSelect,
  onToggleFireplace,
  onOpenTeaModal,
  onOpenPoetryModal,
  onOpenCassetteModal,
  onOpenClockModal,
  onOpenStationModal,
  onOpenSongLoreModal,
  onOpenAddAudioModal
}) => {
  const [isFullscreenWindow, setIsFullscreenWindow] = useState(false);
  const [timeString, setTimeString] = useState('');

  // Live Clock Tick
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="cabin-main-viewport" className="relative w-full min-h-screen pb-32 pt-4 px-3 sm:px-6 flex flex-col items-center justify-start wood-panel-bg">
      {/* Subtle Warm Lantern Spotlight from Above */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-radial from-amber-500/10 via-amber-700/5 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl flex flex-col space-y-6 sm:space-y-8 relative z-10">
        {/* TOP SECTION: Window overlooking Himalayan peaks */}
        <div className="relative">
          <CabinWindow
            environment={environment}
            isFullscreenView={isFullscreenWindow}
            onToggleFullscreenView={() => setIsFullscreenWindow(!isFullscreenWindow)}
          />

          {/* Hanging Tungsten Lantern on the side */}
          <div className="absolute -top-3 right-6 hidden md:flex flex-col items-center pointer-events-none z-30">
            <div className="w-0.5 h-12 bg-neutral-600" />
            <div className="w-8 h-12 rounded-lg bg-gradient-to-b from-amber-900 to-amber-950 border border-amber-600/60 lantern-pulse flex items-center justify-center shadow-2xl">
              <div className="w-3 h-5 rounded-full bg-amber-300 shadow-[0_0_15px_6px_rgba(251,191,36,0.8)] animate-pulse" />
            </div>
          </div>
        </div>

        {/* CABIN TABLE / DESK: Central Stage with Antique Radio & Interactive Props */}
        <div className="relative bg-gradient-to-b from-[#2e1d13] to-[#1a0f08] border-t-8 border-[#5c3a21] rounded-3xl p-4 sm:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.95)]">
          {/* Decorative Table Runner Embroidery */}
          <div className="absolute top-0 inset-x-8 h-2 bg-gradient-to-r from-transparent via-[#dfba48]/40 to-transparent pointer-events-none" />

          {/* 1. THE VINTAGE RADIO (Centerpiece) */}
          <div className="mb-8">
            <VintageRadio
              currentSong={currentSong}
              isPlaying={isPlaying}
              isRadioPowered={isRadioPowered}
              currentStation={currentStation}
              stations={stations}
              volume={volume}
              onTogglePower={onTogglePower}
              onTogglePlay={onTogglePlay}
              onNextSong={onNextSong}
              onPrevSong={onPrevSong}
              onVolumeChange={onVolumeChange}
              onStationSelect={onStationSelect}
              onOpenStationModal={onOpenStationModal}
              onOpenCassetteModal={onOpenCassetteModal}
              onOpenSongLoreModal={onOpenSongLoreModal}
            />
          </div>

          {/* 2. INTERACTIVE OBJECTS BAR (Tea, Poetry Diary, Mixtape, Pendulum Clock, Fireplace, Legend Portraits) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 pt-4 border-t border-[#4a2e16]">
            {/* Object 1: Steaming Ginger Tea Cup */}
            <button
              id="interactive-tea-cup-btn"
              onClick={() => {
                audioEngine.playClickSound();
                onOpenTeaModal();
              }}
              className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1f120a] hover:bg-[#341e11] border border-[#5c3a21] hover:border-[#dfba48]/60 transition-all duration-300 shadow-md hover:-translate-y-1 text-center"
              title="A warm cup of mountain ginger tea"
            >
              {/* Animated Steam */}
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute -top-3 w-1 h-3 rounded-full bg-white/40 blur-[0.5px] steam-particle-1" />
                <div className="absolute -top-4 w-1.5 h-3.5 rounded-full bg-white/30 blur-[0.5px] steam-particle-2" />
                <div className="absolute -top-3.5 w-1 h-3 rounded-full bg-white/30 blur-[0.5px] steam-particle-3" />
                <Coffee className="w-6 h-6 text-amber-300 group-hover:text-amber-100 transition-colors" />
              </div>
              <span className="text-xs font-serif-vintage text-amber-200/90 mt-1.5 font-bold">Steaming Chai</span>
              <span className="text-[10px] text-amber-400/60 font-mono-radio">A nostalgic sip</span>
            </button>

            {/* Object 2: Vintage Poetry Book */}
            <button
              id="interactive-poetry-book-btn"
              onClick={() => {
                audioEngine.playClickSound();
                onOpenPoetryModal();
              }}
              className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1f120a] hover:bg-[#341e11] border border-[#5c3a21] hover:border-[#dfba48]/60 transition-all duration-300 shadow-md hover:-translate-y-1 text-center"
              title="Read mountain reflections & Gulzar/Sahir style verses"
            >
              <BookOpen className="w-6 h-6 text-amber-300 group-hover:text-amber-100 transition-colors" />
              <span className="text-xs font-serif-vintage text-amber-200/90 mt-1.5 font-bold">Pahadi Diary</span>
              <span className="text-[10px] text-amber-400/60 font-mono-radio">Poetry & Letters</span>
            </button>

            {/* Object 3: Cassette Mixtape Rack */}
            <button
              id="interactive-cassette-rack-btn"
              onClick={() => {
                audioEngine.playClickSound();
                onOpenCassetteModal();
              }}
              className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1f120a] hover:bg-[#341e11] border border-[#5c3a21] hover:border-[#dfba48]/60 transition-all duration-300 shadow-md hover:-translate-y-1 text-center"
              title="Browse magnetic cassette tapes & Walkman playlist"
            >
              <Disc className="w-6 h-6 text-amber-300 group-hover:text-amber-100 transition-colors group-hover:rotate-45 duration-500" />
              <span className="text-xs font-serif-vintage text-amber-200/90 mt-1.5 font-bold">Cassette Rack</span>
              <span className="text-[10px] text-amber-400/60 font-mono-radio">90s Mixtapes</span>
            </button>

            {/* Object 4: Antique Pendulum Clock */}
            <button
              id="interactive-clock-btn"
              onClick={() => {
                audioEngine.playClickSound();
                onOpenClockModal();
              }}
              className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1f120a] hover:bg-[#341e11] border border-[#5c3a21] hover:border-[#dfba48]/60 transition-all duration-300 shadow-md hover:-translate-y-1 text-center"
              title="Current time in the Himalayas (IST)"
            >
              <Clock className="w-6 h-6 text-amber-300 group-hover:text-amber-100 transition-colors" />
              <span className="text-xs font-serif-vintage text-amber-200/90 mt-1.5 font-bold">Mountain Clock</span>
              <span className="text-[10px] text-amber-400/80 font-mono-radio">{timeString || 'IST Time'}</span>
            </button>

            {/* Object 5: Wood Fireplace Toggle */}
            <button
              id="interactive-fireplace-btn"
              onClick={() => {
                audioEngine.playClickSound();
                onToggleFireplace();
              }}
              className={`group flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 shadow-md hover:-translate-y-1 text-center ${
                isFireplaceOn
                  ? 'bg-amber-950/60 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-[#1f120a] hover:bg-[#341e11] border-[#5c3a21]'
              }`}
              title="Toggle wood fire hearth crackle"
            >
              <Flame
                className={`w-6 h-6 transition-colors ${
                  isFireplaceOn ? 'text-orange-400 fire-flame-anim' : 'text-neutral-500 group-hover:text-orange-400'
                }`}
              />
              <span className="text-xs font-serif-vintage text-amber-200/90 mt-1.5 font-bold">Fireplace</span>
              <span className="text-[10px] text-amber-400/60 font-mono-radio">
                {isFireplaceOn ? '🔥 Crackling' : 'Dampened'}
              </span>
            </button>

            {/* Object 6: Add Custom Music / MP3 / Audio Stream */}
            <button
              id="interactive-add-audio-btn"
              onClick={() => {
                audioEngine.playClickSound();
                onOpenAddAudioModal();
              }}
              className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1f120a] hover:bg-[#341e11] border border-[#5c3a21] hover:border-[#dfba48]/60 transition-all duration-300 shadow-md hover:-translate-y-1 text-center"
              title="Add your legally obtained MP3 files or stream URLs"
            >
              <Sparkles className="w-6 h-6 text-[#dfba48] group-hover:text-amber-100 transition-colors" />
              <span className="text-xs font-serif-vintage text-amber-200/90 mt-1.5 font-bold">Add Audio</span>
              <span className="text-[10px] text-amber-400/60 font-mono-radio">Custom MP3 / URL</span>
            </button>
          </div>
        </div>

        {/* RETRO LEGENDS GALLERY (Framed vintage wall photographs of Mohammed Rafi, Kishore Kumar, Lata Mangeshkar, Mukesh) */}
        <div className="bg-[#180e08]/90 border border-[#4a2e16] rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#3d2414] pb-2 mb-4">
            <h3 className="text-sm font-cinzel font-bold text-[#dfba48] flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>THE GOLDEN VOICES OF AKASHVANI</span>
            </h3>
            <span className="text-[11px] font-serif-vintage text-amber-200/60 italic">
              Archival Portraits • All India Radio Hill Relay
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Mohammed Rafi */}
            <div className="bg-[#24150b] p-3 rounded-xl border-2 border-[#5c3a21] shadow-md flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-700 to-amber-400 p-0.5 mb-2 shadow">
                <div className="w-full h-full rounded-full bg-[#160b05] flex items-center justify-center font-display-hindi text-lg text-amber-300 font-bold">
                  रफ़ी
                </div>
              </div>
              <span className="text-xs font-bold font-serif-vintage text-amber-100">Mohammed Rafi</span>
              <span className="text-[10px] text-amber-400/70 font-mono-radio">The Golden Soul</span>
            </div>

            {/* Kishore Kumar */}
            <div className="bg-[#24150b] p-3 rounded-xl border-2 border-[#5c3a21] shadow-md flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-700 to-amber-400 p-0.5 mb-2 shadow">
                <div className="w-full h-full rounded-full bg-[#160b05] flex items-center justify-center font-display-hindi text-lg text-amber-300 font-bold">
                  किशोर
                </div>
              </div>
              <span className="text-xs font-bold font-serif-vintage text-amber-100">Kishore Kumar</span>
              <span className="text-[10px] text-amber-400/70 font-mono-radio">The Eternal Maestro</span>
            </div>

            {/* Lata Mangeshkar */}
            <div className="bg-[#24150b] p-3 rounded-xl border-2 border-[#5c3a21] shadow-md flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-700 to-amber-400 p-0.5 mb-2 shadow">
                <div className="w-full h-full rounded-full bg-[#160b05] flex items-center justify-center font-display-hindi text-lg text-amber-300 font-bold">
                  लता
                </div>
              </div>
              <span className="text-xs font-bold font-serif-vintage text-amber-100">Lata Mangeshkar</span>
              <span className="text-[10px] text-amber-400/70 font-mono-radio">Nightingale of India</span>
            </div>

            {/* Mukesh */}
            <div className="bg-[#24150b] p-3 rounded-xl border-2 border-[#5c3a21] shadow-md flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-700 to-amber-400 p-0.5 mb-2 shadow">
                <div className="w-full h-full rounded-full bg-[#160b05] flex items-center justify-center font-display-hindi text-lg text-amber-300 font-bold">
                  मुकेश
                </div>
              </div>
              <span className="text-xs font-bold font-serif-vintage text-amber-100">Mukesh</span>
              <span className="text-[10px] text-amber-400/70 font-mono-radio">The Voice of Longing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

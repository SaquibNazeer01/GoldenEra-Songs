import React from 'react';
import { Sparkles, Radio, Mountain, Disc, Compass } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface CinematicIntroProps {
  onEnter: () => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onEnter }) => {
  const handleEnterClick = () => {
    // Initialize Web Audio and play iconic chime on enter
    audioEngine.init();
    audioEngine.playAkashvaniChime();
    onEnter();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#0e0805] text-[#f4ecd8] overflow-hidden select-none">
      {/* Misty mountain background canvas simulation */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#180e08] via-[#24130a] to-[#0a0503]" />

      {/* Subtle Himalayan peak silhouette */}
      <svg
        className="absolute bottom-0 w-full h-72 opacity-25 pointer-events-none"
        viewBox="0 0 1000 400"
        preserveAspectRatio="none"
      >
        <path
          d="M0,400 L0,220 L150,110 L280,180 L420,70 L560,190 L710,90 L850,170 L1000,100 L1000,400 Z"
          fill="#d4af37"
        />
      </svg>

      {/* Moving Ambient Fog Layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="fog-layer-1 absolute bottom-12 left-[-10%] w-[120%] h-48 bg-gradient-to-t from-amber-500/10 via-amber-500/5 to-transparent blur-2xl rounded-full" />
        <div className="fog-layer-2 absolute bottom-28 left-[-5%] w-[110%] h-36 bg-gradient-to-t from-amber-600/10 via-transparent to-transparent blur-3xl rounded-full" />
      </div>

      {/* Cinematic Center Content */}
      <div className="relative z-10 max-w-2xl text-center space-y-6 sm:space-y-8 flex flex-col items-center">
        {/* Vintage Radio Broadcast Seal */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#996515] via-[#dfba48] to-[#f7df87] p-1 shadow-[0_0_35px_rgba(212,175,55,0.4)] animate-pulse">
          <div className="w-full h-full rounded-full bg-[#1c0f08] border-2 border-[#dfba48]/60 flex items-center justify-center">
            <Radio className="w-9 h-9 text-[#f7df87]" />
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-2 text-xs font-mono-radio tracking-widest text-[#dfba48]">
            <Mountain className="w-3.5 h-3.5" />
            <span>ESTD. 1974 • AKASHVANI HILL RELAY 102.4 FM</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-cinzel font-bold tracking-wider text-[#f5eedb] radio-dial-glow">
            PAHADI RADIO
          </h1>

          <p className="text-sm sm:text-lg font-serif-vintage tracking-wide text-amber-200/90 italic">
            Old Songs • Mountain Air • Timeless Memories
          </p>

          <p className="text-xs sm:text-sm font-display-hindi text-amber-300/80 pt-1">
            पहाड़ों की ठंडी हवा, गरम चाय और सदाबहार नग़मे
          </p>
        </div>

        {/* Enter Button */}
        <div className="pt-4">
          <button
            id="enter-the-radio-btn"
            onClick={handleEnterClick}
            className="group relative px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-[#dfba48] via-[#f7df87] to-[#b8860b] text-[#160b06] font-cinzel font-bold text-sm sm:text-base tracking-widest uppercase shadow-[0_10px_30px_rgba(212,175,55,0.35)] hover:shadow-[0_12px_40px_rgba(212,175,55,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-3 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#160b06] group-hover:rotate-45 transition-transform" />
            <span>[ ENTER THE RADIO ]</span>
          </button>
        </div>

        {/* Artists Footer Ribbon */}
        <div className="pt-6 border-t border-[#4a2e16]/60 max-w-lg text-[11px] font-serif-vintage text-amber-200/60 leading-relaxed">
          Featuring Mohammed Rafi • Kishore Kumar • Lata Mangeshkar • Mukesh • Asha Bhosle • Mohammed Aziz • Hemant Kumar • Manna Dey • Talat Mahmood • Yesudas • Udit Narayan • Kumar Sanu • Alka Yagnik
        </div>
      </div>
    </div>
  );
};

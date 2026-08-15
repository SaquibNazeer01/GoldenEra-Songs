import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const VintageClock: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [time, setTime] = useState<Date>(new Date());
  const [blink, setBlink] = useState<boolean>(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setBlink(prev => !prev);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const rawHours12 = hours % 12 || 12;
  const hours12 = rawHours12 < 10 ? `0${rawHours12}` : `${rawHours12}`;
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const dayName = time.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dateStr = time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div
      className={`group relative inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-amber-700/50 bg-[#17100b]/80 backdrop-blur-md text-amber-200 shadow-[0_4px_16px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(245,158,11,0.25)] transition-all duration-300 hover:border-amber-500/70 hover:shadow-[0_0_15px_rgba(217,119,6,0.35)] ${className}`}
      title={`Real-Time Vintage Clock • ${dayName} ${dateStr}`}
      aria-label="Real-Time Vintage Clock"
    >
      {/* Subtle pulsing amber tube filament dot */}
      <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-amber-500 shadow-[0_0_6px_#f59e0b]"></span>
      </span>

      {/* Clock Icon */}
      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400/90 shrink-0 group-hover:rotate-45 transition-transform duration-500" />

      {/* Vintage Glow Digits */}
      <div className="flex items-baseline font-mono tracking-wider text-[11px] min-[380px]:text-xs sm:text-sm font-semibold text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">
        <span>{hours12}</span>
        <span className={`transition-opacity duration-200 text-amber-400 ${blink ? 'opacity-100' : 'opacity-30'}`}>:</span>
        <span>{minutes}</span>
        <span className="hidden min-[420px]:inline text-amber-500/70 text-[9px] sm:text-[10px] ml-0.5 sm:ml-1 font-normal">:</span>
        <span className="hidden min-[420px]:inline text-amber-400/90 text-[10px] sm:text-xs">{seconds}</span>
        <span className="text-[8px] sm:text-[10px] font-sans font-bold text-amber-500/80 ml-1 uppercase tracking-tight">{ampm}</span>
      </div>

      {/* Vintage Date Tag on larger viewports */}
      <span className="hidden md:inline-flex text-[9px] font-mono text-amber-500/70 border-l border-amber-800/40 pl-1.5 uppercase">
        {dayName} {dateStr}
      </span>
    </div>
  );
};

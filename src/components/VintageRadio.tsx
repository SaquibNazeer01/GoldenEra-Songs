import React, { useEffect, useRef, useState } from 'react';
import { Song, RadioStation } from '../types';
import { audioEngine } from '../services/audioEngine';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Power, 
  Volume2, 
  VolumeX, 
  Radio as RadioIcon, 
  Sparkles,
  Disc,
  Info
} from 'lucide-react';

interface VintageRadioProps {
  currentSong: Song | null;
  isPlaying: boolean;
  isRadioPowered: boolean;
  currentStation: RadioStation;
  stations: RadioStation[];
  volume: number;
  onTogglePower: () => void;
  onTogglePlay: () => void;
  onNextSong: () => void;
  onPrevSong: () => void;
  onVolumeChange: (vol: number) => void;
  onStationSelect: (station: RadioStation) => void;
  onOpenStationModal: () => void;
  onOpenCassetteModal: () => void;
  onOpenSongLoreModal: () => void;
}

export const VintageRadio: React.FC<VintageRadioProps> = ({
  currentSong,
  isPlaying,
  isRadioPowered,
  currentStation,
  stations,
  volume,
  onTogglePower,
  onTogglePlay,
  onNextSong,
  onPrevSong,
  onVolumeChange,
  onStationSelect,
  onOpenStationModal,
  onOpenCassetteModal,
  onOpenSongLoreModal
}) => {
  const [toneTreble, setToneTreble] = useState(0.65);
  const [toneBass, setToneBass] = useState(0.75);
  const [tuningFreq, setTuningFreq] = useState(currentStation.frequency);
  const [vuValue, setVuValue] = useState(0);
  const [isTuningDragging, setIsTuningDragging] = useState(false);
  const [announcementText, setAnnouncementText] = useState<string | null>(null);

  const canvasOscilloscopeRef = useRef<HTMLCanvasElement | null>(null);

  // Sync tuning frequency when station prop updates
  useEffect(() => {
    setTuningFreq(currentStation.frequency);
  }, [currentStation]);

  // Announcement banner when song changes
  useEffect(() => {
    if (currentSong && isRadioPowered) {
      setAnnouncementText(`Now playing on Pahadi Radio: "${currentSong.title}" — ${currentSong.artist} (${currentSong.year})`);
      const timer = setTimeout(() => {
        setAnnouncementText(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentSong, isRadioPowered]);

  // Real-time Audio Visualizer (Magic Eye / Green Phosphor Tube & VU meter)
  useEffect(() => {
    if (!isRadioPowered || !isPlaying) {
      setVuValue(0);
      return;
    }

    let animId: number;
    const freqData = new Uint8Array(64);
    const timeData = new Uint8Array(64);

    const updateVisuals = () => {
      audioEngine.getAudioFrequencyData(freqData);
      audioEngine.getAudioTimeDomainData(timeData);

      // Compute VU value
      let sum = 0;
      for (let i = 0; i < freqData.length; i++) {
        sum += freqData[i];
      }
      const avg = sum / freqData.length;
      const targetVu = Math.min(1, avg / 120);
      setVuValue(prev => prev * 0.7 + targetVu * 0.3);

      // Draw Green Phosphor Waveform (Magic Eye Tube)
      const canvas = canvasOscilloscopeRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          ctx.clearRect(0, 0, w, h);

          // Dark green phosphor background
          ctx.fillStyle = '#06170d';
          ctx.fillRect(0, 0, w, h);

          // Grid reticle lines
          ctx.strokeStyle = 'rgba(34, 197, 94, 0.15)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, h / 2);
          ctx.lineTo(w, h / 2);
          ctx.moveTo(w / 2, 0);
          ctx.lineTo(w / 2, h);
          ctx.stroke();

          // Green waveform trace
          ctx.strokeStyle = '#4ade80';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 8;

          ctx.beginPath();
          const sliceWidth = w / timeData.length;
          let x = 0;
          for (let i = 0; i < timeData.length; i++) {
            const v = timeData[i] / 128.0;
            const y = (v * h) / 2;
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            x += sliceWidth;
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      animId = requestAnimationFrame(updateVisuals);
    };

    updateVisuals();

    return () => cancelAnimationFrame(animId);
  }, [isRadioPowered, isPlaying]);

  // Handle Tuning Slider Interaction (smooth analog tuning with static burst)
  const handleTuningChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setTuningFreq(val);
    audioEngine.playTuningStatic(0.35, 0.25);

    // Check if close to any station
    const matchedStation = stations.find(s => Math.abs(s.frequency - val) < 0.8);
    if (matchedStation && matchedStation.id !== currentStation.id) {
      onStationSelect(matchedStation);
    }
  };

  // Dial position percentage (mapped 88 MHz -> 108 MHz)
  const dialPercent = Math.max(0, Math.min(100, ((tuningFreq - 88.0) / 20.0) * 100));

  return (
    <div
      id="vintage-radio-chassis"
      className={`relative w-full max-w-4xl mx-auto rounded-3xl p-4 sm:p-7 transition-all duration-700 select-none shadow-[0_25px_60px_rgba(0,0,0,0.95)] ${
        isRadioPowered
          ? 'bg-gradient-to-b from-[#3a2215] via-[#24140b] to-[#140b06] border-4 border-[#8c5a2c] tube-glow-amber'
          : 'bg-[#1c1009] border-4 border-[#4a2e16] opacity-90'
      }`}
    >
      {/* Brass Corner Reinforcements (Vintage 1960s craftsmanship) */}
      <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#dfba48] rounded-tl-lg pointer-events-none opacity-80" />
      <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#dfba48] rounded-tr-lg pointer-events-none opacity-80" />
      <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#dfba48] rounded-bl-lg pointer-events-none opacity-80" />
      <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#dfba48] rounded-br-lg pointer-events-none opacity-80" />

      {/* Top Header Plate: Brand Plate + "ON AIR" Jewel Light */}
      <div className="flex items-center justify-between border-b border-[#5c3a21] pb-3 mb-4">
        {/* Vintage Akashvani Emblem & Station Name */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#d4af37] to-[#7a5410] p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#20130b] flex items-center justify-center">
              <RadioIcon className="w-5 h-5 text-[#f7df87]" />
            </div>
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-cinzel font-bold tracking-widest text-[#f5eedb] flex items-center gap-2">
              <span>PAHADI RADIO</span>
              <span className="text-[10px] text-[#dfba48] font-mono-radio px-1.5 py-0.5 bg-[#422a15] rounded border border-[#dfba48]/30">
                102.4 FM
              </span>
            </h2>
            <p className="text-[10px] sm:text-xs text-[#d2be9b] font-serif-vintage italic">
              {currentStation.name} • {currentStation.location}
            </p>
          </div>
        </div>

        {/* ON AIR Ruby Jewel + Power Button */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-2 bg-[#120a05] px-3 py-1 rounded-full border border-[#5c3a21]">
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                isRadioPowered && isPlaying
                  ? 'bg-red-500 on-air-glow animate-pulse'
                  : isRadioPowered
                  ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                  : 'bg-red-950 opacity-40'
              }`}
            />
            <span
              className={`text-[10px] font-mono-radio tracking-widest ${
                isRadioPowered ? 'text-red-400 font-bold' : 'text-neutral-600'
              }`}
            >
              {isRadioPowered ? (isPlaying ? 'ON AIR' : 'STANDBY') : 'OFFLINE'}
            </span>
          </div>

          {/* Master Power Toggle Button */}
          <button
            id="radio-power-btn"
            onClick={() => {
              audioEngine.playClickSound();
              onTogglePower();
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
              isRadioPowered
                ? 'bg-gradient-to-b from-[#22c55e] to-[#15803d] text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                : 'bg-gradient-to-b from-[#4a2e16] to-[#24140b] text-[#8c5a2c] hover:text-[#dfba48]'
            }`}
            title={isRadioPowered ? 'Turn Radio OFF' : 'Turn Radio ON'}
          >
            <Power className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Announcement Flash Banner (When changing songs) */}
      {announcementText && isRadioPowered && (
        <div className="mb-3 bg-gradient-to-r from-amber-950/80 via-amber-900/90 to-amber-950/80 border border-amber-500/40 px-3 py-1.5 rounded-lg text-center text-xs font-serif-vintage text-amber-100 shadow-lg animate-fadeIn flex items-center justify-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
          <span className="font-semibold">{announcementText}</span>
        </div>
      )}

      {/* MAIN RADIO FACE: Dial Panel + Speaker/Oscilloscope Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch mb-5">
        {/* Left Column: Radio Dial Scale & Frequency Tuning Needle (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4 bg-[#140b06] p-4 rounded-2xl border-2 border-[#5c3a21] shadow-inner relative overflow-hidden">
          {/* Backlight Warm Tube Glow */}
          <div
            className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${
              isRadioPowered
                ? 'bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.18)_0%,_transparent_75%)] opacity-100'
                : 'opacity-0'
            }`}
          />

          {/* VFD Digital Song Information Screen */}
          <div className="relative bg-[#0a120b] border border-[#1b3d22] rounded-xl p-2.5 shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-mono-radio text-emerald-400/80 border-b border-emerald-950/60 pb-1 mb-1">
              <span>BAND: FM STEREO / MW</span>
              <span className="flex items-center space-x-1.5">
                <span className="text-[#dfba48]">{tuningFreq.toFixed(1)} MHz</span>
                <span>• SIG: {currentStation.signalQuality}</span>
              </span>
            </div>

            {isRadioPowered && currentSong ? (
              <div className="space-y-0.5">
                <div className="text-emerald-300 font-bold text-sm sm:text-base font-serif-vintage truncate tracking-wide">
                  {currentSong.title}
                </div>
                {currentSong.hindiTitle && (
                  <div className="text-emerald-400/90 text-xs font-display-hindi truncate">
                    {currentSong.hindiTitle}
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] text-emerald-400/70 font-mono-radio pt-0.5">
                  <span className="truncate">Singer: {currentSong.artist}</span>
                  <span>{currentSong.year} • {currentSong.category}</span>
                </div>
              </div>
            ) : (
              <div className="py-2 text-center text-xs font-mono-radio text-emerald-600/50">
                {isRadioPowered
                  ? '• • • TUNING AIRWAVES... ROTATE DIAL TO DISCOVER • • •'
                  : '[ POWER OFF — PRESS POWER BUTTON TO IGNITE TUBES ]'}
              </div>
            )}
          </div>

          {/* ANALOG FREQUENCY DIAL SCALE (Glass Window with Moving Needle) */}
          <div className="relative h-28 bg-[#1f1309] rounded-xl border-2 border-[#8c5a2c] p-2.5 overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.9)]">
            {/* Dial Background Tube Backlight */}
            <div
              className={`absolute inset-0 transition-all duration-700 pointer-events-none ${
                isRadioPowered
                  ? 'bg-gradient-to-b from-amber-500/20 via-amber-600/10 to-transparent'
                  : 'bg-black/50'
              }`}
            />

            {/* Station Frequency Scale Markers */}
            <div className="relative z-10 h-full flex flex-col justify-between text-[#d9b882] font-mono-radio text-[10px]">
              {/* FM Scale (88 - 108 MHz) */}
              <div className="flex justify-between items-center border-b border-[#8c5a2c]/40 pb-1">
                <span className="font-bold text-[#dfba48]">FM (MHz)</span>
                <span>88</span>
                <span>92</span>
                <span>96</span>
                <span>100</span>
                <span>104</span>
                <span>108</span>
              </div>

              {/* Station Names on Glass Scale */}
              <div className="flex justify-around text-[9px] text-amber-200/80 font-serif-vintage tracking-wider">
                <span className="text-[#f7df87] cursor-pointer hover:underline" onClick={() => onStationSelect(stations[3])}>Darjeeling 91.1</span>
                <span className="text-[#f7df87] cursor-pointer hover:underline" onClick={() => onStationSelect(stations[2])}>Mussoorie 98.6</span>
                <span className="text-[#f7df87] cursor-pointer hover:underline" onClick={() => onStationSelect(stations[5])}>Vividh Bharati 100.1</span>
                <span className="text-[#f7df87] cursor-pointer hover:underline" onClick={() => onStationSelect(stations[0])}>Shimla 102.4</span>
                <span className="text-[#f7df87] cursor-pointer hover:underline" onClick={() => onStationSelect(stations[1])}>Kashmir 104.2</span>
                <span className="text-[#f7df87] cursor-pointer hover:underline" onClick={() => onStationSelect(stations[4])}>Nainital 107.5</span>
              </div>

              {/* MW / Medium Wave Scale */}
              <div className="flex justify-between items-center border-t border-[#8c5a2c]/40 pt-1 text-[9px] text-[#a88252]">
                <span className="font-bold">MW (kHz)</span>
                <span>550</span>
                <span>700</span>
                <span>900</span>
                <span>1100</span>
                <span>1400</span>
                <span>1600</span>
              </div>
            </div>

            {/* Glowing Orange Frequency Needle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 via-amber-300 to-red-500 shadow-[0_0_12px_3px_rgba(249,115,22,0.85)] z-20 pointer-events-none transition-all duration-150"
              style={{ left: `${dialPercent}%` }}
            >
              <div className="w-3 h-3 bg-red-600 rounded-full -translate-x-1 -translate-y-1 shadow-[0_0_8px_#ef4444]" />
            </div>

            {/* Interactive Slider Input (Overlay) */}
            <input
              type="range"
              min="88.0"
              max="108.0"
              step="0.1"
              value={tuningFreq}
              onChange={handleTuningChange}
              onMouseDown={() => setIsTuningDragging(true)}
              onMouseUp={() => setIsTuningDragging(false)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              title="Drag horizontally to tune radio frequency"
            />
          </div>

          {/* Quick Frequency Tuning Dial Control & Akashvani Chime Button */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2 text-xs font-serif-vintage text-amber-200/80">
              <span>📻 Tuning Dial:</span>
              <span className="font-mono-radio text-[#dfba48] font-bold">{tuningFreq.toFixed(1)} MHz</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                id="akashvani-chime-btn"
                onClick={() => {
                  audioEngine.playAkashvaniChime();
                }}
                className="text-[11px] font-mono-radio px-2.5 py-1 rounded bg-[#2e1d13] hover:bg-[#4a2e16] border border-[#dfba48]/40 text-[#f7df87] flex items-center space-x-1 transition-all shadow"
                title="Play iconic Akashvani vintage sign-on chime"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Akashvani Chime</span>
              </button>

              <button
                id="view-song-lore-btn"
                onClick={onOpenSongLoreModal}
                className="text-[11px] font-mono-radio px-2.5 py-1 rounded bg-[#2e1d13] hover:bg-[#4a2e16] border border-[#5c3a21] text-amber-200/90 flex items-center space-x-1 transition-all"
                title="Song trivia, lyricist, and raga story"
              >
                <Info className="w-3 h-3 text-amber-300" />
                <span>Song Lore</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Speaker Grill Mesh + Magic Eye Tube + VU Meter (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3 bg-[#170e08] p-4 rounded-2xl border-2 border-[#5c3a21] shadow-inner">
          {/* Top of Right Column: Green Magic Eye Tube & Analog VU Meter */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* 1. Green Phosphor Magic Eye Oscilloscope */}
            <div className="bg-[#050f08] border border-[#1b3d22] rounded-xl p-2 flex flex-col items-center justify-between shadow-inner">
              <span className="text-[9px] font-mono-radio text-emerald-400/70 uppercase">Magic Eye Tube</span>
              <canvas
                ref={canvasOscilloscopeRef}
                width={120}
                height={55}
                className="w-full h-12 rounded border border-emerald-900/40 bg-[#06170d]"
              />
              <span className="text-[8px] font-mono-radio text-emerald-500/60">EM84 TUNING EYE</span>
            </div>

            {/* 2. Analog VU Meter */}
            <div className="bg-[#f2e7d0] border-2 border-[#4a2e16] rounded-xl p-2 flex flex-col items-center justify-between shadow-[inset_0_0_10px_rgba(0,0,0,0.3)] text-black relative overflow-hidden">
              <div className="flex justify-between w-full text-[8px] font-mono-radio text-amber-950 font-bold">
                <span>-20dB</span>
                <span>0dB</span>
                <span className="text-red-700">+3dB</span>
              </div>

              {/* VU Needle Pivot */}
              <div className="relative w-full h-10 flex items-end justify-center">
                <div
                  className="vu-needle w-0.5 h-8 bg-red-700 rounded-full"
                  style={{
                    transform: `rotate(${(-45 + vuValue * 90).toFixed(1)}deg)`
                  }}
                />
                <div className="absolute bottom-0 w-3 h-3 bg-neutral-900 rounded-full border border-neutral-600" />
              </div>

              <span className="text-[8px] font-cinzel font-bold text-amber-900">AUDIO LEVEL VU</span>
            </div>
          </div>

          {/* Vintage Woven Cloth Speaker Grill */}
          <div
            className={`relative flex-1 min-h-[90px] rounded-xl border-2 border-[#3d2414] overflow-hidden flex items-center justify-center p-3 transition-all ${
              isPlaying && isRadioPowered ? 'scale-[1.008]' : ''
            }`}
            style={{
              backgroundColor: '#2b1b11',
              backgroundImage: `repeating-linear-gradient(45deg, #1c1008 0, #1c1008 2px, #362215 2px, #362215 6px)`
            }}
          >
            {/* Center Brass Radio Crest */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#996515] via-[#dfba48] to-[#f7df87] p-0.5 shadow-lg flex items-center justify-center opacity-85">
              <div className="w-full h-full rounded-full bg-[#180e08] flex items-center justify-center">
                <Disc className={`w-7 h-7 text-[#dfba48] ${isPlaying && isRadioPowered ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
              </div>
            </div>
          </div>

          {/* Quick Tone Rotary Sliders (Treble & Bass) */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#3d2414] text-[10px] font-mono-radio text-amber-200/80">
            <div>
              <div className="flex justify-between mb-0.5">
                <span>TREBLE</span>
                <span className="text-[#dfba48]">{Math.round(toneTreble * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={toneTreble}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setToneTreble(val);
                  audioEngine.setToneFilter(val, toneBass);
                }}
                className="w-full h-1.5 bg-[#3d2414] rounded-lg appearance-none cursor-pointer accent-[#dfba48]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-0.5">
                <span>BASS</span>
                <span className="text-[#dfba48]">{Math.round(toneBass * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={toneBass}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setToneBass(val);
                  audioEngine.setToneFilter(toneTreble, val);
                }}
                className="w-full h-1.5 bg-[#3d2414] rounded-lg appearance-none cursor-pointer accent-[#dfba48]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM CONTROLS: Physical Push Buttons & Metallic Brass Knobs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t-2 border-[#5c3a21]">
        {/* Playback Transport Push Buttons */}
        <div className="flex items-center space-x-2">
          {/* Previous Song */}
          <button
            id="radio-prev-btn"
            onClick={() => {
              audioEngine.playClickSound();
              onPrevSong();
            }}
            disabled={!isRadioPowered}
            className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#3a2215] to-[#1e1109] hover:from-[#52311f] hover:to-[#2e1a0f] border border-[#8c5a2c] text-amber-100 flex items-center justify-center disabled:opacity-40 transition-all shadow-md active:translate-y-0.5"
            title="Previous Melody"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause Main Push Button */}
          <button
            id="radio-play-pause-btn"
            onClick={() => {
              audioEngine.playClickSound();
              onTogglePlay();
            }}
            disabled={!isRadioPowered}
            className="w-14 h-11 rounded-xl bg-gradient-to-b from-[#dfba48] via-[#b8860b] to-[#7a5410] hover:brightness-110 text-[#140b06] font-bold flex items-center justify-center disabled:opacity-40 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.6)] active:translate-y-0.5"
            title={isPlaying ? 'Pause Melody' : 'Play Melody'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          {/* Next Song */}
          <button
            id="radio-next-btn"
            onClick={() => {
              audioEngine.playClickSound();
              onNextSong();
            }}
            disabled={!isRadioPowered}
            className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#3a2215] to-[#1e1109] hover:from-[#52311f] hover:to-[#2e1a0f] border border-[#8c5a2c] text-amber-100 flex items-center justify-center disabled:opacity-40 transition-all shadow-md active:translate-y-0.5"
            title="Next Melody"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Station Presets & Cassette Mixtape Rack Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            id="radio-station-browser-btn"
            onClick={onOpenStationModal}
            className="px-3 py-1.5 rounded-xl bg-[#2b180d] hover:bg-[#422514] border border-[#dfba48]/40 text-amber-100 font-serif-vintage text-xs flex items-center space-x-1.5 transition-all shadow"
          >
            <RadioIcon className="w-3.5 h-3.5 text-[#dfba48]" />
            <span>Hill Stations ({stations.length})</span>
          </button>

          <button
            id="radio-cassette-deck-btn"
            onClick={onOpenCassetteModal}
            className="px-3 py-1.5 rounded-xl bg-[#2b180d] hover:bg-[#422514] border border-[#8c5a2c] text-amber-100 font-serif-vintage text-xs flex items-center space-x-1.5 transition-all shadow"
          >
            <Disc className="w-3.5 h-3.5 text-amber-400" />
            <span>Cassette Tapes</span>
          </button>
        </div>

        {/* Volume Metallic Brass Knob */}
        <div className="flex items-center space-x-3 bg-[#140b06] px-3.5 py-1.5 rounded-xl border border-[#5c3a21]">
          <button
            onClick={() => onVolumeChange(volume > 0 ? 0 : 0.8)}
            className="text-amber-300 hover:text-amber-100 transition-colors"
            title={volume === 0 ? 'Unmute' : 'Mute'}
          >
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <div className="flex flex-col">
            <span className="text-[8px] font-mono-radio text-amber-400/80">VOLUME</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={volume}
              onChange={e => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 sm:w-28 h-1.5 bg-[#3d2414] rounded-lg appearance-none cursor-pointer accent-[#dfba48]"
            />
          </div>
          <span className="text-[10px] font-mono-radio text-[#dfba48] w-6 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};

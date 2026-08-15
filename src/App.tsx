/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  ListMusic, 
  X, 
  Search, 
  Volume2, 
  VolumeX,
  Radio,
  Music2,
  Code2,
  ExternalLink
} from 'lucide-react';
import { INITIAL_SONGS, CATEGORIES } from './data/songs';
import { Song } from './types';
import { audioEngine } from './services/audioEngine';
import bgVideo from './assets/videos/bg-video.mp4';
import { VintageClock } from './components/VintageClock';

export default function App() {
  const [songs] = useState<Song[]>(INITIAL_SONGS);
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const saved = localStorage.getItem('pahadi_radio_index');
    if (saved !== null) {
      const idx = parseInt(saved, 10);
      if (!isNaN(idx) && idx >= 0 && idx < INITIAL_SONGS.length) return idx;
    }
    return 0;
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(() => {
    return localStorage.getItem('pahadi_radio_shuffle') === 'true';
  });
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(240);
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem('pahadi_radio_volume');
    return saved !== null ? parseFloat(saved) : 0.85;
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Melodies');

  const currentSong = songs[currentIndex] || songs[0];

  // Initialize subtle vinyl crackle & warm wood fire ambience
  useEffect(() => {
    audioEngine.setMasterVolume(isMuted ? 0 : volume);
    audioEngine.setAmbientSound('vinyl', true, 0.16);
    audioEngine.setAmbientSound('fire', true, 0.10);
  }, [volume, isMuted]);

  // Persist state
  useEffect(() => {
    localStorage.setItem('pahadi_radio_index', currentIndex.toString());
  }, [currentIndex]);

  useEffect(() => {
    localStorage.setItem('pahadi_radio_shuffle', isShuffle.toString());
  }, [isShuffle]);

  useEffect(() => {
    localStorage.setItem('pahadi_radio_volume', volume.toString());
  }, [volume]);

  // Play a specific track index
  const playTrackAtIndex = useCallback((index: number) => {
    const targetIndex = (index + songs.length) % songs.length;
    setCurrentIndex(targetIndex);
    setIsPlaying(true);
    setCurrentTime(0);

    const song = songs[targetIndex];
    if (song) {
      setDuration(song.duration || 240);
      audioEngine.playSong(
        song,
        (curr, dur) => {
          setCurrentTime(curr);
          if (dur && !isNaN(dur) && dur > 0) {
            setDuration(dur);
          }
        },
        () => {
          // Song finished -> next song
          handleNext();
        }
      );
    }
  }, [songs, isShuffle]);

  // Next Track
  const handleNext = useCallback(() => {
    if (isShuffle) {
      let nextIdx = Math.floor(Math.random() * songs.length);
      if (nextIdx === currentIndex && songs.length > 1) {
        nextIdx = (currentIndex + 1) % songs.length;
      }
      playTrackAtIndex(nextIdx);
    } else {
      playTrackAtIndex(currentIndex + 1);
    }
  }, [currentIndex, isShuffle, songs.length, playTrackAtIndex]);

  // Previous Track
  const handlePrevious = useCallback(() => {
    if (currentTime > 4) {
      audioEngine.seekMusic(0, currentSong, (curr, dur) => {
        setCurrentTime(curr);
        if (dur) setDuration(dur);
      }, handleNext);
      setCurrentTime(0);
      return;
    }

    if (isShuffle) {
      let prevIdx = Math.floor(Math.random() * songs.length);
      if (prevIdx === currentIndex && songs.length > 1) {
        prevIdx = (currentIndex - 1 + songs.length) % songs.length;
      }
      playTrackAtIndex(prevIdx);
    } else {
      playTrackAtIndex(currentIndex - 1);
    }
  }, [currentIndex, currentTime, isShuffle, songs.length, currentSong, playTrackAtIndex, handleNext]);

  // Toggle Play/Pause
  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      audioEngine.pauseMusic();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (currentTime > 0) {
        audioEngine.resumeMusic(
          currentSong,
          currentTime,
          (curr, dur) => {
            setCurrentTime(curr);
            if (dur) setDuration(dur);
          },
          handleNext
        );
      } else {
        playTrackAtIndex(currentIndex);
      }
    }
  }, [isPlaying, currentTime, currentSong, currentIndex, playTrackAtIndex, handleNext]);

  // Toggle Shuffle
  const handleToggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleToggleShuffle();
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setIsDrawerOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handleNext, handlePrevious, handleToggleShuffle]);

  // Filter songs for the drawer
  const filteredSongs = useMemo(() => {
    return songs.filter(s => {
      const matchesCategory = selectedCategory === 'All Melodies' || s.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        s.title.toLowerCase().includes(q) || 
        (s.hindiTitle && s.hindiTitle.toLowerCase().includes(q)) ||
        s.artist.toLowerCase().includes(q) ||
        (s.movie && s.movie.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [songs, selectedCategory, searchQuery]);

  // Format seconds into mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <main
      id="old-radio-app"
      className="relative min-h-[100dvh] w-full select-none overflow-hidden bg-[#0c0907] flex flex-col justify-between font-serif text-amber-100"
    >
      {/* 1. Vintage Radio Background Video - Responsive for all screens (muted) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <video
          src={bgVideo}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-[center_62%] sm:object-[center_55%] md:object-center filter brightness-[0.80] contrast-[1.05] transition-transform duration-1000 ease-out"
        />
        {/* Soothing Warm Vignette & Atmospheric Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0907]/95 via-[#0c0907]/25 to-[#0c0907]/75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_25%,rgba(10,7,5,0.75)_100%)]" />
      </div>

      {/* 2. Top Bar: Radio Brand, Vintage Clock, Developer Link & Songs List */}
      <header className="relative z-20 w-full max-w-5xl mx-auto px-3 sm:px-6 pt-3 sm:pt-5 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        {/* Vintage Radio Brand Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink-0">
          <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500/90 shrink-0 animate-pulse" />
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-sans tracking-[0.12em] sm:tracking-[0.2em] uppercase text-amber-300/90 font-semibold whitespace-nowrap block">
              GoldenEra Songs
            </span>
            <span className="hidden sm:inline-block text-[11px] text-amber-600/70 font-sans">
              • Vintage Melodies
            </span>
          </div>
        </div>

        {/* Vintage Real-Time Clock */}
        <div className="order-3 sm:order-2 w-full sm:w-auto flex justify-center mt-1 sm:mt-0 shrink-0">
          <VintageClock />
        </div>

        {/* Right Actions: Developer Portfolio & Songs List */}
        <div className="order-2 sm:order-3 flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Developer Portfolio Link */}
          <a
            id="btn-developer-portfolio"
            href="https://saquibb.me"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-amber-800/40 bg-black/50 backdrop-blur-md text-amber-300 text-[10px] min-[380px]:text-[11px] sm:text-xs font-sans tracking-wide hover:border-amber-500/60 hover:bg-amber-950/50 hover:text-amber-100 transition-all duration-200 shadow-md active:scale-95 focus:outline-none whitespace-nowrap"
            title="Developer: Saquib Nazeer (saquibb.me / saquibnazeer.vercel.app)"
          >
            <Code2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 group-hover:rotate-12 transition-transform shrink-0" />
            <span className="font-medium">Saquib Nazeer</span>
            <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500/70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
          </a>

          {/* Songs List Button (Icon Only) */}
          <button
            id="btn-songs-list"
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="group relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-amber-800/40 bg-black/50 backdrop-blur-md text-amber-300 hover:border-amber-500/60 hover:bg-amber-950/50 hover:text-amber-100 transition-all duration-200 shadow-md active:scale-95 focus:outline-none shrink-0"
            title="Browse All Songs (Press L)"
            aria-label="Browse All Songs"
          >
            <ListMusic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 px-1 py-0.2 text-[8px] sm:text-[9px] rounded-full bg-amber-900/80 text-amber-200 border border-amber-700/50 font-mono shadow-sm">
              {songs.length}
            </span>
          </button>
        </div>
      </header>

      {/* 3. Center Area: Kept Open to Focus Purely on Background Radio Image */}
      <div className="flex-1 min-h-[40px]" />

      {/* 4. Bottom Area: Compact Song Details & Small Centre Buttons */}
      <footer className="relative z-20 w-full max-w-xl mx-auto px-3 sm:px-6 pb-4 sm:pb-8 flex flex-col items-center justify-center gap-2.5 sm:gap-3">
        {/* Very subtle and compact Song Info at bottom */}
        <div className="w-full flex flex-col items-center text-center px-1">
          {/* Song Title & Optional Hindi subtitle */}
          <h2 
            id="current-song-title"
            className="text-xs sm:text-base font-serif font-semibold text-amber-100/95 tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] truncate max-w-[92vw] sm:max-w-full px-2"
          >
            {currentSong.title}
            {currentSong.hindiTitle && (
              <span className="text-amber-400/80 text-[11px] sm:text-sm font-normal ml-1 sm:ml-1.5 font-serif">
                ({currentSong.hindiTitle})
              </span>
            )}
          </h2>

          {/* Artist & Film Information in small text */}
          <p 
            id="current-song-artist"
            className="text-[10px] sm:text-xs text-amber-400/70 font-sans tracking-wide mt-0.5 truncate max-w-[90vw] sm:max-w-full px-2"
          >
            {currentSong.artist}
            {currentSong.movie && (
              <span className="text-amber-500/60"> • {currentSong.movie} {currentSong.year ? `(${currentSong.year})` : ''}</span>
            )}
          </p>

          {/* Minimalist Progress Line */}
          <div className="w-full max-w-xs mt-1.5 sm:mt-2 flex items-center gap-2 px-1">
            <span className="text-[9px] sm:text-[10px] font-mono text-amber-600/80 shrink-0">{formatTime(currentTime)}</span>
            <div 
              className="flex-1 h-1.5 bg-black/60 backdrop-blur-sm rounded-full overflow-hidden cursor-pointer border border-amber-950/60 hover:h-2 transition-all duration-200"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                const seekTo = ratio * duration;
                audioEngine.seekMusic(seekTo, currentSong, (curr, dur) => {
                  setCurrentTime(curr);
                  if (dur) setDuration(dur);
                }, handleNext);
                setCurrentTime(seekTo);
              }}
            >
              <div 
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-300 ease-linear shadow-[0_0_6px_rgba(245,158,11,0.5)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono text-amber-600/80 shrink-0">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Compact Centre Buttons */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-center gap-1.5 sm:gap-3.5 p-1.5 sm:p-2 rounded-full bg-black/60 backdrop-blur-md border border-amber-900/40 shadow-[0_10px_30px_rgba(0,0,0,0.85)] max-w-xs sm:max-w-none">
          {/* Random Shuffle Button */}
          <button
            id="btn-random-shuffle"
            type="button"
            onClick={handleToggleShuffle}
            className={`relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border transition-all duration-200 active:scale-95 focus:outline-none shrink-0 ${
              isShuffle 
                ? 'border-amber-500/70 bg-amber-900/50 text-amber-300 shadow-[0_0_12px_rgba(217,119,6,0.4)]' 
                : 'border-amber-900/40 bg-black/40 text-amber-600 hover:text-amber-300'
            }`}
            title={isShuffle ? 'Shuffle Active (S)' : 'Shuffle Off (S)'}
            aria-label="Toggle Random Shuffle"
          >
            {isShuffle && (
              <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,1)]" />
            )}
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          {/* Left / Previous Button */}
          <button
            id="btn-previous-track"
            type="button"
            onClick={handlePrevious}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-amber-800/40 bg-gradient-to-b from-[#2a1a12] to-[#160d09] text-amber-300 hover:text-amber-100 hover:border-amber-700/60 active:scale-95 transition-all duration-200 shadow-md focus:outline-none shrink-0"
            title="Previous Track (Left Arrow)"
            aria-label="Previous Track"
          >
            <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Pause / Play Button */}
          <button
            id="btn-play-pause"
            type="button"
            onClick={handleTogglePlay}
            className="group relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-amber-600/60 bg-gradient-to-b from-[#4a2e1f] to-[#20120b] text-amber-200 shadow-[0_4px_16px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,220,150,0.3)] hover:from-[#573624] hover:to-[#28170d] hover:text-amber-100 active:scale-95 transition-all duration-200 focus:outline-none shrink-0"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-current" />
            ) : (
              <Play className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-current translate-x-0.5" />
            )}
          </button>

          {/* Right / Next Button */}
          <button
            id="btn-next-track"
            type="button"
            onClick={handleNext}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-amber-800/40 bg-gradient-to-b from-[#2a1a12] to-[#160d09] text-amber-300 hover:text-amber-100 hover:border-amber-700/60 active:scale-95 transition-all duration-200 shadow-md focus:outline-none shrink-0"
            title="Next Track (Right Arrow)"
            aria-label="Next Track"
          >
            <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Subtle Volume Toggle */}
          <div className="flex items-center gap-1 sm:gap-1.5 pl-1 sm:pl-1.5 border-l border-amber-900/30 shrink-0">
            <button
              id="btn-toggle-mute"
              type="button"
              onClick={() => setIsMuted(prev => !prev)}
              className="text-amber-500/70 hover:text-amber-300 transition-colors p-1"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              id="volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-10 sm:w-14 h-1 bg-amber-950 rounded-lg appearance-none cursor-pointer accent-amber-600 focus:outline-none"
              aria-label="Volume"
            />
          </div>
        </div>

        {/* Track Index */}
        <div className="text-[9px] sm:text-[10px] font-mono text-amber-700/70 tracking-widest uppercase">
          TRACK {currentIndex + 1} / {songs.length}
        </div>
      </footer>

      {/* 5. Songs List Slide-Over Drawer */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div 
            className="w-full sm:max-w-md h-full bg-[#140e0b] border-l border-amber-900/40 shadow-2xl flex flex-col p-4 sm:p-5 overflow-hidden text-amber-100 animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-amber-900/30">
              <div className="flex items-center gap-2">
                <Music2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
                <h2 className="text-sm sm:text-base font-semibold font-sans tracking-wide text-amber-200">
                  Melodies Archive
                </h2>
                <span className="text-xs text-amber-600 font-mono">({songs.length})</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-full hover:bg-amber-900/30 text-amber-400 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mt-3.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600" />
              <input
                type="text"
                placeholder="Search song, singer, or film..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-black/40 border border-amber-900/40 rounded-xl text-xs font-sans text-amber-100 placeholder-amber-700/60 focus:outline-none focus:border-amber-600/60"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar touch-pan-x">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-sans transition-colors shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-amber-700/60 text-amber-100 border border-amber-500/60 font-medium'
                      : 'bg-black/30 text-amber-600/80 hover:text-amber-300 border border-amber-900/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Songs List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 mt-1.5 custom-scrollbar">
              {filteredSongs.length === 0 ? (
                <div className="text-center py-12 text-xs text-amber-700/60 font-sans">
                  No melodies match your search.
                </div>
              ) : (
                filteredSongs.map((song) => {
                  const origIdx = songs.findIndex(s => s.id === song.id);
                  const isCurrent = origIdx === currentIndex;

                  return (
                    <div
                      key={song.id}
                      onClick={() => {
                        playTrackAtIndex(origIdx);
                        setIsDrawerOpen(false);
                      }}
                      className={`group flex items-center justify-between p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all duration-150 border ${
                        isCurrent
                          ? 'bg-amber-950/50 border-amber-700/60 text-amber-100 shadow-sm'
                          : 'bg-black/20 border-transparent hover:bg-amber-950/30 hover:border-amber-900/30 text-amber-200/80 active:bg-amber-950/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 overflow-hidden min-w-0">
                        {/* Play Indicator / Index */}
                        <div className="w-5 text-center shrink-0">
                          {isCurrent ? (
                            <div className="flex items-center justify-center gap-0.5">
                              <span className={`w-0.5 h-3 bg-amber-400 rounded-full ${isPlaying ? 'animate-pulse' : ''}`} />
                              <span className={`w-0.5 h-4 bg-amber-300 rounded-full ${isPlaying ? 'animate-pulse delay-75' : ''}`} />
                              <span className={`w-0.5 h-2 bg-amber-400 rounded-full ${isPlaying ? 'animate-pulse delay-150' : ''}`} />
                            </div>
                          ) : (
                            <span className="text-[11px] font-mono text-amber-700/60 group-hover:text-amber-400">
                              {origIdx + 1}
                            </span>
                          )}
                        </div>

                        {/* Song Details */}
                        <div className="overflow-hidden min-w-0">
                          <h4 className={`text-xs font-serif font-medium truncate ${isCurrent ? 'text-amber-200' : 'text-amber-100'}`}>
                            {song.title}
                          </h4>
                          {song.hindiTitle && (
                            <p className="text-[11px] text-amber-400/70 truncate">
                              {song.hindiTitle}
                            </p>
                          )}
                          <p className="text-[10px] text-amber-600/80 font-sans truncate">
                            {song.artist} {song.movie ? `• ${song.movie}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Duration / Tag */}
                      <span className="text-[10px] font-mono text-amber-600/70 ml-2 shrink-0">
                        {formatTime(song.duration || 240)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

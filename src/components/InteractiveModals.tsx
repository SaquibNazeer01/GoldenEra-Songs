import React, { useState } from 'react';
import { Song, RadioStation, PoemEntry, NostalgicQuote, AmbientSoundState } from '../types';
import { audioEngine } from '../services/audioEngine';
import { 
  X, 
  Coffee, 
  BookOpen, 
  Clock, 
  Disc, 
  Radio as RadioIcon, 
  Volume2, 
  VolumeX, 
  Plus, 
  Upload, 
  Info, 
  Sliders, 
  Keyboard, 
  Check, 
  Sparkles 
} from 'lucide-react';

interface InteractiveModalsProps {
  // Modal states
  activeModal: 'tea' | 'poetry' | 'cassette' | 'clock' | 'stations' | 'songLore' | 'addAudio' | 'ambience' | 'shortcuts' | null;
  onClose: () => void;
  // Data
  currentSong: Song | null;
  currentStation: RadioStation;
  stations: RadioStation[];
  songs: Song[];
  poems: PoemEntry[];
  quotes: NostalgicQuote[];
  ambientSounds: AmbientSoundState[];
  onSelectStation: (station: RadioStation) => void;
  onSelectSong: (song: Song) => void;
  onAddCustomSong: (song: Song) => void;
  onUpdateAmbientVolume: (id: AmbientSoundState['id'], volume: number) => void;
  onToggleAmbientSound: (id: AmbientSoundState['id']) => void;
}

export const InteractiveModals: React.FC<InteractiveModalsProps> = ({
  activeModal,
  onClose,
  currentSong,
  currentStation,
  stations,
  songs,
  poems,
  quotes,
  ambientSounds,
  onSelectStation,
  onSelectSong,
  onAddCustomSong,
  onUpdateAmbientVolume,
  onToggleAmbientSound
}) => {
  // Custom Song Form state
  const [newTitle, setNewTitle] = useState('');
  const [newHindiTitle, setNewHindiTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newYear, setNewYear] = useState('1975');
  const [newCategory, setNewCategory] = useState('Golden Era');
  const [newAudioUrl, setNewAudioUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Active poem index in book
  const [currentPoemIdx, setCurrentPoemIdx] = useState(0);

  // Active quote index in tea
  const [quoteIdx, setQuoteIdx] = useState(0);

  if (!activeModal) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileUrl = URL.createObjectURL(file);
    setNewAudioUrl(fileUrl);
    setUploadedFileName(file.name);
    if (!newTitle) {
      setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleAddSongSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newArtist.trim()) return;

    const newSong: Song = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      hindiTitle: newHindiTitle.trim() || undefined,
      artist: newArtist.trim(),
      year: newYear || '1970',
      category: newCategory || 'Personal Cassette',
      duration: 240,
      audioUrl: newAudioUrl.trim() || undefined,
      isCustom: true,
      moodSnippet: 'Your personal treasured recording preserved in the cabin library.'
    };

    onAddCustomSong(newSong);
    onSelectSong(newSong);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Modal Card Container */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#2a170d] to-[#160c07] border-4 border-[#8c5a2c] rounded-3xl p-5 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-[#f4ecd8]">
        {/* Brass Header Corner Accents */}
        <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#dfba48]" />
        <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[#dfba48]" />

        {/* Close Button */}
        <button
          onClick={() => {
            audioEngine.playClickSound();
            onClose();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#3d2414] hover:bg-[#5c3a21] border border-[#dfba48]/40 text-amber-200 flex items-center justify-center transition-all shadow"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. TEA CUP MODAL */}
        {activeModal === 'tea' && (
          <div className="space-y-6 text-center py-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-900/60 border border-[#dfba48] flex items-center justify-center shadow-lg">
              <Coffee className="w-8 h-8 text-[#f7df87]" />
            </div>

            <div>
              <h2 className="text-xl font-cinzel font-bold text-[#dfba48] tracking-wider">
                A STEAMING CUP OF GINGER TEA
              </h2>
              <p className="text-xs font-serif-vintage text-amber-200/70 italic mt-1">
                Fresh cardamom, crushed ginger, hill-station milk & warm nostalgia
              </p>
            </div>

            {/* Nostalgic Quote Card */}
            <div className="parchment-texture text-[#2b180d] p-6 rounded-2xl border-2 border-[#8c5a2c] shadow-inner text-left my-4">
              <span className="text-2xl font-serif-vintage text-[#7a5410]">“</span>
              <p className="text-base sm:text-lg font-serif-vintage font-semibold italic text-[#2e1a0f] leading-relaxed my-1">
                {quotes[quoteIdx % quotes.length].quote}
              </p>
              <div className="flex justify-between items-center text-xs font-handwriting text-[#5c3a21] pt-3 border-t border-[#8c5a2c]/30">
                <span>— {quotes[quoteIdx % quotes.length].location || 'Pahadi Cabin'}</span>
                <span>Mood: {quotes[quoteIdx % quotes.length].mood}</span>
              </div>
            </div>

            <button
              onClick={() => {
                audioEngine.playClickSound();
                setQuoteIdx(prev => prev + 1);
              }}
              className="px-5 py-2 rounded-xl bg-[#3d2414] hover:bg-[#5c3a21] border border-[#dfba48]/60 text-amber-100 font-serif-vintage text-sm transition-all shadow-md"
            >
              🍃 Sip Again & Read Next Memory
            </button>
          </div>
        )}

        {/* 2. POETRY BOOK MODAL */}
        {activeModal === 'poetry' && (
          <div className="space-y-5">
            <div className="flex items-center space-x-3 border-b border-[#5c3a21] pb-3">
              <BookOpen className="w-7 h-7 text-[#dfba48]" />
              <div>
                <h2 className="text-lg font-cinzel font-bold text-[#dfba48]">
                  PAHADI DIARY • MOUNTAIN VERSES
                </h2>
                <p className="text-xs font-serif-vintage text-amber-200/70 italic">
                  Handwritten poems inspired by Gulzar, Sahir, and misty cedar paths
                </p>
              </div>
            </div>

            {/* Current Poem Card */}
            <div className="parchment-texture text-[#2b180d] p-6 sm:p-8 rounded-2xl border-2 border-[#8c5a2c] shadow-md space-y-4">
              <div className="flex justify-between items-center border-b border-[#8c5a2c]/30 pb-2">
                <h3 className="font-serif-vintage font-bold text-base sm:text-lg text-[#1e1008]">
                  {poems[currentPoemIdx].title}
                </h3>
                <span className="text-xs font-mono-radio text-[#7a5410] font-bold">
                  {poems[currentPoemIdx].year}
                </span>
              </div>

              {/* Hindi Lines */}
              <div className="space-y-1.5 py-2 font-display-hindi text-base sm:text-lg text-[#3d1f0d] leading-relaxed">
                {poems[currentPoemIdx].hindiLines.map((line, idx) => (
                  <p key={idx} className="tracking-wide">{line}</p>
                ))}
              </div>

              {/* English Translation */}
              <div className="pt-3 border-t border-[#8c5a2c]/30 text-xs sm:text-sm font-serif-vintage italic text-[#4a2e16]">
                "{poems[currentPoemIdx].englishTranslation}"
              </div>

              <div className="text-[11px] font-handwriting text-[#7a5410]">
                Note: {poems[currentPoemIdx].note}
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  audioEngine.playClickSound();
                  setCurrentPoemIdx(prev => (prev > 0 ? prev - 1 : poems.length - 1));
                }}
                className="px-4 py-1.5 rounded-lg bg-[#3d2414] hover:bg-[#5c3a21] border border-[#5c3a21] text-amber-100 font-serif-vintage text-xs"
              >
                ◀ Previous Page
              </button>
              <span className="text-xs font-mono-radio text-[#dfba48]">
                Page {currentPoemIdx + 1} of {poems.length}
              </span>
              <button
                onClick={() => {
                  audioEngine.playClickSound();
                  setCurrentPoemIdx(prev => (prev < poems.length - 1 ? prev + 1 : 0));
                }}
                className="px-4 py-1.5 rounded-lg bg-[#3d2414] hover:bg-[#5c3a21] border border-[#5c3a21] text-amber-100 font-serif-vintage text-xs"
              >
                Next Page ▶
              </button>
            </div>
          </div>
        )}

        {/* 3. CASSETTE MIXTAPE RACK MODAL */}
        {activeModal === 'cassette' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 border-b border-[#5c3a21] pb-3">
              <Disc className="w-7 h-7 text-[#dfba48]" />
              <div>
                <h2 className="text-lg font-cinzel font-bold text-[#dfba48]">
                  CASSETTE MIXTAPE RACK (C-60 & C-90)
                </h2>
                <p className="text-xs font-serif-vintage text-amber-200/70 italic">
                  Select a magnetic cassette tape to pop into the Pahadi Radio deck
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {songs.slice(0, 14).map(song => (
                <div
                  key={song.id}
                  onClick={() => {
                    audioEngine.playClickSound();
                    onSelectSong(song);
                    onClose();
                  }}
                  className={`cursor-pointer p-3 rounded-xl border-2 transition-all flex items-center space-x-3 ${
                    currentSong?.id === song.id
                      ? 'bg-[#3d2414] border-[#dfba48] shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                      : 'bg-[#1a0e08] hover:bg-[#2b180d] border-[#4a2e16]'
                  }`}
                >
                  {/* Cassette Icon with spinning wheels */}
                  <div className="w-12 h-10 rounded-lg bg-[#0e0704] border border-[#dfba48]/40 p-1 flex items-center justify-between shrink-0">
                    <div className="w-3.5 h-3.5 rounded-full border border-white/40 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    </div>
                    <div className="w-3 h-1.5 bg-[#422a15] rounded-sm" />
                    <div className="w-3.5 h-3.5 rounded-full border border-white/40 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold font-serif-vintage text-amber-100 truncate">
                      {song.title}
                    </div>
                    <div className="text-[10px] text-amber-400/80 font-mono-radio truncate">
                      {song.artist} ({song.year})
                    </div>
                    <div className="text-[9px] text-amber-200/50 font-serif-vintage truncate">
                      {song.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. MOUNTAIN CLOCK & WEATHER MODAL */}
        {activeModal === 'clock' && (
          <div className="space-y-5 text-center py-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-900/60 border border-[#dfba48] flex items-center justify-center shadow-lg">
              <Clock className="w-8 h-8 text-[#f7df87]" />
            </div>

            <div>
              <h2 className="text-xl font-cinzel font-bold text-[#dfba48] tracking-wider">
                MOUNTAIN CABIN CHRONOMETER
              </h2>
              <p className="text-xs font-serif-vintage text-amber-200/70 italic mt-0.5">
                Indian Standard Time (IST) • Shimla Ridge Observatory
              </p>
            </div>

            <div className="bg-[#120a05] border-2 border-[#5c3a21] rounded-2xl p-6 shadow-inner space-y-4">
              <div className="text-3xl sm:text-4xl font-mono-radio font-bold text-[#dfba48] tracking-widest radio-dial-glow">
                {new Date().toLocaleTimeString('en-IN', {
                  timeZone: 'Asia/Kolkata',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                })}
              </div>

              <div className="text-xs font-serif-vintage text-amber-200/80">
                {new Date().toLocaleDateString('en-IN', {
                  timeZone: 'Asia/Kolkata',
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-[#3d2414] text-xs font-mono-radio">
                <div className="bg-[#1e1008] p-2 rounded-lg border border-[#4a2e16]">
                  <span className="text-amber-400/60 block text-[10px]">ELEVATION</span>
                  <span className="font-bold text-amber-200">7,467 ft (2,276m)</span>
                </div>
                <div className="bg-[#1e1008] p-2 rounded-lg border border-[#4a2e16]">
                  <span className="text-amber-400/60 block text-[10px]">SUNSET TIME</span>
                  <span className="font-bold text-amber-200">6:48 PM IST</span>
                </div>
                <div className="bg-[#1e1008] p-2 rounded-lg border border-[#4a2e16] col-span-2 sm:col-span-1">
                  <span className="text-amber-400/60 block text-[10px]">ATMOSPHERE</span>
                  <span className="font-bold text-emerald-400">Crisp Mountain Pine</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. STATIONS BROWSER MODAL */}
        {activeModal === 'stations' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 border-b border-[#5c3a21] pb-3">
              <RadioIcon className="w-7 h-7 text-[#dfba48]" />
              <div>
                <h2 className="text-lg font-cinzel font-bold text-[#dfba48]">
                  ALL INDIA HILL RELAY STATIONS
                </h2>
                <p className="text-xs font-serif-vintage text-amber-200/70 italic">
                  Select a vintage Himalayan broadcast frequency to tune the radio
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {stations.map(station => (
                <div
                  key={station.id}
                  onClick={() => {
                    audioEngine.playClickSound();
                    onSelectStation(station);
                    onClose();
                  }}
                  className={`cursor-pointer p-3.5 rounded-xl border-2 transition-all space-y-1.5 ${
                    currentStation.id === station.id
                      ? 'bg-[#3d2414] border-[#dfba48] shadow-[0_0_15px_rgba(212,175,55,0.35)]'
                      : 'bg-[#1a0e08] hover:bg-[#2b180d] border-[#4a2e16]'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-cinzel font-bold text-amber-100">
                      {station.name}
                    </span>
                    <span className="text-xs font-mono-radio text-[#dfba48] font-bold px-2 py-0.5 bg-[#120a05] rounded border border-[#dfba48]/40">
                      {station.frequency.toFixed(1)} FM
                    </span>
                  </div>

                  <div className="text-[11px] text-amber-300/80 font-serif-vintage italic">
                    "{station.tagline}"
                  </div>

                  <div className="flex justify-between text-[10px] font-mono-radio text-amber-400/60 pt-1 border-t border-[#3d2414]">
                    <span>📍 {station.location}</span>
                    <span>Signal: {station.signalQuality}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. SONG LORE & TRIVIA MODAL */}
        {activeModal === 'songLore' && currentSong && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 border-b border-[#5c3a21] pb-3">
              <Info className="w-7 h-7 text-[#dfba48]" />
              <div>
                <h2 className="text-lg font-cinzel font-bold text-[#dfba48]">
                  SONG ARCHIVES & LORE
                </h2>
                <p className="text-xs font-serif-vintage text-amber-200/70 italic">
                  Story behind the golden era recording
                </p>
              </div>
            </div>

            <div className="parchment-texture text-[#2b180d] p-5 sm:p-7 rounded-2xl border-2 border-[#8c5a2c] space-y-3">
              <div>
                <h3 className="font-serif-vintage font-bold text-lg text-[#1e1008]">
                  {currentSong.title}
                </h3>
                {currentSong.hindiTitle && (
                  <p className="font-display-hindi text-base text-[#5c3a21]">
                    {currentSong.hindiTitle}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-serif-vintage text-[#3d1f0d] pt-2 border-t border-[#8c5a2c]/30">
                <div>
                  <span className="font-bold">Singer:</span> {currentSong.artist}
                </div>
                <div>
                  <span className="font-bold">Movie:</span> {currentSong.movie || 'Archival Classic'}
                </div>
                <div>
                  <span className="font-bold">Year:</span> {currentSong.year}
                </div>
                <div>
                  <span className="font-bold">Genre:</span> {currentSong.genre || currentSong.category}
                </div>
                {currentSong.lyricist && (
                  <div>
                    <span className="font-bold">Poet / Lyricist:</span> {currentSong.lyricist}
                  </div>
                )}
                {currentSong.musicDirector && (
                  <div>
                    <span className="font-bold">Music Director:</span> {currentSong.musicDirector}
                  </div>
                )}
                {currentSong.raga && (
                  <div className="col-span-2">
                    <span className="font-bold">Indian Classical Raga:</span> {currentSong.raga}
                  </div>
                )}
              </div>

              {currentSong.moodSnippet && (
                <div className="pt-2 border-t border-[#8c5a2c]/30 text-xs sm:text-sm font-serif-vintage italic text-[#5c3a21]">
                  "{currentSong.moodSnippet}"
                </div>
              )}
            </div>
          </div>
        )}

        {/* 7. CUSTOM AUDIO / MP3 ADDER MODAL */}
        {activeModal === 'addAudio' && (
          <form onSubmit={handleAddSongSubmit} className="space-y-4">
            <div className="flex items-center space-x-3 border-b border-[#5c3a21] pb-3">
              <Plus className="w-7 h-7 text-[#dfba48]" />
              <div>
                <h2 className="text-lg font-cinzel font-bold text-[#dfba48]">
                  ADD YOUR CUSTOM AUDIO / MP3
                </h2>
                <p className="text-xs font-serif-vintage text-amber-200/70 italic">
                  Upload your legally obtained song files or add authorized streaming URLs
                </p>
              </div>
            </div>

            {/* Drag & Drop / File Picker */}
            <div className="bg-[#140b06] border-2 border-dashed border-[#dfba48]/40 hover:border-[#dfba48] rounded-2xl p-4 text-center cursor-pointer relative transition-all">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-[#dfba48] mx-auto mb-2" />
              <p className="text-xs font-serif-vintage text-amber-200">
                {uploadedFileName ? `Selected: ${uploadedFileName}` : 'Click or Drag & Drop MP3 / Audio file'}
              </p>
              <span className="text-[10px] font-mono-radio text-amber-400/60">
                Supports MP3, WAV, AAC, OGG
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-serif-vintage">
              <div>
                <label className="block text-amber-300/80 mb-1">Song Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Likhe Jo Khat Tujhe"
                  className="w-full bg-[#160b06] border border-[#5c3a21] rounded-xl px-3 py-2 text-amber-100 focus:border-[#dfba48] outline-none"
                />
              </div>

              <div>
                <label className="block text-amber-300/80 mb-1">Hindi Title (Optional)</label>
                <input
                  type="text"
                  value={newHindiTitle}
                  onChange={e => setNewHindiTitle(e.target.value)}
                  placeholder="e.g. लिखे जो ख़त तुझे"
                  className="w-full bg-[#160b06] border border-[#5c3a21] rounded-xl px-3 py-2 text-amber-100 focus:border-[#dfba48] outline-none font-display-hindi"
                />
              </div>

              <div>
                <label className="block text-amber-300/80 mb-1">Artist / Singer *</label>
                <input
                  type="text"
                  required
                  value={newArtist}
                  onChange={e => setNewArtist(e.target.value)}
                  placeholder="e.g. Mohammed Rafi"
                  className="w-full bg-[#160b06] border border-[#5c3a21] rounded-xl px-3 py-2 text-amber-100 focus:border-[#dfba48] outline-none"
                />
              </div>

              <div>
                <label className="block text-amber-300/80 mb-1">Year</label>
                <input
                  type="text"
                  value={newYear}
                  onChange={e => setNewYear(e.target.value)}
                  placeholder="e.g. 1970"
                  className="w-full bg-[#160b06] border border-[#5c3a21] rounded-xl px-3 py-2 text-amber-100 focus:border-[#dfba48] outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-amber-300/80 mb-1">Direct Audio Stream / MP3 URL (Optional)</label>
                <input
                  type="url"
                  value={newAudioUrl}
                  onChange={e => setNewAudioUrl(e.target.value)}
                  placeholder="https://example.com/my-song.mp3"
                  className="w-full bg-[#160b06] border border-[#5c3a21] rounded-xl px-3 py-2 text-amber-100 focus:border-[#dfba48] outline-none font-mono-radio text-[11px]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#5c3a21]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#2e1a0f] hover:bg-[#422514] text-amber-200 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#dfba48] to-[#b8860b] text-[#160b06] font-bold text-xs shadow-lg hover:brightness-110"
              >
                Add & Play on Radio
              </button>
            </div>
          </form>
        )}

        {/* 8. ATMOSPHERIC AMBIENCE SOUND MIXER MODAL */}
        {activeModal === 'ambience' && (
          <div className="space-y-5">
            <div className="flex items-center space-x-3 border-b border-[#5c3a21] pb-3">
              <Sliders className="w-7 h-7 text-[#dfba48]" />
              <div>
                <h2 className="text-lg font-cinzel font-bold text-[#dfba48]">
                  MOUNTAIN AMBIENT SOUND MIXER
                </h2>
                <p className="text-xs font-serif-vintage text-amber-200/70 italic">
                  Mix Himalayan rain, crackling wood fire, and pine forest wind with the radio
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {ambientSounds.map(sound => (
                <div
                  key={sound.id}
                  className={`p-3.5 rounded-2xl border-2 transition-all space-y-2 ${
                    sound.enabled
                      ? 'bg-[#2b180d] border-[#dfba48]/60 shadow-md'
                      : 'bg-[#140b06] border-[#3d2414] opacity-75'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{sound.icon}</span>
                      <div>
                        <div className="text-xs font-bold font-serif-vintage text-amber-100">
                          {sound.name}
                        </div>
                        <div className="text-[10px] font-display-hindi text-amber-400/80">
                          {sound.hindiName}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleAmbientSound(sound.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        sound.enabled
                          ? 'bg-[#dfba48] text-[#140b06] shadow'
                          : 'bg-[#24150b] text-neutral-500'
                      }`}
                    >
                      {sound.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                  </div>

                  {sound.enabled && (
                    <div className="flex items-center space-x-3 pt-1">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={sound.volume}
                        onChange={e => onUpdateAmbientVolume(sound.id, parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-[#3d2414] rounded-lg appearance-none cursor-pointer accent-[#dfba48]"
                      />
                      <span className="text-[10px] font-mono-radio text-[#dfba48] w-7 text-right">
                        {Math.round(sound.volume * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. KEYBOARD SHORTCUTS MODAL */}
        {activeModal === 'shortcuts' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 border-b border-[#5c3a21] pb-3">
              <Keyboard className="w-7 h-7 text-[#dfba48]" />
              <div>
                <h2 className="text-lg font-cinzel font-bold text-[#dfba48]">
                  KEYBOARD SHORTCUTS
                </h2>
                <p className="text-xs font-serif-vintage text-amber-200/70 italic">
                  Quick mountain cabin controls
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-serif-vintage">
              <div className="bg-[#160b06] p-3 rounded-xl border border-[#4a2e16] flex justify-between items-center">
                <span>Play / Pause</span>
                <kbd className="px-2 py-1 bg-[#3d2414] border border-[#dfba48]/40 rounded font-mono-radio text-[#dfba48]">
                  Space
                </kbd>
              </div>
              <div className="bg-[#160b06] p-3 rounded-xl border border-[#4a2e16] flex justify-between items-center">
                <span>Next Melody</span>
                <kbd className="px-2 py-1 bg-[#3d2414] border border-[#dfba48]/40 rounded font-mono-radio text-[#dfba48]">
                  → Right Arrow
                </kbd>
              </div>
              <div className="bg-[#160b06] p-3 rounded-xl border border-[#4a2e16] flex justify-between items-center">
                <span>Previous Melody</span>
                <kbd className="px-2 py-1 bg-[#3d2414] border border-[#dfba48]/40 rounded font-mono-radio text-[#dfba48]">
                  ← Left Arrow
                </kbd>
              </div>
              <div className="bg-[#160b06] p-3 rounded-xl border border-[#4a2e16] flex justify-between items-center">
                <span>Mute / Unmute</span>
                <kbd className="px-2 py-1 bg-[#3d2414] border border-[#dfba48]/40 rounded font-mono-radio text-[#dfba48]">
                  M
                </kbd>
              </div>
              <div className="bg-[#160b06] p-3 rounded-xl border border-[#4a2e16] flex justify-between items-center sm:col-span-2">
                <span>Fullscreen Mountain Mode</span>
                <kbd className="px-2 py-1 bg-[#3d2414] border border-[#dfba48]/40 rounded font-mono-radio text-[#dfba48]">
                  F
                </kbd>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

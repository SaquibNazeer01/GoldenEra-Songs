export type EnvironmentMode = 'morning' | 'sunset' | 'night' | 'rainy' | 'snowy';

export interface Song {
  id: string;
  title: string;
  hindiTitle?: string;
  artist: string;
  movie?: string;
  year: number | string;
  category: string;
  genre?: string;
  duration: number; // in seconds
  audioUrl?: string; // custom audio or placeholder
  artworkUrl?: string;
  raga?: string;
  lyricist?: string;
  musicDirector?: string;
  moodSnippet?: string;
  melodyNotes?: number[]; // MIDI note frequencies for procedural vintage synth
  isCustom?: boolean;
}

export interface RadioStation {
  id: string;
  name: string;
  frequency: number; // e.g. 102.4
  tagline: string;
  location: string;
  category: string;
  elevation: string;
  signalQuality: 'Excellent' | 'Good' | 'Atmospheric Static' | 'Faint Drift';
  quote: string;
  coverImage?: string;
  streamUrl?: string;
}

export interface AmbientSoundState {
  id: 'rain' | 'fire' | 'forest' | 'wind' | 'stream' | 'insects' | 'vinyl';
  name: string;
  hindiName: string;
  icon: string;
  volume: number; // 0 to 1
  enabled: boolean;
  description: string;
}

export interface NostalgicQuote {
  quote: string;
  author?: string;
  location?: string;
  mood: string;
}

export interface PoemEntry {
  title: string;
  poet: string;
  hindiLines: string[];
  englishTranslation: string;
  year: string;
  note: string;
}

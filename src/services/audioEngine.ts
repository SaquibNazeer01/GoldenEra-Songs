import { Song } from '../types';

class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  private isInitialized = false;

  // Master nodes
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Vintage Tube & Filter chain
  private tubeSaturator: WaveShaperNode | null = null;
  private radioFilter: BiquadFilterNode | null = null;
  private warmBassFilter: BiquadFilterNode | null = null;

  // HTML5 audio element for actual MP3s
  private audioElement: HTMLAudioElement | null = null;
  private audioSourceNode: MediaElementAudioSourceNode | null = null;
  private playPromise: Promise<void> | null = null;
  private playRequestId = 0;

  // Ambient sound generators
  private ambienceNodes: {
    [key: string]: {
      gain: GainNode;
      stop: () => void;
      updateVolume: (v: number) => void;
    } | null;
  } = {
    rain: null,
    fire: null,
    forest: null,
    wind: null,
    stream: null,
    insects: null,
    vinyl: null,
  };

  // Synthesizer scheduler for melodic songs
  private synthInterval: number | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private isPlayingSynth = false;

  // State
  private masterVolume = 0.85;
  private musicVolume = 0.85;
  private isRadioOn = false;

  public init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);

      // Music sub-gain
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);

      // Ambient sub-gain
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

      // Tube saturation curve
      this.tubeSaturator = this.ctx.createWaveShaper();
      this.tubeSaturator.curve = this.makeDistortionCurve(12);
      this.tubeSaturator.oversample = '2x';

      // Radio warm tube filter (slight rolloff above 7.5kHz for vintage AM/FM warmth)
      this.radioFilter = this.ctx.createBiquadFilter();
      this.radioFilter.type = 'lowpass';
      this.radioFilter.frequency.setValueAtTime(8000, this.ctx.currentTime);
      this.radioFilter.Q.setValueAtTime(0.7, this.ctx.currentTime);

      // Warm bass shelf
      this.warmBassFilter = this.ctx.createBiquadFilter();
      this.warmBassFilter.type = 'lowshelf';
      this.warmBassFilter.frequency.setValueAtTime(200, this.ctx.currentTime);
      this.warmBassFilter.gain.setValueAtTime(3.5, this.ctx.currentTime);

      // Analyser for VU Meter and Oscilloscope
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      // Connect Music Chain: Music -> Tube -> WarmBass -> RadioFilter -> MusicGain -> Master -> Analyser -> Dest
      this.tubeSaturator.connect(this.warmBassFilter);
      this.warmBassFilter.connect(this.radioFilter);
      this.radioFilter.connect(this.musicGain);
      this.musicGain.connect(this.masterGain);

      // Connect Ambient Chain: AmbientGain -> Master
      this.ambientGain.connect(this.masterGain);

      // Master -> Analyser -> Output
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // HTML5 Audio setup
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';
      this.audioSourceNode = this.ctx.createMediaElementSource(this.audioElement);
      this.audioSourceNode.connect(this.tubeSaturator);

      this.isInitialized = true;

      // Start static vinyl hiss floor for authentic mountain radio warmth
      this.startVinylHiss();
    } catch (e) {
      console.warn('Web Audio initialization error:', e);
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private makeDistortionCurve(amount: number) {
    const k = typeof amount === 'number' ? amount : 10;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  // --- RADIO STATIC & TUNING SOUNDS ---
  public playTuningStatic(intensity = 0.4, duration = 0.4) {
    if (!this.ctx || !this.isRadioOn) return;
    this.resume();

    const t = this.ctx.currentTime;
    // White noise buffer
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass filter for realistic analog tuning static
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.exponentialRampToValueAtTime(3200, t + duration * 0.5);
    filter.frequency.exponentialRampToValueAtTime(1200, t + duration);
    filter.Q.setValueAtTime(2.5, t);

    // Whistle heterodyne oscillator (classic analog RF squeal)
    const whistle = this.ctx.createOscillator();
    whistle.type = 'sine';
    whistle.frequency.setValueAtTime(2400 + Math.random() * 800, t);
    whistle.frequency.exponentialRampToValueAtTime(800 + Math.random() * 400, t + duration);

    const whistleGain = this.ctx.createGain();
    whistleGain.gain.setValueAtTime(0.04 * intensity, t);
    whistleGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(intensity * 0.35, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain!);

    whistle.connect(whistleGain);
    whistleGain.connect(this.masterGain!);

    noise.start(t);
    whistle.start(t);
    noise.stop(t + duration);
    whistle.stop(t + duration);
  }

  // Akashvani / Vintage Radio Iconic Chime
  public playAkashvaniChime() {
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const chimeFrequencies = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    
    chimeFrequencies.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.18);

      gain.gain.setValueAtTime(0, t + idx * 0.18);
      gain.gain.linearRampToValueAtTime(0.12, t + idx * 0.18 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.18 + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(t + idx * 0.18);
      osc.stop(t + idx * 0.18 + 1.3);
    });
  }

  // --- AMBIENT SOUND GENERATORS (100% Procedural & Seamless) ---

  public setAmbientSound(id: 'rain' | 'fire' | 'forest' | 'wind' | 'stream' | 'insects' | 'vinyl', enabled: boolean, volume: number) {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    if (!enabled) {
      if (this.ambienceNodes[id]) {
        this.ambienceNodes[id]?.stop();
        this.ambienceNodes[id] = null;
      }
      return;
    }

    if (this.ambienceNodes[id]) {
      this.ambienceNodes[id]?.updateVolume(volume);
      return;
    }

    // Start sound by type
    switch (id) {
      case 'rain':
        this.ambienceNodes.rain = this.createRainNode(volume);
        break;
      case 'fire':
        this.ambienceNodes.fire = this.createFireplaceNode(volume);
        break;
      case 'wind':
        this.ambienceNodes.wind = this.createWindNode(volume);
        break;
      case 'forest':
        this.ambienceNodes.forest = this.createForestNode(volume);
        break;
      case 'stream':
        this.ambienceNodes.stream = this.createStreamNode(volume);
        break;
      case 'insects':
        this.ambienceNodes.insects = this.createInsectsNode(volume);
        break;
      case 'vinyl':
        this.ambienceNodes.vinyl = this.createVinylNode(volume);
        break;
    }
  }

  // Rain: Filtered Pink Noise + Drops
  private createRainNode(initVolume: number) {
    if (!this.ctx) return null;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(initVolume * 0.5, this.ctx.currentTime);
    gain.connect(this.ambientGain!);

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
      b6 = white * 0.115926;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1400, this.ctx.currentTime);

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(350, this.ctx.currentTime);

    noise.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(gain);
    noise.start();

    return {
      gain,
      stop: () => {
        try {
          noise.stop();
          gain.disconnect();
        } catch { /* ignored */ }
      },
      updateVolume: (v: number) => {
        gain.gain.setTargetAtTime(v * 0.5, this.ctx?.currentTime || 0, 0.1);
      }
    };
  }

  // Fireplace: Low rumble + crackle pops
  private createFireplaceNode(initVolume: number) {
    if (!this.ctx) return null;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(initVolume * 0.45, this.ctx.currentTime);
    gain.connect(this.ambientGain!);

    // Low rumble noise
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(450, this.ctx.currentTime);

    noise.connect(lp);
    lp.connect(gain);
    noise.start();

    // Crackle interval for authentic wood pops
    let isRunning = true;
    const triggerCrackle = () => {
      if (!isRunning || !this.ctx) return;
      const t = this.ctx.currentTime;
      const popOsc = this.ctx.createOscillator();
      const popGain = this.ctx.createGain();
      const popFilter = this.ctx.createBiquadFilter();

      popFilter.type = 'bandpass';
      popFilter.frequency.setValueAtTime(800 + Math.random() * 2500, t);
      popFilter.Q.setValueAtTime(5 + Math.random() * 10, t);

      popOsc.type = 'sawtooth';
      popOsc.frequency.setValueAtTime(100 + Math.random() * 300, t);

      popGain.gain.setValueAtTime(0, t);
      popGain.gain.linearRampToValueAtTime(0.3 * Math.random(), t + 0.002);
      popGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03 + Math.random() * 0.05);

      popOsc.connect(popFilter);
      popFilter.connect(popGain);
      popGain.connect(gain);

      popOsc.start(t);
      popOsc.stop(t + 0.1);

      const nextPop = 100 + Math.random() * 500;
      setTimeout(triggerCrackle, nextPop);
    };

    triggerCrackle();

    return {
      gain,
      stop: () => {
        isRunning = false;
        try {
          noise.stop();
          gain.disconnect();
        } catch { /* ignored */ }
      },
      updateVolume: (v: number) => {
        gain.gain.setTargetAtTime(v * 0.45, this.ctx?.currentTime || 0, 0.1);
      }
    };
  }

  // Wind: Gentle mountain pine wind
  private createWindNode(initVolume: number) {
    if (!this.ctx) return null;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(initVolume * 0.35, this.ctx.currentTime);
    gain.connect(this.ambientGain!);

    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(450, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(2.0, this.ctx.currentTime);

    // LFO for gusting wind
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);

    noise.connect(bandpass);
    bandpass.connect(gain);

    noise.start();
    lfo.start();

    return {
      gain,
      stop: () => {
        try {
          noise.stop();
          lfo.stop();
          gain.disconnect();
        } catch { /* ignored */ }
      },
      updateVolume: (v: number) => {
        gain.gain.setTargetAtTime(v * 0.35, this.ctx?.currentTime || 0, 0.1);
      }
    };
  }

  // Forest: Whispering pines and rustling branches
  private createForestNode(initVolume: number) {
    if (!this.ctx) return null;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(initVolume * 0.3, this.ctx.currentTime);
    gain.connect(this.ambientGain!);

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    noise.start();

    return {
      gain,
      stop: () => {
        try {
          noise.stop();
          gain.disconnect();
        } catch { /* ignored */ }
      },
      updateVolume: (v: number) => {
        gain.gain.setTargetAtTime(v * 0.3, this.ctx?.currentTime || 0, 0.1);
      }
    };
  }

  // Stream: Fresh mountain brook water
  private createStreamNode(initVolume: number) {
    if (!this.ctx) return null;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(initVolume * 0.35, this.ctx.currentTime);
    gain.connect(this.ambientGain!);

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const bp1 = this.ctx.createBiquadFilter();
    bp1.type = 'bandpass';
    bp1.frequency.setValueAtTime(1100, this.ctx.currentTime);
    bp1.Q.setValueAtTime(3.0, this.ctx.currentTime);

    const bp2 = this.ctx.createBiquadFilter();
    bp2.type = 'bandpass';
    bp2.frequency.setValueAtTime(2400, this.ctx.currentTime);
    bp2.Q.setValueAtTime(2.0, this.ctx.currentTime);

    noise.connect(bp1);
    noise.connect(bp2);
    bp1.connect(gain);
    bp2.connect(gain);
    noise.start();

    return {
      gain,
      stop: () => {
        try {
          noise.stop();
          gain.disconnect();
        } catch { /* ignored */ }
      },
      updateVolume: (v: number) => {
        gain.gain.setTargetAtTime(v * 0.35, this.ctx?.currentTime || 0, 0.1);
      }
    };
  }

  // Insects: Night crickets in the mountain pines
  private createInsectsNode(initVolume: number) {
    if (!this.ctx) return null;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(initVolume * 0.18, this.ctx.currentTime);
    gain.connect(this.ambientGain!);

    const carrier = this.ctx.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(4600, this.ctx.currentTime);

    const modulator = this.ctx.createOscillator();
    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(32, this.ctx.currentTime);

    const modGain = this.ctx.createGain();
    modGain.gain.setValueAtTime(1200, this.ctx.currentTime);

    // Pulse envelope
    const pulse = this.ctx.createOscillator();
    pulse.type = 'sawtooth';
    pulse.frequency.setValueAtTime(2.2, this.ctx.currentTime);
    const pulseGain = this.ctx.createGain();
    pulseGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);

    pulse.connect(pulseGain);
    pulseGain.connect(gain.gain);

    carrier.connect(gain);

    carrier.start();
    modulator.start();
    pulse.start();

    return {
      gain,
      stop: () => {
        try {
          carrier.stop();
          modulator.stop();
          pulse.stop();
          gain.disconnect();
        } catch { /* ignored */ }
      },
      updateVolume: (v: number) => {
        gain.gain.setTargetAtTime(v * 0.18, this.ctx?.currentTime || 0, 0.1);
      }
    };
  }

  // Vinyl: 33 RPM needle dust crackles
  private createVinylNode(initVolume: number) {
    if (!this.ctx) return null;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(initVolume * 0.25, this.ctx.currentTime);
    gain.connect(this.ambientGain!);

    const bufferSize = this.ctx.sampleRate * 1.8;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Periodic clicks
      if (Math.random() < 0.0006) {
        data[i] = (Math.random() * 2 - 1) * 0.9;
      } else {
        data[i] = (Math.random() * 2 - 1) * 0.02;
      }
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(1000, this.ctx.currentTime);

    noise.connect(hp);
    hp.connect(gain);
    noise.start();

    return {
      gain,
      stop: () => {
        try {
          noise.stop();
          gain.disconnect();
        } catch { /* ignored */ }
      },
      updateVolume: (v: number) => {
        gain.gain.setTargetAtTime(v * 0.25, this.ctx?.currentTime || 0, 0.1);
      }
    };
  }

  private startVinylHiss() {
    // Light floor hiss
    this.setAmbientSound('vinyl', true, 0.15);
  }

  // --- MUSIC PLAYBACK (MP3 or Procedural Indian Vintage Instrument Synth) ---

  public playSong(song: Song, onTimeUpdate?: (currentTime: number, duration: number) => void, onEnded?: () => void) {
    this.init();
    this.resume();
    this.isRadioOn = true;

    // Stop current synth
    this.stopSynth();

    const requestId = ++this.playRequestId;

    // If real audio URL provided
    if (song.audioUrl && song.audioUrl.trim().length > 0) {
      if (this.audioElement) {
        // Clear previous event listeners
        this.audioElement.ontimeupdate = null;
        this.audioElement.onended = null;
        this.audioElement.onerror = null;

        try {
          this.audioElement.pause();
        } catch { /* ignored */ }

        this.audioElement.src = song.audioUrl;
        this.audioElement.load();

        this.audioElement.ontimeupdate = () => {
          if (requestId !== this.playRequestId) return;
          if (onTimeUpdate && this.audioElement) {
            onTimeUpdate(this.audioElement.currentTime, this.audioElement.duration || song.duration);
          }
        };

        this.audioElement.onended = () => {
          if (requestId !== this.playRequestId) return;
          if (onEnded) onEnded();
        };

        this.audioElement.onerror = (e) => {
          if (requestId !== this.playRequestId) return;
          console.warn('Audio playback error on source, activating vintage synth fallback:', e);
          this.startMelodySynth(song, onTimeUpdate, onEnded);
        };

        try {
          const promise = this.audioElement.play();
          if (promise !== undefined) {
            this.playPromise = promise;
            promise
              .then(() => {
                if (this.playPromise === promise) {
                  this.playPromise = null;
                }
              })
              .catch(err => {
                if (this.playPromise === promise) {
                  this.playPromise = null;
                }
                if (requestId !== this.playRequestId) {
                  // Obsolete request, ignore
                  return;
                }
                const isAbort = err?.name === 'AbortError' || (err?.message && (err.message.includes('aborted') || err.message.includes('interrupted')));
                if (isAbort) {
                  // Expected interruption during song change or pause
                  return;
                }
                console.warn('Audio play rejected, falling back to synth:', err);
                this.startMelodySynth(song, onTimeUpdate, onEnded);
              });
          }
        } catch (e: any) {
          const isAbort = e?.name === 'AbortError';
          if (!isAbort) {
            console.warn('Synchronous play exception, starting synth fallback:', e);
            this.startMelodySynth(song, onTimeUpdate, onEnded);
          }
        }
      }
      return;
    }

    // Otherwise, play lush authentic procedural Indian classical / semi-classical synthesizer!
    this.startMelodySynth(song, onTimeUpdate, onEnded);
  }

  public pauseMusic() {
    if (this.audioElement) {
      if (this.playPromise) {
        this.playPromise
          .then(() => {
            if (this.audioElement && !this.audioElement.paused) {
              try {
                this.audioElement.pause();
              } catch { /* ignored */ }
            }
          })
          .catch(() => {});
      } else {
        if (!this.audioElement.paused) {
          try {
            this.audioElement.pause();
          } catch { /* ignored */ }
        }
      }
    }
    this.stopSynth();
  }

  public resumeMusic(song: Song, currentTime = 0, onTimeUpdate?: (currentTime: number, duration: number) => void, onEnded?: () => void) {
    this.resume();
    const requestId = ++this.playRequestId;
    if (song.audioUrl && song.audioUrl.trim().length > 0 && this.audioElement) {
      this.audioElement.ontimeupdate = () => {
        if (requestId !== this.playRequestId) return;
        if (onTimeUpdate && this.audioElement) {
          onTimeUpdate(this.audioElement.currentTime, this.audioElement.duration || song.duration);
        }
      };

      this.audioElement.onended = () => {
        if (requestId !== this.playRequestId) return;
        if (onEnded) onEnded();
      };

      try {
        const promise = this.audioElement.play();
        if (promise !== undefined) {
          this.playPromise = promise;
          promise
            .then(() => {
              if (this.playPromise === promise) {
                this.playPromise = null;
              }
            })
            .catch(err => {
              if (this.playPromise === promise) {
                this.playPromise = null;
              }
              if (requestId !== this.playRequestId) return;
              const isAbort = err?.name === 'AbortError' || (err?.message && (err.message.includes('aborted') || err.message.includes('interrupted')));
              if (isAbort) return;
              console.warn('Resume play rejected, starting synth:', err);
              this.startMelodySynth(song, onTimeUpdate, onEnded, currentTime);
            });
        }
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          this.startMelodySynth(song, onTimeUpdate, onEnded, currentTime);
        }
      }
    } else {
      this.startMelodySynth(song, onTimeUpdate, onEnded, currentTime);
    }
  }

  public seekMusic(seconds: number, song: Song, onTimeUpdate?: (currentTime: number, duration: number) => void, onEnded?: () => void) {
    if (this.audioElement && song.audioUrl && song.audioUrl.trim().length > 0) {
      try {
        this.audioElement.currentTime = seconds;
      } catch {
        this.stopSynth();
        this.startMelodySynth(song, onTimeUpdate, onEnded, seconds);
      }
    } else {
      this.stopSynth();
      this.startMelodySynth(song, onTimeUpdate, onEnded, seconds);
    }
  }

  // Authentic Procedural Indian Vintage Melody Synthesizer:
  // Features: Tanpura drone (Sa-Pa-Sa), Plucked Sitar/Santoor, Warm Harmonium Reed Pad, Acoustic Bass
  private startMelodySynth(song: Song, onTimeUpdate?: (currentTime: number, duration: number) => void, onEnded?: () => void, startSecond = 0) {
    if (!this.ctx) return;
    this.isPlayingSynth = true;
    let currentElapsed = startSecond;
    const songTotal = song.duration || 240;

    const baseNotes = song.melodyNotes && song.melodyNotes.length > 0 
      ? song.melodyNotes 
      : [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 440.0, 392.0];

    // Start Tanpura Drone
    this.playTanpuraDrone(baseNotes[0] * 0.5);

    let noteIndex = 0;
    const bpm = 76;
    const stepDuration = (60 / bpm) * 1000 * 0.75;

    const playStep = () => {
      if (!this.isPlayingSynth || !this.ctx) return;

      currentElapsed += stepDuration / 1000;
      if (onTimeUpdate) {
        onTimeUpdate(currentElapsed, songTotal);
      }

      if (currentElapsed >= songTotal) {
        this.stopSynth();
        if (onEnded) onEnded();
        return;
      }

      const noteFreq = baseNotes[noteIndex % baseNotes.length];
      const isOrnament = noteIndex % 3 === 0;

      // 1. Plucked Sitar / Santoor Note
      this.playPluckedString(noteFreq, isOrnament ? 0.35 : 0.25);

      // 2. Warm Harmonium Chord every 4 notes
      if (noteIndex % 4 === 0) {
        const root = baseNotes[0];
        const fifth = baseNotes[3] || root * 1.5;
        this.playHarmoniumChord([root * 0.5, fifth * 0.5, noteFreq], 1.8);
      }

      // 3. Occasional gentle flute ornament
      if (noteIndex % 8 === 4) {
        this.playBansuriFlute(noteFreq * 2, 0.9);
      }

      noteIndex++;
      this.synthInterval = window.setTimeout(playStep, stepDuration);
    };

    playStep();
  }

  // Tanpura Drone (Sa-Pa continuous shimmer)
  private playTanpuraDrone(rootFreq: number) {
    if (!this.ctx) return;
    const freqs = [rootFreq * 0.75, rootFreq, rootFreq * 1.5, rootFreq * 2];

    freqs.forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600 + i * 150, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);

      // Slow amplitude modulation for natural tanpura pluck shimmer
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.25 + i * 0.1, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.015, this.ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.tubeSaturator!);

      osc.start();
      lfo.start();

      this.activeOscillators.push(osc, lfo);
    });
  }

  // Plucked Sitar / Santoor Note
  private playPluckedString(freq: number, volume = 0.2) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    // Slight micro-pitch glide (Meend) characteristic of Indian classical
    osc.frequency.exponentialRampToValueAtTime(freq * 1.01, t + 0.05);
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.15);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, t);
    filter.frequency.exponentialRampToValueAtTime(800, t + 0.6);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.tubeSaturator!);

    osc.start(t);
    osc.stop(t + 0.8);
  }

  // Warm Harmonium Reed Pad
  private playHarmoniumChord(frequencies: number[], duration = 2.0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    frequencies.forEach(freq => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Reed-like rich square/sawtooth mix
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, t);
      filter.Q.setValueAtTime(1.5, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.06, t + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.0005, t + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.tubeSaturator!);

      osc.start(t);
      osc.stop(t + duration + 0.1);
    });
  }

  // Bansuri / Bamboo Flute Ornament
  private playBansuriFlute(freq: number, duration = 1.0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 0.98, t);
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.1);

    // Breath vibrato LFO
    const vibrato = this.ctx.createOscillator();
    vibrato.frequency.setValueAtTime(5.5, t);
    const vibGain = this.ctx.createGain();
    vibGain.gain.setValueAtTime(6, t);

    vibrato.connect(vibGain);
    vibGain.connect(osc.frequency);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2500, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.tubeSaturator!);

    osc.start(t);
    vibrato.start(t);
    osc.stop(t + duration);
    vibrato.stop(t + duration);
  }

  private stopSynth() {
    this.isPlayingSynth = false;
    if (this.synthInterval) {
      clearTimeout(this.synthInterval);
      this.synthInterval = null;
    }
    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch { /* ignored */ }
    });
    this.activeOscillators = [];
  }

  // --- VOLUME & CONTROLS ---
  public setMasterVolume(v: number) {
    this.masterVolume = Math.max(0, Math.min(1, v));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
    }
    if (this.audioElement) {
      this.audioElement.volume = this.masterVolume * this.musicVolume;
    }
  }

  public setMusicVolume(v: number) {
    this.musicVolume = Math.max(0, Math.min(1, v));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
    }
    if (this.audioElement) {
      this.audioElement.volume = this.masterVolume * this.musicVolume;
    }
  }

  public setToneFilter(trebleAmount: number, bassAmount: number) {
    if (!this.ctx) return;
    if (this.radioFilter) {
      // Map treble 0-1 to cutoff 2500Hz - 12000Hz
      const freq = 2500 + trebleAmount * 9500;
      this.radioFilter.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.1);
    }
    if (this.warmBassFilter) {
      // Map bass 0-1 to gain -3dB to +8dB
      const gain = -3 + bassAmount * 11;
      this.warmBassFilter.gain.setTargetAtTime(gain, this.ctx.currentTime, 0.1);
    }
  }

  public getAudioFrequencyData(dataArray: Uint8Array) {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(dataArray);
    }
  }

  public getAudioTimeDomainData(dataArray: Uint8Array) {
    if (this.analyser) {
      this.analyser.getByteTimeDomainData(dataArray);
    }
  }

  public playClickSound() {
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.03);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(t);
    osc.stop(t + 0.04);
  }
}

export const audioEngine = new RetroAudioEngine();

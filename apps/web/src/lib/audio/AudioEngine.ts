import { MUTE_STORAGE_KEY, type SoundName } from "./types";

const MASTER_VOLUME = 0.35;

function readStoredMute(): boolean {
  try {
    return window.localStorage.getItem(MUTE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeStoredMute(muted: boolean): void {
  try {
    window.localStorage.setItem(MUTE_STORAGE_KEY, muted ? "1" : "0");
  } catch {
    // Storage can be unavailable (private mode, quotas, etc.).
  }
}

function midiToFreq(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

function createAudioContext(): AudioContext {
  const AudioContextCtor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  return new AudioContextCtor();
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted = typeof window === "undefined" ? false : readStoredMute();
  private musicPlaying = false;
  private musicTimer: number | null = null;
  private nextMusicTime = 0;
  private musicStep = 0;
  private unlockPromise: Promise<void> | null = null;

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    writeStoredMute(muted);
    if (this.master) {
      this.master.gain.value = muted ? 0 : MASTER_VOLUME;
    }
    if (muted) {
      this.stopMusic();
    }
  }

  /** Must be called from a user gesture (click / keydown). */
  async unlock(): Promise<void> {
    const ctx = this.ensureContext();
    if (ctx.state === "running") {
      return;
    }
    if (!this.unlockPromise) {
      this.unlockPromise = ctx
        .resume()
        .then(() => undefined)
        .finally(() => {
          this.unlockPromise = null;
        });
    }
    await this.unlockPromise;
  }

  async play(name: SoundName): Promise<void> {
    if (this.muted) {
      return;
    }
    await this.unlock();
    const ctx = this.ensureContext();
    if (ctx.state !== "running") {
      return;
    }
    const now = ctx.currentTime + 0.01;

    switch (name) {
      case "click":
        this.beep(now, 880, 0.06, "square", 0.22);
        break;
      case "join":
        this.playJoin(now);
        break;
      case "correct":
        this.playArpeggio(now, [60, 64, 67, 72], 0.08, "square", 0.22);
        break;
      case "wrong":
        this.playWrong(now);
        break;
      case "tick":
        this.beep(now, 660, 0.08, "square", 0.24);
        break;
      case "go":
        this.playGo(now);
        break;
      case "win":
        this.playWin(now);
        break;
    }
  }

  async startMusic(): Promise<void> {
    if (this.muted) {
      return;
    }
    await this.unlock();
    const ctx = this.ensureContext();
    if (ctx.state !== "running") {
      return;
    }
    if (this.musicPlaying) {
      return;
    }
    this.musicPlaying = true;
    this.musicStep = 0;
    this.nextMusicTime = ctx.currentTime + 0.05;
    this.scheduleMusic();
  }

  stopMusic(): void {
    this.musicPlaying = false;
    if (this.musicTimer !== null) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = createAudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : MASTER_VOLUME;
      this.master.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  private tone(
    start: number,
    frequency: number,
    duration: number,
    type: OscillatorType,
    peak: number,
  ): void {
    const ctx = this.ensureContext();
    const master = this.master;
    if (!master || this.muted) {
      return;
    }

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, start);

      // linearRamp is more reliable than exponentialRamp across browsers
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(peak, start + 0.012);
      gain.gain.linearRampToValueAtTime(0, start + duration);

      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + duration + 0.03);
    } catch {
      // Ignore transient Web Audio scheduling errors
    }
  }

  private beep(
    start: number,
    frequency: number,
    duration: number,
    type: OscillatorType,
    peak: number,
  ): void {
    this.tone(start, frequency, duration, type, peak);
  }

  private playJoin(start: number): void {
    this.tone(start, 520, 0.08, "triangle", 0.24);
    this.tone(start + 0.05, 780, 0.1, "sine", 0.2);
    this.tone(start + 0.1, 1040, 0.12, "triangle", 0.16);
  }

  private playWrong(start: number): void {
    const ctx = this.ensureContext();
    const master = this.master;
    if (!master) {
      return;
    }
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, start);
      osc.frequency.linearRampToValueAtTime(70, start + 0.28);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.28, start + 0.02);
      gain.gain.linearRampToValueAtTime(0, start + 0.3);
      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + 0.32);
    } catch {
      // Ignore transient Web Audio scheduling errors
    }
  }

  private playArpeggio(
    start: number,
    midis: number[],
    step: number,
    type: OscillatorType,
    peak: number,
  ): void {
    midis.forEach((midi, index) => {
      this.tone(start + index * step, midiToFreq(midi), step + 0.04, type, peak);
    });
  }

  private playGo(start: number): void {
    [60, 64, 67].forEach((midi) => {
      this.tone(start, midiToFreq(midi), 0.32, "square", 0.18);
    });
    this.tone(start + 0.12, midiToFreq(72), 0.25, "square", 0.2);
  }

  private playWin(start: number): void {
    const notes = [60, 64, 67, 72, 76, 79, 84];
    notes.forEach((midi, index) => {
      this.tone(start + index * 0.07, midiToFreq(midi), 0.14, "square", 0.2);
    });
    [72, 76, 79].forEach((midi) => {
      this.tone(start + 0.55, midiToFreq(midi), 0.4, "square", 0.18);
    });
  }

  private scheduleMusic(): void {
    if (!this.musicPlaying || this.muted) {
      return;
    }

    const ctx = this.ensureContext();
    if (ctx.state !== "running") {
      this.musicTimer = window.setTimeout(() => {
        this.scheduleMusic();
      }, 100);
      return;
    }

    // 120 BPM → quarter = 0.5s; 16th = 0.125s
    const stepDuration = 0.125;
    const lookAhead = 0.25;

    while (this.nextMusicTime < ctx.currentTime + lookAhead) {
      this.playMusicStep(this.nextMusicTime, this.musicStep % 64);
      this.nextMusicTime += stepDuration;
      this.musicStep += 1;
    }

    this.musicTimer = window.setTimeout(() => {
      this.scheduleMusic();
    }, 40);
  }

  private playMusicStep(time: number, step: number): void {
    // 4 bars of 16 sixteenths = 64 steps, seamless loop.
    const bassPattern = [36, 0, 36, 0, 43, 0, 36, 0, 38, 0, 38, 0, 43, 0, 41, 0];
    const arpPattern = [60, 64, 67, 72, 67, 64, 60, 64, 62, 65, 69, 74, 69, 65, 62, 65];

    const bassMidi = bassPattern[step % bassPattern.length] ?? 0;
    if (bassMidi > 0) {
      this.tone(time, midiToFreq(bassMidi), 0.12, "square", 0.16);
    }

    if (step % 2 === 0) {
      const arpMidi = arpPattern[(step / 2) % arpPattern.length] ?? 0;
      if (arpMidi > 0) {
        this.tone(time, midiToFreq(arpMidi), 0.1, "square", 0.1);
      }
    }

    if (step % 8 === 0) {
      this.tone(time, 180, 0.04, "triangle", 0.08);
    }
  }
}

export const audioEngine = new AudioEngine();

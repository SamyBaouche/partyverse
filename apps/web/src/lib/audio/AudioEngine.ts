import { MUTE_STORAGE_KEY, type SoundName } from "./types";

/** Overall mix — loud enough to hear, still soft for long lobby sessions. */
const MASTER_VOLUME = 0.55;
/** Music bed relative level (on top of master). */
const MUSIC_GAIN = 1;
const VOLUME_STORAGE_KEY = "partyverse.volume";
const MUSIC_STORAGE_KEY = "partyverse.music";

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

function readStoredVolume(): number {
  try {
    const raw = window.localStorage.getItem(VOLUME_STORAGE_KEY);
    if (raw === null) {
      return 0.85;
    }
    const value = Number(raw);
    if (!Number.isFinite(value)) {
      return 0.85;
    }
    return Math.min(1, Math.max(0, value));
  } catch {
    return 0.85;
  }
}

function writeStoredVolume(volume: number): void {
  try {
    window.localStorage.setItem(VOLUME_STORAGE_KEY, String(volume));
  } catch {
    // ignore
  }
}

function readStoredMusicEnabled(): boolean {
  try {
    const raw = window.localStorage.getItem(MUSIC_STORAGE_KEY);
    // Calm lobby bed on by default; Settings → Save still controls it.
    if (raw === null) {
      return true;
    }
    return raw === "1";
  } catch {
    return true;
  }
}

function writeStoredMusicEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(MUSIC_STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    // ignore
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
  private musicBus: GainNode | null = null;
  private muted = typeof window === "undefined" ? false : readStoredMute();
  private volume = typeof window === "undefined" ? 0.85 : readStoredVolume();
  private musicEnabled = typeof window === "undefined" ? true : readStoredMusicEnabled();
  private musicPlaying = false;
  private musicTimer: number | null = null;
  private nextMusicTime = 0;
  private musicStep = 0;
  private unlockPromise: Promise<void> | null = null;

  isMuted(): boolean {
    return this.muted;
  }

  getVolume(): number {
    return this.volume;
  }

  isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  isMusicPlaying(): boolean {
    return this.musicPlaying && !!this.ctx && this.ctx.state === "running";
  }

  setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume));
    writeStoredVolume(this.volume);
    this.applyMasterGain();
  }

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    writeStoredMusicEnabled(enabled);
    if (!enabled) {
      this.stopMusic();
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    writeStoredMute(muted);
    this.applyMasterGain();
    if (muted) {
      this.stopMusic();
    }
  }

  private applyMasterGain(): void {
    if (!this.master) {
      return;
    }
    this.master.gain.value = this.muted ? 0 : MASTER_VOLUME * this.volume;
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
    if (this.muted || !this.musicEnabled) {
      return;
    }
    await this.unlock();
    const ctx = this.ensureContext();
    if (ctx.state !== "running") {
      return;
    }
    // Always (re)start so a dead timer / silent state recovers.
    this.stopMusic();
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
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = MUSIC_GAIN;
      this.musicBus.connect(this.master);
      this.applyMasterGain();
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
    bus: "sfx" | "music" = "sfx",
  ): void {
    const ctx = this.ensureContext();
    const master = this.master;
    const musicBus = this.musicBus;
    if (!master || this.muted) {
      return;
    }
    const destination = bus === "music" && musicBus ? musicBus : master;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(peak, start + 0.02);
      gain.gain.linearRampToValueAtTime(0, start + duration);

      osc.connect(gain);
      gain.connect(destination);
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
    if (!this.musicPlaying || this.muted || !this.musicEnabled) {
      return;
    }

    const ctx = this.ensureContext();
    if (ctx.state !== "running") {
      this.musicTimer = window.setTimeout(() => {
        this.scheduleMusic();
      }, 100);
      return;
    }

    // Calm lobby loop (~70 BPM).
    const stepDuration = 0.42;
    const lookAhead = 1.1;

    while (this.nextMusicTime < ctx.currentTime + lookAhead) {
      this.playMusicStep(this.nextMusicTime, this.musicStep % 32);
      this.nextMusicTime += stepDuration;
      this.musicStep += 1;
    }

    this.musicTimer = window.setTimeout(() => {
      this.scheduleMusic();
    }, 60);
  }

  private playMusicStep(time: number, step: number): void {
    // Calm living-room pad — soft, slow, no sharp arcade stabs.
    const padRoot = [48, 48, 48, 48, 45, 45, 43, 43];
    const padFifth = [55, 55, 55, 55, 52, 52, 50, 50];
    const sparkle = [0, 0, 0, 67, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 69];

    const bar = Math.floor(step / 4) % padRoot.length;
    const root = padRoot[bar] ?? 48;
    const fifth = padFifth[bar] ?? 55;

    // Warm held chords
    this.tone(time, midiToFreq(root), 1.55, "sine", 0.045, "music");
    this.tone(time, midiToFreq(fifth), 1.45, "sine", 0.032, "music");
    this.tone(time, midiToFreq(root + 12), 1.2, "triangle", 0.018, "music");

    // Rare soft sparkle so it still feels playful
    const sparkleMidi = sparkle[step % sparkle.length] ?? 0;
    if (sparkleMidi > 0) {
      this.tone(time, midiToFreq(sparkleMidi), 0.9, "sine", 0.028, "music");
    }
  }
}

export const audioEngine = new AudioEngine();

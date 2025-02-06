// Sound URLs from Mixkit (Free sound effects)
export const SOUNDS = {
  collision: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  drag: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  drop: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3',
} as const;

class SoundManager {
  private sounds: Map<string, HTMLAudioElement[]> = new Map();
  private lastPlayTime: Map<string, number> = new Map();
  private readonly minTimeBetweenSounds = 50; // Reduced to 50ms to allow more frequent sounds
  private readonly poolSize = 5; // Increased pool size for more concurrent sounds
  private enabled = false;

  constructor() {
    this.initializeSounds();
    this.enableSounds();
  }

  private initializeSounds() {
    Object.entries(SOUNDS).forEach(([key, url]) => {
      const audioPool: HTMLAudioElement[] = [];
      
      for (let i = 0; i < this.poolSize; i++) {
        const audio = new Audio(url);
        audio.preload = 'auto';
        audio.volume = 0.2; // Default volume
        audioPool.push(audio);
      }

      this.sounds.set(key, audioPool);
      this.lastPlayTime.set(key, 0);
    });
  }

  private enableSounds() {
    const enable = () => {
      this.enabled = true;
      // Try to play a silent sound to unlock audio
      const audio = new Audio();
      audio.play().catch(() => {});
      
      window.removeEventListener('click', enable);
      window.removeEventListener('touchstart', enable);
      document.removeEventListener('keydown', enable);
    };

    window.addEventListener('click', enable);
    window.addEventListener('touchstart', enable);
    document.addEventListener('keydown', enable);
  }

  play(soundId: keyof typeof SOUNDS, volume?: number) {
    if (!this.enabled) return;

    const now = Date.now();
    const lastPlay = this.lastPlayTime.get(soundId) || 0;
    
    if (now - lastPlay < this.minTimeBetweenSounds) return;

    const audioPool = this.sounds.get(soundId);
    if (!audioPool) return;

    // Find an audio element that's not playing or use the oldest one
    const availableAudio = audioPool.find(audio => audio.paused) || audioPool[0];
    
    if (availableAudio) {
      availableAudio.currentTime = 0;
      if (volume !== undefined) {
        availableAudio.volume = volume;
      }
      availableAudio.play().catch(e => {
        console.warn('Sound play failed:', e);
        // If play fails, try to re-enable sounds
        this.enabled = false;
        this.enableSounds();
      });
      this.lastPlayTime.set(soundId, now);
    }
  }
}

export const soundManager = new SoundManager();
export class AudioQueueManager {
  constructor() {
    this.queue = [];
    this.isPlaying = false;
    this.currentAudio = null;
  }

  enqueue(audioSrc, options = {}) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        src: audioSrc,
        options,
        resolve,
        reject
      });
      
      if (!this.isPlaying) {
        this.playNext();
      }
    });
  }

  async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const { src, options, resolve, reject } = this.queue.shift();

    try {
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      }

      this.currentAudio = new Audio(src);
      
      if (options.volume !== undefined) {
        this.currentAudio.volume = options.volume;
      }

      this.currentAudio.onended = () => {
        resolve();
        this.playNext();
      };

      this.currentAudio.onerror = (error) => {
        console.error('Audio playback error:', error);
        reject(error);
        this.playNext();
      };

      await this.currentAudio.play();
      
    } catch (error) {
      console.error('Error playing audio:', error);
      reject(error);
      this.playNext();
    }
  }

  clear() {
    this.queue = [];
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.isPlaying = false;
  }

  stop() {
    this.clear();
  }

  pause() {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }
  }

  resume() {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play().catch(err => 
        console.error('Error resuming audio:', err)
      );
    }
  }

  getStatus() {
    return {
      isPlaying: this.isPlaying,
      queueLength: this.queue.length,
      hasCurrentAudio: !!this.currentAudio
    };
  }
}
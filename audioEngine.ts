import { DialogueSegment, SpeakerProfile } from '../types';

export class DubAudioEngine {
  private audioCtx: AudioContext | null = null;
  private dialogueGain: GainNode | null = null;
  private bgGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private isInitialized = false;

  public init() {
    if (this.isInitialized && this.audioCtx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      
      this.compressor = this.audioCtx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-24, this.audioCtx.currentTime);
      this.compressor.knee.setValueAtTime(30, this.audioCtx.currentTime);
      this.compressor.ratio.setValueAtTime(12, this.audioCtx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.audioCtx.currentTime);
      this.compressor.release.setValueAtTime(0.25, this.audioCtx.currentTime);
      this.compressor.connect(this.audioCtx.destination);

      this.dialogueGain = this.audioCtx.createGain();
      this.dialogueGain.gain.setValueAtTime(1.0, this.audioCtx.currentTime);
      this.dialogueGain.connect(this.compressor);

      this.bgGain = this.audioCtx.createGain();
      this.bgGain.gain.setValueAtTime(0.65, this.audioCtx.currentTime);
      this.bgGain.connect(this.compressor);

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported or user gesture needed:', e);
    }
  }

  public setVolumes(dialogueVolume: number, bgVolume: number) {
    if (!this.audioCtx || !this.dialogueGain || !this.bgGain) return;
    const now = this.audioCtx.currentTime;
    this.dialogueGain.gain.setTargetAtTime(dialogueVolume / 100, now, 0.05);
    this.bgGain.gain.setTargetAtTime(bgVolume / 100, now, 0.05);
  }

  // Play dialogue segment using synthesized audio or Web Speech
  public speakSegment(
    segment: DialogueSegment,
    speaker: SpeakerProfile | undefined,
    targetLanguage: string,
    onEnd?: () => void
  ): { cancel: () => void } {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return { cancel: () => {} };
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(segment.translatedText);

    // Language selection
    if (targetLanguage === 'bn') {
      utterance.lang = 'bn-BD';
    } else if (targetLanguage === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (targetLanguage === 'ms') {
      utterance.lang = 'ms-MY';
    } else if (targetLanguage === 'es') {
      utterance.lang = 'es-ES';
    } else if (targetLanguage === 'fr') {
      utterance.lang = 'fr-FR';
    } else if (targetLanguage === 'ar') {
      utterance.lang = 'ar-SA';
    } else {
      utterance.lang = 'en-US';
    }

    // Try finding matching voice by language and gender
    const voices = window.speechSynthesis.getVoices();
    const matchingLangVoices = voices.filter((v) =>
      v.lang.toLowerCase().startsWith(utterance.lang.slice(0, 2).toLowerCase())
    );

    if (matchingLangVoices.length > 0) {
      // If speaker is female vs male
      const targetGender = speaker?.detectedGender || 'female';
      const genderVoice = matchingLangVoices.find((v) => {
        const lowerName = v.name.toLowerCase();
        if (targetGender === 'female') {
          return lowerName.includes('female') || lowerName.includes('woman') || lowerName.includes('kore') || lowerName.includes('zira');
        } else {
          return lowerName.includes('male') || lowerName.includes('man') || lowerName.includes('david') || lowerName.includes('george');
        }
      });
      utterance.voice = genderVoice || matchingLangVoices[0];
    }

    // Voice characteristics tuning
    // Pitch: young female higher, mature male lower
    let pitchVal = 1.0;
    if (speaker) {
      if (speaker.detectedGender === 'female') {
        pitchVal = speaker.approxAge < 30 ? 1.25 : 1.1;
      } else {
        pitchVal = speaker.approxAge > 50 ? 0.8 : speaker.approxAge > 35 ? 0.9 : 1.05;
      }
      if (typeof speaker.pitchAdjustment === 'number') {
        pitchVal += speaker.pitchAdjustment * 0.05;
      } else if (speaker.pitchAdjustment === 'higher') {
        pitchVal += 0.15;
      } else if (speaker.pitchAdjustment === 'lower') {
        pitchVal -= 0.15;
      }
    }
    utterance.pitch = Math.max(0.5, Math.min(2.0, pitchVal));

    // Rate / Speed
    let rateVal = speaker?.speakingSpeed || 1.0;
    if (speaker?.speedAdjustment) rateVal *= speaker.speedAdjustment;
    utterance.rate = Math.max(0.7, Math.min(1.5, rateVal));

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech error:', e);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);

    return {
      cancel: () => {
        window.speechSynthesis.cancel();
      },
    };
  }

  public stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  // Generate SRT Subtitles
  public static generateSRT(segments: DialogueSegment[], language: string): string {
    const formatTime = (seconds: number) => {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      const millis = Math.floor((seconds % 1) * 1000);
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
    };

    return segments
      .map((seg, idx) => {
        return `${idx + 1}\n${formatTime(seg.startTime)} --> ${formatTime(seg.endTime)}\n${seg.translatedText}\n`;
      })
      .join('\n');
  }

  // Generate VTT Subtitles
  public static generateVTT(segments: DialogueSegment[]): string {
    const formatTime = (seconds: number) => {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      const millis = Math.floor((seconds % 1) * 1000);
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
    };

    let vtt = 'WEBVTT\n\n';
    segments.forEach((seg, idx) => {
      vtt += `${idx + 1}\n${formatTime(seg.startTime)} --> ${formatTime(seg.endTime)}\n${seg.translatedText}\n\n`;
    });
    return vtt;
  }
}

export const dubAudioEngine = new DubAudioEngine();

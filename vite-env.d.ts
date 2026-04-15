/// <reference types="vite/client" />

interface StorageInterface {
  get(key: string): Promise<{ value: string } | null>;
  set(key: string, value: string): Promise<void>;
}

declare global {
  interface Window {
    storage: StorageInterface;
    webkitAudioContext: typeof AudioContext;
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }

  // Chrome-only SpeechRecognition API
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
  }
}

export {};

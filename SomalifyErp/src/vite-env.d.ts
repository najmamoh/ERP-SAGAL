/// <reference types="vite/client" />
/// <reference types="vite/client" />

declare module '@vitejs/plugin-basic-ssl' {
    import { Plugin } from 'vite';
    const basicSsl: () => Plugin;
    export default basicSsl;
  }
  


  declare module 'qr-scanner' {
    interface QrScannerOptions {
      returnDetailedScanResult?: boolean;
      onDecodeError?: (error: Error) => void;
    }
    
    export default class QrScanner {
      constructor(
        video: HTMLVideoElement,
        onDecode: (result: { data: string }) => void,
        options?: QrScannerOptions
      );
      start(): Promise<void>;
      stop(): void;
      destroy(): void;
      static hasCamera(): Promise<boolean>;
    }
  }
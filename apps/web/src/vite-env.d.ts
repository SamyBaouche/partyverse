/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_MOCK?: string;
  readonly VITE_PARTY_TRANSPORT?: string;
  /** Injected by vite.config.ts — LAN IPv4 for phone QR codes. */
  readonly VITE_DEV_LAN_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_SECRET_FIREBASE_API_KEY: string
  readonly VITE_SUPABASE_SECRET_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_SUPABASE_SECRET_FIREBASE_PROJECT_ID: string
  readonly VITE_SUPABASE_SECRET_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_SUPABASE_SECRET_FIREBASE_APP_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

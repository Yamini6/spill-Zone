declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_SUPABASE_URL: string;
      EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
      EXPO_PUBLIC_OPENAI_API_KEY: string;
      EXPO_PUBLIC_ELEVENLABS_API_KEY: string;
      EXPO_PUBLIC_TAVUS_API_KEY: string;
      EXPO_PUBLIC_REVENUECAT_PUBLIC_KEY: string;
    }
  }
}

// Ensure this file is treated as a module
export {};
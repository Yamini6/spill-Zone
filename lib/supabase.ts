import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
console.log("supabase:::",supabase)
// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      confessions: {
        Row: {
          id: string;
          content: string;
          tag: string;
          roast: string;
          reactions: {
            laugh: number;
            skull: number;
            shocked: number;
            cry: number;
          };
          poll: {
            you: number;
            them: number;
            both: number;
          };
          user_id?: string;
          created_at: string;
          expires_at?: string;
        };
        Insert: {
          id?: string;
          content: string;
          tag: string;
          roast: string;
          reactions?: {
            laugh: number;
            skull: number;
            shocked: number;
            cry: number;
          };
          poll?: {
            you: number;
            them: number;
            both: number;
          };
          user_id?: string;
          created_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          tag?: string;
          roast?: string;
          reactions?: {
            laugh: number;
            skull: number;
            shocked: number;
            cry: number;
          };
          poll?: {
            you: number;
            them: number;
            both: number;
          };
          user_id?: string;
          created_at?: string;
          expires_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          confession_id: string;
          author: string;
          text: string;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          confession_id: string;
          author?: string;
          text: string;
          created_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          confession_id?: string;
          author?: string;
          text?: string;
          created_at?: string;
          expires_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          room_id: string;
          user_id?: string;
          text: string;
          is_bot: boolean;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          user_id?: string;
          text: string;
          is_bot?: boolean;
          created_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          user_id?: string;
          text?: string;
          is_bot?: boolean;
          created_at?: string;
          expires_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          handle: string;
          is_premium: boolean;
          stats: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          handle: string;
          is_premium?: boolean;
          stats?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          handle?: string;
          is_premium?: boolean;
          stats?: Record<string, any>;
          created_at?: string;
        };
      };
    };
  };
}
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// LocalStorage keys for custom Supabase config
const KEY_URL = 'cricbid_supabase_url';
const KEY_KEY = 'cricbid_supabase_key';

let cachedClient: SupabaseClient | null = null;
let currentConfig = {
  url: '',
  key: ''
};

export function getSupabaseCredentials(): { url: string; key: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = localStorage.getItem(KEY_URL) || '';
  const localKey = localStorage.getItem(KEY_KEY) || '';

  const url = (envUrl || localUrl).trim();
  const key = (envKey || localKey).trim();

  return { url, key };
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key && url.startsWith('http') && key.length > 20);
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();

  if (!url || !key || !url.startsWith('http')) {
    return null;
  }

  if (cachedClient && currentConfig.url === url && currentConfig.key === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
    currentConfig = { url, key };
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function saveCustomSupabaseCredentials(url: string, key: string) {
  localStorage.setItem(KEY_URL, url.trim());
  localStorage.setItem(KEY_KEY, key.trim());
  cachedClient = null; // Reset cached client
}

export function clearCustomSupabaseCredentials() {
  localStorage.removeItem(KEY_URL);
  localStorage.removeItem(KEY_KEY);
  cachedClient = null;
}

/**
 * Test Supabase connection
 */
export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = createClient(url.trim(), key.trim());
    const { error } = await client.from('auctions').select('count', { count: 'exact', head: true });
    
    if (error) {
      // If table doesn't exist, mention schema needs to be run
      if (error.code === '42P01' || error.message.includes('relation "auctions" does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase! However, database tables have not been created yet. Please execute supabase/schema.sql in the Supabase SQL Editor.'
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected to Supabase database!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to connect to Supabase' };
  }
}


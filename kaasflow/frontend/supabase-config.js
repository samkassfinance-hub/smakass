/**
 * Supabase Frontend Configuration
 * Uses public ANON key for client-side operations
 */

// Configuration - using public keys safe for frontend
const SUPABASE_CONFIG = {
  url: 'https://puhovplmbaldrisxqssy.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1aG92cGxtYmFsZHJpc3hxc3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjExNTMsImV4cCI6MjA5NzE5NzE1M30.Py6KprKu6eUxRw1r3P0jPfhNAr8d8PxsgGmUYIel2WA'
};

// Initialize Supabase client (if using supabase-js library)
if (typeof window !== 'undefined' && window.supabase) {
  console.log('✅ Supabase client available');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SUPABASE_CONFIG;
}

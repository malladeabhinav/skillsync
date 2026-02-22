// services/supabaseClient.js
// Creates and exports a single Supabase client instance.
// All database interactions in this project use this client.

const { createClient } = require('@supabase/supabase-js');

// Read Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export so other files can import and use it
module.exports = supabase;

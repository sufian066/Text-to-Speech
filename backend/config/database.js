const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');

let supabaseClient = null;

const connectDB = async () => {
  const dbType = process.env.DATABASE_TYPE || 'mongodb';

  try {
    if (dbType === 'mongodb') {
      // MongoDB Connection
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB Connected Successfully');
    } else if (dbType === 'supabase') {
      // Supabase Connection
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
        throw new Error('Supabase credentials not found in environment variables');
      }
      
      supabaseClient = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY
      );
      
      // Test connection
      const { data, error } = await supabaseClient.from('speeches').select('count');
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      console.log('✅ Supabase Connected Successfully');
    } else {
      console.warn('⚠️  No database configured');
    }
  } catch (error) {
    console.error('❌ Database Connection Error:', error.message);
    process.exit(1);
  }
};

const getSupabaseClient = () => {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized');
  }
  return supabaseClient;
};

module.exports = connectDB;
module.exports.getSupabaseClient = getSupabaseClient;

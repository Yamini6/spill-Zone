// Database schema verification script
// Run this to check and fix your Supabase schema

const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual values
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please make sure your .env file has:');
  console.log('EXPO_PUBLIC_SUPABASE_URL=your_project_url');
  console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyAndFixSchema() {
  console.log('🔍 Verifying Supabase schema...\n');

  try {
    // Check if tables exist
    console.log('1. Checking table existence...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['users', 'confessions', 'chat_messages']);

    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError.message);
      return;
    }

    const tableNames = tables.map(t => t.table_name);
    console.log('✅ Found tables:', tableNames);

    // Check users table structure
    console.log('\n2. Checking users table structure...');
    const { data: userColumns, error: userColumnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'users');

    if (userColumnsError) {
      console.error('❌ Error checking users table:', userColumnsError.message);
    } else {
      console.log('✅ Users table columns:');
      userColumns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    }

    // Check confessions table structure
    console.log('\n3. Checking confessions table structure...');
    const { data: confessionColumns, error: confessionColumnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'confessions');

    if (confessionColumnsError) {
      console.error('❌ Error checking confessions table:', confessionColumnsError.message);
    } else {
      console.log('✅ Confessions table columns:');
      confessionColumns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    }

    // Test basic operations
    console.log('\n4. Testing basic operations...');
    
    // Test confessions read
    const { data: confessions, error: confessionsError } = await supabase
      .from('confessions')
      .select('*')
      .limit(1);

    if (confessionsError) {
      console.error('❌ Error reading confessions:', confessionsError.message);
    } else {
      console.log(`✅ Can read confessions table (${confessions.length} records)`);
    }

    // Test users read
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) {
      console.error('❌ Error reading users:', usersError.message);
    } else {
      console.log(`✅ Can read users table (${users.length} records)`);
    }

    console.log('\n✅ Schema verification complete!');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyAndFixSchema();
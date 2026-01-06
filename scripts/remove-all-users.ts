import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as readline from 'readline';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

// Create Supabase client with service role (admin privileges)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function removeAllUsers() {
  console.log('🗑️  Starting removal of all users and their data...\n');

  try {
    // Step 1: Delete all user-related data
    console.log('📊 Deleting user data from application tables...');

    const tables = ['debts', 'goals', 'investments', 'budgets', 'transactions', 'categories', 'profiles'];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) {
        console.error(`   ❌ Error deleting from ${table}:`, error.message);
      } else {
        console.log(`   ✅ Deleted all records from ${table}`);
      }
    }

    // Step 2: Get all users from auth
    console.log('\n👥 Fetching all users from Supabase Auth...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      process.exit(1);
    }

    if (!users || users.length === 0) {
      console.log('✅ No users found in the system');
      return;
    }

    console.log(`   Found ${users.length} user(s)\n`);

    // Step 3: Delete each user
    console.log('🗑️  Deleting users from Supabase Auth...');
    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      const { error } = await supabase.auth.admin.deleteUser(user.id);

      if (error) {
        console.error(`   ❌ Error deleting user ${user.email || user.id}:`, error.message);
        errorCount++;
      } else {
        console.log(`   ✅ Deleted user: ${user.email || user.id}`);
        successCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📋 Summary:');
    console.log(`   ✅ Successfully deleted: ${successCount} user(s)`);
    if (errorCount > 0) {
      console.log(`   ❌ Failed to delete: ${errorCount} user(s)`);
    }
    console.log('   ✅ All user data removed from application tables');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Confirm before executing
console.log('⚠️  WARNING: This will permanently delete ALL users and their data!');
console.log('⚠️  This action CANNOT be undone!\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Are you sure you want to continue? (yes/no): ', (answer: string) => {
  rl.close();

  if (answer.toLowerCase() === 'yes') {
    removeAllUsers();
  } else {
    console.log('❌ Operation cancelled');
    process.exit(0);
  }
});

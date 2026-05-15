/**
 * Create the first admin user in Supabase.
 * Usage: node scripts/seed-admin.mjs admin@colourland.com YourSecurePassword
 */
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node scripts/seed-admin.mjs <email> <password>');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);
const password_hash = await bcrypt.hash(password, 10);

const { data, error } = await supabase
  .from('admin_users')
  .upsert({ email, password_hash }, { onConflict: 'email' })
  .select()
  .single();

if (error) {
  console.error('Failed to seed admin:', error.message);
  process.exit(1);
}

console.log('Admin user ready:', data.email);

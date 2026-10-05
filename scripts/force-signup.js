const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with the SERVICE ROLE KEY
// This allows us to bypass Rate Limits and Email Confirmations entirely!
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function forceCreateUser() {
  const emailToCreate = 'xyz@gmail.com'; // <--- Change this if needed
  const passwordToCreate = 'password123'; // <--- Change this if needed

  console.log(`Attempting to force-create user: ${emailToCreate}`);

  const { data, error } = await supabase.auth.admin.createUser({
    email: emailToCreate,
    password: passwordToCreate,
    email_confirm: true // This skips the confirmation email!
  });

  if (error) {
    if (error.message.includes('already registered')) {
       console.log('User already exists! You can just login with their existing password.');
       
       // Optional: Force update their password if you forgot it
       console.log('Updating their password just in case...');
       const { data: users } = await supabase.auth.admin.listUsers();
       const existingUser = users.users.find(u => u.email === emailToCreate);
       
       if (existingUser) {
         await supabase.auth.admin.updateUserById(existingUser.id, { password: passwordToCreate });
         console.log('Password successfully reset to:', passwordToCreate);
       }
    } else {
       console.error('Error creating user:', error);
    }
  } else {
    console.log('Success! User forcefully created bypassing all rate limits.');
    console.log('ID:', data.user.id);
  }
}

forceCreateUser();

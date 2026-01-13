# Password Storage in Supabase

## Where Passwords Are Stored

**Important:** Passwords are **NOT** stored in the `public.users` table. They are stored in Supabase's `auth.users` table, which is in the `auth` schema (not accessible via your public API).

### Database Structure

1. **`auth.users`** (Supabase Auth schema - not directly accessible)
   - Stores: passwords (hashed), email, user metadata
   - Managed by: Supabase Auth
   - Access: Only via Supabase Auth API

2. **`public.users`** (Your custom table)
   - Stores: `id` (references `auth.users.id`), `email`, `created_at`
   - Purpose: Additional user metadata for your application
   - Access: Via your API with RLS policies

### Why This Design?

- **Security**: Passwords are stored in a separate, protected schema
- **Separation of Concerns**: Auth data vs. application data
- **RLS**: Your `public.users` table can have different RLS policies than auth data

## How Sign-In Works

1. User enters email/password
2. Frontend calls `supabase.auth.signInWithPassword()`
3. Supabase checks credentials against `auth.users` table
4. If valid, Supabase creates a JWT session
5. Session is stored in browser (localStorage/cookies)
6. User is authenticated

## Common Sign-In Issues

### "Invalid login credentials"
- **Cause**: Wrong email or password
- **Solution**: Verify credentials, check for typos
- **Note**: Passwords are case-sensitive

### "Email not confirmed"
- **Cause**: User signed up but didn't confirm email
- **Solution**: Check email for confirmation link, or resend confirmation email

### User exists in `public.users` but can't sign in
- **Cause**: User record exists but password might be wrong, or email not confirmed
- **Solution**: 
  1. Verify the user exists in `auth.users` (check Supabase Auth dashboard)
  2. Check if email is confirmed
  3. Try resetting password if needed

## Checking User Status

### In Supabase Dashboard:
1. Go to **Authentication** → **Users**
2. Find the user by email
3. Check:
   - ✅ **Email confirmed**: Should be checked
   - ✅ **User ID**: Should match the ID in `public.users`
   - ✅ **Created at**: Should match signup time

### In Database:
```sql
-- Check if user exists in auth.users (requires service role)
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'user@example.com';

-- Check if user exists in public.users
SELECT id, email, created_at 
FROM public.users 
WHERE email = 'user@example.com';
```

## Troubleshooting Sign-In

1. **Verify user exists in auth.users**:
   - Go to Supabase Dashboard → Authentication → Users
   - If user doesn't exist, they need to sign up again

2. **Check email confirmation**:
   - If email confirmations are enabled, user must confirm before signing in
   - Check `email_confirmed_at` in auth.users

3. **Verify password**:
   - Passwords are hashed and cannot be viewed
   - If password is forgotten, use password reset flow

4. **Check for errors**:
   - Open browser console
   - Look for Supabase auth errors
   - Check network tab for failed requests

5. **Test with Supabase Dashboard**:
   - Try signing in via Supabase Dashboard → Authentication → Users → Impersonate
   - This helps verify if the issue is with credentials or the app

## Password Reset Flow (Future)

When implementing password reset:
1. User requests reset → `supabase.auth.resetPasswordForEmail()`
2. Supabase sends reset email
3. User clicks link → redirected to reset page
4. User sets new password → `supabase.auth.updateUser()`
5. Password is updated in `auth.users` (not `public.users`)

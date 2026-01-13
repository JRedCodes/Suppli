# Troubleshooting Sign-In Issues

## Password Column Not Visible

**This is normal!** Supabase doesn't show passwords in the dashboard for security reasons. Passwords are:
- Stored as **hashed values** in the database
- Never displayed in plain text
- Not accessible via the Supabase dashboard UI

## Common Sign-In Issues

### 1. Email Not Confirmed

**Symptom:** Sign-in fails with "Email not confirmed" or "Invalid login credentials"

**Solution:**
1. Check your email inbox for the confirmation link
2. Click the confirmation link in the email
3. You'll be redirected to `/auth/callback` and automatically signed in
4. After confirmation, you can sign in normally

**Check in Supabase:**
- Go to **Authentication** → **Users**
- Find your user
- Look for **"Email confirmed"** status
- If not confirmed, you'll see "Unconfirmed" or similar

### 2. Wrong Password

**Symptom:** "Invalid login credentials" error

**Things to check:**
- Passwords are **case-sensitive**
- Check for typos or extra spaces
- Make sure you're using the password you set during signup

**Solution:**
- If you forgot your password, you'll need to implement a password reset flow (future feature)
- For now, you can delete the user in Supabase and sign up again

### 3. User Doesn't Exist in auth.users

**Symptom:** "Invalid login credentials" even though you signed up

**Check:**
1. Go to **Authentication** → **Users** in Supabase
2. Search for your email
3. If user doesn't exist, the signup might have failed

**Solution:**
- Sign up again
- Make sure email confirmation email was sent
- Check Supabase logs for errors

### 4. Email Confirmation Required

**Symptom:** Can sign up but can't sign in

**Check Supabase Settings:**
1. Go to **Authentication** → **Settings**
2. Check **"Enable email confirmations"**
3. If enabled, users MUST confirm email before signing in

**Solution:**
- Confirm your email via the link sent
- Or disable email confirmations for development (not recommended for production)

## Testing Sign-In

### Step-by-Step Test:

1. **Sign Up:**
   - Use a new email address
   - Set a password (at least 6 characters)
   - Note the password you use!

2. **Check Email:**
   - Look for confirmation email from Supabase
   - Click the confirmation link

3. **Verify in Supabase:**
   - Go to **Authentication** → **Users**
   - Find your user
   - Check:
     - ✅ Email is listed
     - ✅ "Email confirmed" is checked (if confirmations enabled)
     - ✅ "Created at" timestamp is recent

4. **Sign In:**
   - Use the **exact same email** you signed up with
   - Use the **exact same password** (case-sensitive!)
   - Should work now

## Debugging Tips

### Check Browser Console:
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try signing in
4. Look for any error messages

### Check Network Tab:
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try signing in
4. Look for the request to Supabase
5. Check the response for error details

### Check Supabase Logs:
1. Go to **Supabase Dashboard**
2. Navigate to **Logs** → **Auth Logs**
3. Look for sign-in attempts
4. Check for any errors

## Quick Fixes

### If Sign-In Still Doesn't Work:

1. **Delete and Recreate User:**
   - Go to **Authentication** → **Users**
   - Delete the user
   - Sign up again with the same email
   - Confirm email
   - Try signing in

2. **Disable Email Confirmations (Development Only):**
   - Go to **Authentication** → **Settings**
   - Uncheck **"Enable email confirmations"**
   - ⚠️ **Warning:** Only for development/testing!

3. **Check Password:**
   - Make sure you're typing the password correctly
   - Try copying/pasting the password to avoid typos
   - Check for caps lock

## Expected Behavior

### After Successful Sign-In:
- You should be redirected to the home page (`/`)
- The `ProtectedRoute` should allow access
- Your session should be active
- You should see your user info in the app

### If Redirect Doesn't Happen:
- Check browser console for errors
- Verify `ProtectedRoute` is working
- Check that session is being set correctly

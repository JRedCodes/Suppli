# Email Confirmation Setup

## Problem
Email confirmations aren't working after user signup.

## Solution

### 1. Enable Email Confirmations in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Under **Email Auth**, ensure:
   - ✅ **Enable email confirmations** is checked
   - ✅ **Secure email change** is checked (optional but recommended)

### 2. Configure Redirect URLs

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Add your redirect URLs to the **Redirect URLs** list:
   - `http://localhost:5173/auth/callback` (for local development)
   - `https://yourdomain.com/auth/callback` (for production)

**Important:** The redirect URL must match exactly what you use in `emailRedirectTo` in the signup function.

### 3. Check Email Templates

1. Go to **Authentication** → **Email Templates**
2. Verify the **Confirm signup** template is enabled
3. The template should include a link like:
   ```
   {{ .ConfirmationURL }}
   ```

### 4. Test Email Delivery

If emails aren't being sent:

1. Check **Authentication** → **Logs** for email sending errors
2. For development, you can use Supabase's built-in email testing
3. For production, configure SMTP settings in **Project Settings** → **Auth** → **SMTP Settings**

### 5. Development vs Production

**Development:**
- Supabase provides a magic link that works without SMTP
- Check the Supabase logs for the confirmation link if emails aren't arriving
- You can also use the Supabase CLI to view emails locally

**Production:**
- You must configure SMTP settings
- Or use Supabase's email service (may have rate limits)
- Ensure your domain is verified

## How It Works

1. User signs up → `signUp()` is called
2. Supabase sends confirmation email with link
3. User clicks link → redirected to `/auth/callback`
4. `AuthCallbackPage` handles the callback and extracts the session
5. User is automatically signed in and redirected to home

## Troubleshooting

### Emails not sending
- Check Supabase logs for errors
- Verify SMTP settings (if configured)
- Check spam folder
- For development, check Supabase dashboard logs for the confirmation link

### Redirect not working
- Verify redirect URL is whitelisted in Supabase
- Check that the URL matches exactly (including protocol and port)
- Ensure the route `/auth/callback` exists in your app

### User not signed in after confirmation
- Check browser console for errors
- Verify the session is being set correctly
- Check that `onAuthStateChange` is handling the `SIGNED_IN` event

## Testing

1. Sign up with a new email
2. Check your email (or Supabase logs for development)
3. Click the confirmation link
4. You should be redirected to `/auth/callback` and then to the home page
5. You should be automatically signed in

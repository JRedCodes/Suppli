# Phase 4.1 — Environment Variables Setup Guide

## Overview

This guide will help you set up all required environment variables for Suppli. You'll need to provide:
- ✅ Supabase credentials (already have from Phase 2.1)
- ⚠️ Stripe credentials (need to get)

---

## Step 1: Verify Supabase Credentials

You should already have these from Phase 2.1. If not, see `docs/SUPABASE_SETUP.md`.

**Backend (`server/.env.local`):**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (from Supabase Dashboard → Settings → API)

**Frontend (`frontend/.env.local`):**
- `VITE_SUPABASE_URL` - Same as backend SUPABASE_URL
- `VITE_SUPABASE_ANON_KEY` - Anon/public key (from Supabase Dashboard → Settings → API)

---

## Step 2: Get Stripe Credentials

### Option A: Stripe Dashboard (Recommended for Production)

1. **Go to Stripe Dashboard**
   - Visit https://stripe.com
   - Create account or log in
   - Make sure you're in **Test mode** (toggle in top right)

2. **Get Secret Key**
   - Go to **Developers → API keys**
   - Copy the **Secret key** (starts with `sk_test_...`)
   - This is your `STRIPE_SECRET_KEY`

3. **Set Up Webhook (for local development)**
   - Go to **Developers → Webhooks**
   - Click **Add endpoint**
   - For local development, you'll use Stripe CLI (see Option B)
   - For production: `https://your-api.com/api/v1/webhooks/stripe`
   - Select events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the **Signing secret** (starts with `whsec_...`)
   - This is your `STRIPE_WEBHOOK_SECRET`

### Option B: Stripe CLI (Recommended for Local Development)

For local development, Stripe CLI is easier than setting up webhooks in the dashboard:

1. **Install Stripe CLI**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe**
   ```bash
   stripe login
   ```

3. **Forward Webhooks to Local Server**
   ```bash
   stripe listen --forward-to localhost:3001/api/v1/webhooks/stripe
   ```

4. **Copy Webhook Secret**
   - The CLI will show a webhook signing secret (starts with `whsec_...`)
   - Copy this value
   - This is your `STRIPE_WEBHOOK_SECRET` for local development

5. **Get Secret Key**
   - Still need to get this from Stripe Dashboard → Developers → API keys
   - Copy the **Secret key** (starts with `sk_test_...`)

---

## Step 3: Create `.env.local` Files

### Backend

1. **Copy the example file:**
   ```bash
   cd server
   cp .env.example .env.local
   ```

2. **Edit `server/.env.local` and fill in:**
   ```env
   # Supabase Configuration
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

   # Server Configuration
   NODE_ENV=development
   PORT=3001
   ```

### Frontend

1. **Copy the example file:**
   ```bash
   cd frontend
   cp .env.example .env.local
   ```

2. **Edit `frontend/.env.local` and fill in:**
   ```env
   # API Configuration
   VITE_API_URL=http://localhost:3001

   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

---

## Step 4: Validate Environment Variables

### Backend Validation

Run the validation script:

```bash
cd server
npm run validate-env
```

You should see:
```
✅ All required environment variables are set correctly!
```

If you see errors, check:
- File is named `.env.local` (not `.env`)
- File is in the correct directory (`server/` or `frontend/`)
- All values are filled in (no `your_...` placeholders)

### Frontend Validation

Start the dev server:

```bash
cd frontend
npm run dev
```

If environment variables are missing, you'll see an error in the console. The app should start without errors if everything is configured correctly.

---

## Step 5: Test Environment Loading

### Backend Test

```bash
cd server
npm run dev
```

You should see:
```
🚀 Suppli API server running on port 3001
📦 Environment: development
🔗 Health check: http://localhost:3001/health
```

### Frontend Test

```bash
cd frontend
npm run dev
```

The app should start on `http://localhost:5173` without errors.

---

## Troubleshooting

### "Environment variable not found"
- ✅ Check file name: `.env.local` (not `.env`)
- ✅ Check file location: In `server/` or `frontend/` directory
- ✅ Restart dev server after adding variables

### "Invalid Supabase URL"
- ✅ Ensure URL includes `https://`
- ✅ No trailing slash
- ✅ Correct project ID

### "Stripe webhook not working"
- ✅ Verify webhook secret matches
- ✅ For local: Use Stripe CLI (`stripe listen`)
- ✅ For production: Check endpoint URL in Stripe dashboard
- ✅ Ensure endpoint is publicly accessible (for production)

### Validation script shows errors
- ✅ Make sure `.env.local` exists (copy from `.env.example`)
- ✅ Fill in all values (no placeholders)
- ✅ Check for typos in variable names
- ✅ Restart terminal/IDE after creating `.env.local`

---

## Security Reminders

⚠️ **Never commit `.env.local` files**
- They are in `.gitignore`
- Only commit `.env.example` files (no real values)

⚠️ **Keep keys secret**
- Don't share `.env.local` files
- Use different keys for development and production
- Rotate keys if exposed

---

## Next Steps

Once environment variables are validated:
1. ✅ All variables set and validated
2. ✅ Backend and frontend start without errors
3. ➡️ Proceed to Phase 4.2: Stripe Integration

---

## Quick Reference

**Backend Required Variables:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

**Frontend Required Variables:**
- `VITE_API_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

For detailed information, see `docs/ENVIRONMENT_VARIABLES.md`.

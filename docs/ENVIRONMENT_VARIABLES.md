# Suppli — Environment Variables Guide

## Overview
This document describes all environment variables required for Suppli development and production.

## Backend Environment Variables

### Required Variables

#### Supabase Configuration
- **`SUPABASE_URL`**
  - Description: Your Supabase project URL
  - Example: `https://xxxxx.supabase.co`
  - Where to get: Supabase Dashboard → Settings → API → Project URL
  - Required: Yes

- **`SUPABASE_SERVICE_ROLE_KEY`**
  - Description: Supabase service role key (server-side only, never expose to client)
  - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - Where to get: Supabase Dashboard → Settings → API → Service Role Key
  - Required: Yes
  - Security: Keep secret, never commit

#### Stripe Configuration
- **`STRIPE_SECRET_KEY`**
  - Description: Stripe secret key for API operations
  - Example: `sk_test_xxxxx` or `sk_live_xxxxx`
  - Where to get: Stripe Dashboard → Developers → API keys → Secret key
  - Required: Yes (for payments feature)
  - Security: Keep secret, never commit

- **`STRIPE_WEBHOOK_SECRET`**
  - Description: Stripe webhook signing secret
  - Example: `whsec_xxxxx`
  - Where to get: Stripe Dashboard → Developers → Webhooks → Add endpoint → Copy signing secret
  - Required: Yes (for payments feature)
  - Security: Keep secret, never commit

#### Server Configuration
- **`NODE_ENV`**
  - Description: Node.js environment
  - Values: `development`, `production`, `test`
  - Default: `development`
  - Required: No

- **`PORT`**
  - Description: Server port
  - Default: `3001`
  - Required: No

### Optional Variables

- **`API_BASE_URL`**: Base URL for API (default: `http://localhost:3001`)
- **`CORS_ORIGIN`**: Allowed CORS origin (default: `http://localhost:5173`)
- **`RATE_LIMIT_WINDOW_MS`**: Rate limit window in milliseconds (default: `900000` = 15 minutes)
- **`RATE_LIMIT_MAX_REQUESTS`**: Max requests per window (default: `100`)
- **`LOG_LEVEL`**: Logging level (default: `info`)

---

## Frontend Environment Variables

### Required Variables

#### API Configuration
- **`VITE_API_URL`**
  - Description: Backend API URL
  - Example: `http://localhost:3001` (development) or `https://api.suppli.app` (production)
  - Required: Yes

#### Supabase Configuration
- **`VITE_SUPABASE_URL`**
  - Description: Your Supabase project URL
  - Example: `https://xxxxx.supabase.co`
  - Where to get: Supabase Dashboard → Settings → API → Project URL
  - Required: Yes

- **`VITE_SUPABASE_ANON_KEY`**
  - Description: Supabase anonymous/public key (safe for client-side)
  - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - Where to get: Supabase Dashboard → Settings → API → Anon/Public Key
  - Required: Yes

### Optional Variables

- **`VITE_NODE_ENV`**: Environment (default: `development`)

---

## Setup Instructions

### Development Setup

1. **Copy example files:**
   ```bash
   # Backend
   cp server/.env.example server/.env.local
   
   # Frontend
   cp frontend/.env.example frontend/.env.local
   ```

2. **Fill in values:**
   - Open `server/.env.local` and fill in Supabase and Stripe values
   - Open `frontend/.env.local` and fill in Supabase values

3. **Never commit `.env.local` files:**
   - They are in `.gitignore`
   - Only commit `.env.example` files

### Production Setup

1. Set environment variables in your hosting platform:
   - Vercel (frontend): Project Settings → Environment Variables
   - Railway/Render (backend): Environment Variables section

2. Use production values:
   - Production Supabase project
   - Production Stripe keys (`sk_live_...`)
   - Production API URLs

---

## Security Notes

### Never Commit
- `.env` files
- `.env.local` files
- Any file containing secrets

### Safe to Commit
- `.env.example` files (no real values)
- Documentation (this file)

### Key Management
- Use different keys for development and production
- Rotate keys if exposed
- Use service role key only on backend
- Never expose service role key to frontend

---

## Getting Keys

### Supabase Keys
1. Go to https://supabase.com
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL → `SUPABASE_URL` / `VITE_SUPABASE_URL`
   - Anon/Public Key → `VITE_SUPABASE_ANON_KEY` (frontend)
   - Service Role Key → `SUPABASE_SERVICE_ROLE_KEY` (backend only)

### Stripe Keys
1. Go to https://stripe.com
2. Log in to Dashboard
3. Go to Developers → API keys
4. Copy:
   - Secret key → `STRIPE_SECRET_KEY`
5. Go to Developers → Webhooks
6. Add endpoint: `https://your-api.com/api/v1/webhooks/stripe`
7. Copy:
   - Signing secret → `STRIPE_WEBHOOK_SECRET`

---

## Troubleshooting

### "Environment variable not found"
- Check file name: `.env.local` (not `.env`)
- Check file location: In `server/` or `frontend/` directory
- Restart dev server after adding variables

### "Invalid Supabase URL"
- Ensure URL includes `https://`
- No trailing slash
- Correct project ID

### "Stripe webhook not working"
- Verify webhook secret matches
- Check endpoint URL in Stripe dashboard
- Ensure endpoint is publicly accessible (for production)

---

## Next Steps

Once environment variables are set up:
1. Proceed to Phase 1: Project Scaffolding
2. See `IMPLEMENTATION_GUIDE.md` for detailed setup instructions

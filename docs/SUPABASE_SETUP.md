# Suppli — Supabase Setup Guide

## Overview
This document provides instructions for setting up and configuring Supabase for the Suppli project.

## Prerequisites
- Supabase account (sign up at https://supabase.com)
- Access to Supabase dashboard

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in project details:
   - **Name**: `suppli` (or your preferred name)
   - **Database Password**: Create a strong password (save this securely)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development
4. Click "Create new project"
5. Wait for project to be provisioned (2-3 minutes)

## Step 2: Get Project Credentials

Once your project is ready:

1. Go to **Settings** → **API**
2. You'll need these values:

### Project URL
- Found under "Project URL"
- Example: `https://xxxxx.supabase.co`
- This is your `SUPABASE_URL`

### API Keys

#### Anon/Public Key
- Found under "Project API keys" → "anon" `public`
- Safe to use in frontend/client-side code
- This is your `VITE_SUPABASE_ANON_KEY`

#### Service Role Key
- Found under "Project API keys" → "service_role" `secret`
- **⚠️ NEVER expose this to the frontend**
- Only use in backend/server-side code
- This is your `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: Configure Environment Variables

### Backend (`server/.env.local`)
```env
SUPABASE_URL=your_project_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Frontend (`frontend/.env.local`)
```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Test Connection

### Backend Test
```bash
cd server
npm run dev
# Server should start without errors
```

### Frontend Test
```bash
cd frontend
npm run dev
# App should load without errors
```

## Step 5: Database Setup

After setting up credentials, proceed to:
- Phase 2.2: Database Schema Implementation
- Phase 2.3: Row Level Security (RLS) Policies

## Security Notes

### ⚠️ Important
- **Never commit** `.env.local` files
- **Never expose** Service Role Key to frontend
- **Never share** credentials in public repositories
- **Rotate keys** if accidentally exposed

### Key Usage
- **Anon Key**: Frontend only, has RLS restrictions
- **Service Role Key**: Backend only, bypasses RLS (use carefully)

## Troubleshooting

### Connection Errors
- Verify project URL is correct (includes `https://`)
- Check that project is not paused (free tier pauses after inactivity)
- Ensure API keys are copied correctly (no extra spaces)

### Project Paused
If your project is paused (free tier):
1. Go to Supabase dashboard
2. Click "Restore" to reactivate
3. Wait a few minutes for restoration

## Next Steps

Once Supabase is set up:
1. ✅ Credentials added to `.env.local` files
2. ✅ Connection tested
3. → Proceed to Phase 2.2: Database Schema Implementation

## Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Dashboard](https://app.supabase.com)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

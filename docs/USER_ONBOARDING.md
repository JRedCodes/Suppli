# User Onboarding & Initialization

## Problem
After signing up via Supabase Auth, the custom database tables (`users`, `businesses`, `business_users`) were not being populated automatically.

## Solution

### 1. Database Trigger (Automatic)
A database trigger automatically creates a record in the `users` table when a new user signs up in Supabase Auth.

**Migration:** `014_user_sync_trigger.sql`

**To apply:**
```bash
# Run the migration in your Supabase SQL editor or via CLI
psql $DATABASE_URL -f server/migrations/014_user_sync_trigger.sql
```

### 2. User Initialization API (Manual)
After signup, users need to initialize their account by creating a business. This is done via the `/api/v1/onboarding/initialize` endpoint.

**Endpoint:** `POST /api/v1/onboarding/initialize`

**Request:**
```json
{
  "businessName": "My Business",
  "businessType": "grocery", // optional
  "timezone": "America/New_York", // optional, defaults to UTC
  "currency": "USD" // optional, defaults to USD
}
```

**Response:**
```json
{
  "data": {
    "businessId": "uuid",
    "businessName": "My Business",
    "userId": "uuid",
    "role": "owner"
  }
}
```

### 3. Frontend Integration

After successful signup, the frontend should:
1. Check if the user has any businesses (call `GET /api/v1/onboarding/businesses`)
2. If no businesses exist, prompt the user to initialize their account
3. Call `POST /api/v1/onboarding/initialize` with business details
4. Update the BusinessContext with the new business

## Next Steps

The frontend needs to be updated to:
- Check for businesses after login
- Show an onboarding flow for new users
- Call the initialization endpoint when needed

This will be implemented in a future phase.

## Testing

1. **Run the migration:**
   ```sql
   -- In Supabase SQL Editor
   -- Run the contents of server/migrations/014_user_sync_trigger.sql
   ```

2. **Test the trigger:**
   - Sign up a new user via Supabase Auth
   - Check that a record appears in the `users` table automatically

3. **Test initialization:**
   ```bash
   curl -X POST http://localhost:3001/api/v1/onboarding/initialize \
     -H "Authorization: Bearer <jwt_token>" \
     -H "Content-Type: application/json" \
     -d '{
       "businessName": "Test Business"
     }'
   ```

4. **Verify tables:**
   - `users` table should have the user record
   - `businesses` table should have the new business
   - `business_users` table should have the membership with role 'owner'

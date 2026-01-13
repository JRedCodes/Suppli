/**
 * Onboarding service - Initialize new users and businesses
 */

import { supabaseAdmin } from '../lib/supabase';
import { ConflictError } from '../errors';

export interface InitializeUserRequest {
  businessName: string;
  businessType?: string;
  timezone?: string;
  currency?: string;
}

export interface InitializeUserResponse {
  businessId: string;
  businessName: string;
  userId: string;
  role: 'owner';
}

/**
 * Initialize a new user by creating their business and membership
 * This should be called after a user signs up for the first time
 */
export async function initializeUser(
  userId: string,
  userEmail: string,
  data: InitializeUserRequest
): Promise<InitializeUserResponse> {
  // Check if user already exists in users table (should be created by trigger)
  const { data: existingUser, error: userError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (userError && userError.code !== 'PGRST116') {
    // PGRST116 is "not found" - that's okay, we'll create it
    throw new Error(`Failed to check user: ${userError.message}`);
  }

  // Create user record if it doesn't exist (fallback if trigger didn't fire)
  if (!existingUser) {
    const { error: createUserError } = await supabaseAdmin.from('users').insert({
      id: userId,
      email: userEmail,
    });

    if (createUserError) {
      throw new Error(`Failed to create user: ${createUserError.message}`);
    }
  }

  // Check if user already has a business
  const { data: existingMembership } = await supabaseAdmin
    .from('business_users')
    .select('business_id')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (existingMembership) {
    throw new ConflictError('User already has a business');
  }

  // Create business
  const { data: business, error: businessError } = await supabaseAdmin
    .from('businesses')
    .insert({
      name: data.businessName,
      business_type: data.businessType || null,
      timezone: data.timezone || 'UTC',
      currency: data.currency || 'USD',
    })
    .select('id, name')
    .single();

  if (businessError || !business) {
    throw new Error(`Failed to create business: ${businessError?.message}`);
  }

  // Create business_users membership with owner role
  const { error: membershipError } = await supabaseAdmin.from('business_users').insert({
    business_id: business.id,
    user_id: userId,
    role: 'owner',
  });

  if (membershipError) {
    // Clean up business if membership creation fails
    await supabaseAdmin.from('businesses').delete().eq('id', business.id);
    throw new Error(`Failed to create membership: ${membershipError.message}`);
  }

  return {
    businessId: business.id,
    businessName: business.name,
    userId,
    role: 'owner',
  };
}

/**
 * Get user's businesses
 */
export async function getUserBusinesses(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('business_users')
    .select(
      `
      business_id,
      role,
      businesses!inner (
        id,
        name,
        business_type,
        timezone,
        currency,
        created_at
      )
    `
    )
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to get user businesses: ${error.message}`);
  }

  return (
    data?.map((membership) => ({
      id: (membership.businesses as any).id,
      name: (membership.businesses as any).name,
      businessType: (membership.businesses as any).business_type,
      timezone: (membership.businesses as any).timezone,
      currency: (membership.businesses as any).currency,
      createdAt: (membership.businesses as any).created_at,
      role: membership.role,
    })) || []
  );
}

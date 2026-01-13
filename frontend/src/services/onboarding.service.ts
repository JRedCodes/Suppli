/**
 * Onboarding service - API calls for user initialization
 */

import { apiPost, apiGet, RequestOptions } from '../lib/api-client';

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

export interface Business {
  id: string;
  name: string;
  businessType?: string;
  timezone: string;
  currency: string;
  createdAt: string;
  role: 'owner' | 'manager' | 'staff';
}

export const onboardingService = {
  /**
   * Initialize a new user (create business and membership)
   */
  initialize: async (
    data: InitializeUserRequest,
    options: RequestOptions
  ): Promise<InitializeUserResponse> => {
    return apiPost<InitializeUserResponse>('/onboarding/initialize', data, options);
  },

  /**
   * Get user's businesses
   */
  getBusinesses: async (options: RequestOptions): Promise<Business[]> => {
    return apiGet<Business[]>('/onboarding/businesses', options);
  },
};

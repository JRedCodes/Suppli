/**
 * Vendor type definitions
 */

export interface Vendor {
  id: string;
  business_id: string;
  name: string;
  ordering_method: 'email' | 'phone' | 'portal' | 'in_person';
  contact_email?: string | null;
  contact_phone?: string | null;
  notes?: string | null;
  created_at: string;
  archived_at?: string | null;
}

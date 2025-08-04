// Tipos base reutilizables
type UserType = 'client' | 'provider';
type MembershipType = 'basic' | 'gold' | 'platinum' | 'diamond';
type MembershipStatus = 'active' | 'cancelled' | 'expired' | 'past_due';
type MatchStatus = 'pending' | 'accepted' | 'rejected' | 'completed';
type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

// Interfaces principales
export interface Profile {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  user_type: UserType;
  phone_number?: string | null;
  date_of_birth?: string | null;
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
}

export interface ProviderProfile extends Profile {
  business_name?: string | null;
  description?: string | null;
  services: string[]; // Considerar usar un tipo específico para servicios
  hourly_rate: number;
  location?: string | null;
  membership_type: MembershipType;
  portfolio_images: string[];
  rating: number;
  total_reviews: number;
  is_active: boolean;
  verification_status: 'unverified' | 'pending' | 'verified';
  languages?: string[];
  availability?: {
    monday: boolean;
    tuesday: boolean;
    // ... otros días
  };
  social_media?: {
    instagram?: string;
    twitter?: string;
    // ... otras redes
  };
}

export interface Match {
  id: string;
  client_id: string;
  provider_id: string;
  status: MatchStatus;
  service_type?: string;
  proposed_date?: string | null;
  client_message?: string | null;
  created_at: string;
  updated_at: string;
  client?: Profile;
  provider?: ProviderProfile;
}

export interface Conversation {
  id: string;
  match_id: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  match?: Match;
  participants?: Profile[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender?: Profile;
  attachments?: {
    type: 'image' | 'video' | 'document';
    url: string;
    thumbnail?: string;
  }[];
}

export interface Booking {
  id: string;
  client_id: string;
  provider_id: string;
  match_id?: string;
  service_description: string;
  scheduled_date: string;
  duration_hours: number;
  total_amount: number;
  commission_amount: number;
  status: BookingStatus;
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded';
  cancellation_reason?: string;
  client_notes?: string;
  provider_notes?: string;
  created_at: string;
  updated_at: string;
  client?: Profile;
  provider?: ProviderProfile;
}

export interface Review {
  id: string;
  booking_id: string;
  client_id: string;
  provider_id: string;
  rating: number; // 1-5
  comment?: string | null;
  anonymous: boolean;
  response?: string | null;
  created_at: string;
  updated_at: string;
  client?: Profile;
  provider?: ProviderProfile;
}

export interface Membership {
  id: string;
  provider_id: string;
  membership_type: MembershipType;
  stripe_subscription_id?: string | null;
  status: MembershipStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  features: string[]; // Lista de características incluidas
  created_at: string;
  updated_at: string;
  provider?: ProviderProfile;
}

// Tipos adicionales útiles
export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  type: 'booking' | 'message' | 'system' | 'payment';
  related_id?: string; // ID de la entidad relacionada
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id?: string | null;
  membership_id?: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  payment_method: string;
  stripe_payment_id: string;
  created_at: string;
}
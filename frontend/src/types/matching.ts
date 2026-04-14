export type AdventureLevel = 'chill' | 'moderate' | 'adventurous';
export type SocialPreference = 'solo' | 'mix' | 'social';
export type PacePreference = 'relaxed' | 'balanced' | 'packed';
export type BudgetLevel = 'budget' | 'moderate' | 'luxury';
export type TripStyle = 'cultural' | 'active' | 'mixed' | 'relaxed';
export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface TravelProfile {
  adventureLevel: AdventureLevel;
  socialPreference: SocialPreference;
  pacePreference: PacePreference;
  budgetLevel: BudgetLevel;
  tripStyle: TripStyle;
  interests: string[];
}

export interface Trip {
  id: number;
  destination: string;
  startDate: string;
  endDate: string;
  budget?: BudgetLevel;
  description?: string;
}

export interface PotentialMatch {
  userId: number;
  name: string;
  avatar: string | null;
  profile: TravelProfile | null;
  upcomingTrips: Trip[];
  compatibilityScore: number;
  matchReasons: string[];
  distance?: string;
}

export interface BuddyRequest {
  id: number;
  requester: { id: number; name: string; avatar: string } | null;
  recipient: { id: number; name: string; avatar: string } | null;
  trip: { id: number; destination: string; dates: string };
  message: string;
  status: RequestStatus;
  createdAt: string;
}

export interface BuddyConnection {
  id: number;
  partner: { id: number; name: string; avatar: string };
  trip: { id: number; destination: string; dates: string };
  connectedAt: string;
}

export interface CompatibilityBreakdown {
  destination: number;
  date_overlap: number;
  personality: number;
  interests: number;
  budget: number;
}

export interface MatchDetails {
  user: { id: number; name: string; avatar: string | null };
  profile: TravelProfile | null;
  trips: Trip[];
  compatibility: {
    overall: number;
    breakdown: CompatibilityBreakdown;
  };
}

export interface MatchingPreferences {
  minCompatibilityScore: number;
  preferredDestination: string | null;
  dateFlexibility: number;
  maxBudget: number | null;
  interestsFilter: string[];
}

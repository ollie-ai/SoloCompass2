import { MapPin, Camera, Utensils, Building, Moon, Trees, Heart, ShoppingBag, Sparkles, Globe, Users, User } from 'lucide-react';

export const ACTIVITY_INTERESTS = [
  { value: 'Hiking', icon: MapPin },
  { value: 'Photography', icon: Camera },
  { value: 'Food tours', icon: Utensils },
  { value: 'Museums', icon: Building },
  { value: 'Nightlife', icon: Moon },
  { value: 'Beaches', icon: Trees },
  { value: 'Wildlife', icon: Heart },
  { value: 'Shopping', icon: ShoppingBag },
];

export const VIBE_INTERESTS = [
  { value: 'Adventure', icon: Sparkles },
  { value: 'Relaxation', icon: Heart },
  { value: 'Culture', icon: Globe },
  { value: 'Social', icon: Users },
  { value: 'Solo reflection', icon: User },
  { value: 'Nature', icon: Trees },
  { value: 'Urban exploration', icon: Building },
];

export const ALL_INTERESTS = [...ACTIVITY_INTERESTS, ...VIBE_INTERESTS];

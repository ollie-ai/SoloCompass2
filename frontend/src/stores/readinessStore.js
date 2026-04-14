import { create } from 'zustand';
import api from '../lib/api';

export const READINESS_LABELS = {
  READY: 'Ready',
  IN_PROGRESS: 'In progress',
  NEEDS_ATTENTION: 'Needs attention',
  CRITICAL_BLOCKER: 'Critical blocker',
};

export const READINESS_BANDS = {
  READY: { min: 85, max: 100 },
  IN_PROGRESS: { min: 60, max: 84 },
  NEEDS_ATTENTION: { min: 30, max: 59 },
  CRITICAL_BLOCKER: { min: 0, max: 29 },
};

export const HARD_BLOCKERS = [
  'no_accommodation',
  'missing_required_document',
  'serious_advisory',
  'no_arrival_transport',
  'missing_core_safety_setup',
];

export const calculateReadinessScore = (trip) => {
  if (!trip) return 0;

  let score = 0;
  let maxScore = 0;

  if (trip.start_date) maxScore += 15;
  if (trip.destination) maxScore += 15;
  if (trip.accommodation_id) {
    score += 20;
    maxScore += 20;
  } else {
    maxScore += 20;
  }
  if (trip.bookings?.length > 0) {
    score += 15;
    maxScore += 15;
  } else {
    maxScore += 15;
  }
  if (trip.documents?.length > 0) {
    score += 15;
    maxScore += 15;
  } else {
    maxScore += 15;
  }
  if (trip.emergency_contacts?.length > 0) {
    score += 10;
    maxScore += 10;
  } else {
    maxScore += 10;
  }
  if (trip.check_in_schedule) {
    score += 10;
    maxScore += 10;
  } else {
    maxScore += 10;
  }

  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
};

export const getReadinessLabel = (score) => {
  if (score >= READINESS_BANDS.READY.min) return READINESS_LABELS.READY;
  if (score >= READINESS_BANDS.IN_PROGRESS.min) return READINESS_LABELS.IN_PROGRESS;
  if (score >= READINESS_BANDS.NEEDS_ATTENTION.min) return READINESS_LABELS.NEEDS_ATTENTION;
  return READINESS_LABELS.CRITICAL_BLOCKER;
};

export const getReadinessColor = (label) => {
  switch (label) {
    case READINESS_LABELS.READY:
      return 'text-green-500';
    case READINESS_LABELS.IN_PROGRESS:
      return 'text-blue-500';
    case READINESS_LABELS.NEEDS_ATTENTION:
      return 'text-amber-500';
    case READINESS_LABELS.CRITICAL_BLOCKER:
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

export const useReadinessStore = create((set, get) => ({
  currentTrip: null,
  readinessScore: 0,
  readinessLabel: READINESS_LABELS.CRITICAL_BLOCKER,
  blockers: [],
  nextBestAction: null,
  checklist: [],
  isLoading: false,
  error: null,
  lastUpdated: null,

  fetchReadiness: async (tripId) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.get(`/trips/${tripId}/readiness`);
      const tripData = response.data.data;
      
      const score = calculateReadinessScore(tripData);
      const label = getReadinessLabel(score);
      const blockers = getBlockers(tripData);
      const nextAction = getNextBestAction(blockers, label);
      
      set({
        currentTrip: tripData,
        readinessScore: score,
        readinessLabel: label,
        blockers,
        nextBestAction: nextAction,
        checklist: generateChecklist(tripData),
        isLoading: false,
        lastUpdated: new Date(),
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to fetch readiness data' 
      });
    }
  },

  updateChecklistItem: async (itemId, completed) => {
    const { checklist } = get();
    const updatedChecklist = checklist.map(item => 
      item.id === itemId ? { ...item, completed, completedAt: completed ? new Date() : null } : item
    );
    set({ checklist: updatedChecklist });

    try {
      await api.put(`/trips/checklist/${itemId}`, { completed });
    } catch (error) {
      set({ checklist });
    }
  },

  clearReadiness: () => {
    set({
      currentTrip: null,
      readinessScore: 0,
      readinessLabel: READINESS_LABELS.CRITICAL_BLOCKER,
      blockers: [],
      nextBestAction: null,
      checklist: [],
      isLoading: false,
      error: null,
      lastUpdated: null,
    });
  },
}));

const getBlockers = (trip) => {
  const blockers = [];
  
  if (!trip.accommodation_id) {
    blockers.push({ type: 'no_accommodation', message: 'No accommodation confirmed' });
  }
  if (!trip.destination) {
    blockers.push({ type: 'no_destination', message: 'No destination set' });
  }
  if (!trip.start_date) {
    blockers.push({ type: 'no_dates', message: 'No trip dates set' });
  }
  const hasRequiredDoc = trip.documents?.some(doc => doc.type === 'passport');
  if (!hasRequiredDoc) {
    blockers.push({ type: 'missing_required_document', message: 'Passport not added' });
  }
  if (!trip.emergency_contacts?.length) {
    blockers.push({ type: 'missing_core_safety_setup', message: 'No emergency contacts set up' });
  }
  if (!trip.check_in_schedule) {
    blockers.push({ type: 'no_checkin_setup', message: 'Check-in schedule not configured' });
  }

  return blockers;
};

const getNextBestAction = (blockers, readinessLabel) => {
  if (blockers.length === 0 && readinessLabel === READINESS_LABELS.READY) {
    return {
      title: 'You\'re all set!',
      description: 'Your trip is ready. Review your itinerary before you go.',
      action: 'Review Trip',
      route: '/trips',
    };
  }

  const priorityOrder = [
    'missing_core_safety_setup',
    'missing_required_document',
    'no_accommodation',
    'no_checkin_setup',
    'no_destination',
    'no_dates',
  ];

  const sortedBlockers = [...blockers].sort((a, b) => 
    priorityOrder.indexOf(a.type) - priorityOrder.indexOf(b.type)
  );

  const topBlocker = sortedBlockers[0];

  const actionMap = {
    missing_core_safety_setup: { title: 'Set up safety', action: 'Add Contacts', route: '/safety' },
    missing_required_document: { title: 'Add documents', action: 'Upload Passport', route: '/trips' },
    no_accommodation: { title: 'Book accommodation', action: 'Find Stay', route: '/trips' },
    no_checkin_setup: { title: 'Configure check-ins', action: 'Set Up Check-ins', route: '/safety' },
    no_destination: { title: 'Choose destination', action: 'Select Destination', route: '/destinations' },
    no_dates: { title: 'Set trip dates', action: 'Add Dates', route: '/trips' },
  };

  const action = actionMap[topBlocker?.type] || { title: 'Complete setup', action: 'Continue', route: '/trips' };

  return {
    title: topBlocker?.message || 'Complete your trip setup',
    description: `This is blocking your trip readiness.`,
    action: action.action,
    route: action.route,
  };
};

const generateChecklist = (trip) => {
  const checklist = [];

  checklist.push(
    { id: 'trip_dates', category: 'Trip Basics', label: 'Trip dates confirmed', completed: !!trip.start_date },
    { id: 'destination', category: 'Trip Basics', label: 'Destination set', completed: !!trip.destination },
    { id: 'accommodation', category: 'Trip Basics', label: 'Accommodation added', completed: !!trip.accommodation_id },
    { id: 'arrival_transport', category: 'Trip Basics', label: 'Arrival transport planned', completed: !!trip.bookings?.some(b => b.type === 'transfer') }
  );

  checklist.push(
    { id: 'passport', category: 'Documents', label: 'Passport added', completed: trip.documents?.some(d => d.type === 'passport') },
    { id: 'visa', category: 'Documents', label: 'Visa checked (if relevant)', completed: trip.visa_required === false },
    { id: 'booking_confirmations', category: 'Documents', label: 'Booking confirmations available', completed: trip.documents?.some(d => d.type === 'booking') },
    { id: 'insurance', category: 'Documents', label: 'Travel insurance documented', completed: trip.documents?.some(d => d.type === 'insurance') }
  );

  checklist.push(
    { id: 'emergency_contacts', category: 'Safety', label: 'Emergency contacts added', completed: trip.emergency_contacts?.length > 0 },
    { id: 'checkin_schedule', category: 'Safety', label: 'Check-in schedule reviewed', completed: !!trip.check_in_schedule },
    { id: 'emergency_numbers', category: 'Safety', label: 'Emergency numbers available', completed: true },
    { id: 'safety_details', category: 'Safety', label: 'Safety details reviewed', completed: trip.safety_reviewed }
  );

  checklist.push(
    { id: 'local_time', category: 'Travel-Day Prep', label: 'Local time checked', completed: !!trip.destination },
    { id: 'weather', category: 'Travel-Day Prep', label: 'Weather forecast reviewed', completed: true },
    { id: 'connectivity', category: 'Travel-Day Prep', label: 'Connectivity plan ready', completed: trip.esim_status !== 'none' },
    { id: 'offline_pack', category: 'Travel-Day Prep', label: 'Offline essentials saved', completed: trip.offline_ready }
  );

  return checklist;
};

const READINESS_BANDS = {
  READY: { min: 85, max: 100 },
  IN_PROGRESS: { min: 60, max: 84 },
  NEEDS_ATTENTION: { min: 30, max: 59 },
  CRITICAL_BLOCKER: { min: 0, max: 29 },
};

const HARD_BLOCKERS = [
  'no_accommodation',
  'missing_required_document',
  'serious_advisory',
  'no_arrival_transport',
  'missing_core_safety_setup',
];

const calculateReadinessScore = (trip) => {
  if (!trip) return 0;

  let score = 0;
  let maxScore = 0;

  if (trip.start_date) {
    score += 15;
    maxScore += 15;
  } else {
    maxScore += 15;
  }

  if (trip.destination) {
    score += 15;
    maxScore += 15;
  } else {
    maxScore += 15;
  }

  if (trip.accommodation_id) {
    score += 20;
    maxScore += 20;
  } else {
    maxScore += 20;
  }

  const hasBookings = trip.bookings && trip.bookings.length > 0;
  if (hasBookings) {
    score += 15;
    maxScore += 15;
  } else {
    maxScore += 15;
  }

  const hasDocuments = trip.documents && trip.documents.length > 0;
  if (hasDocuments) {
    score += 15;
    maxScore += 15;
  } else {
    maxScore += 15;
  }

  const hasEmergencyContacts = trip.emergency_contacts && trip.emergency_contacts.length > 0;
  if (hasEmergencyContacts) {
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

const getReadinessLabel = (score) => {
  if (score >= READINESS_BANDS.READY.min) return 'Ready';
  if (score >= READINESS_BANDS.IN_PROGRESS.min) return 'In progress';
  if (score >= READINESS_BANDS.NEEDS_ATTENTION.min) return 'Needs attention';
  return 'Critical blocker';
};

const getBlockers = (trip) => {
  const blockers = [];

  if (!trip.accommodation_id) {
    blockers.push({ type: 'no_accommodation', message: 'No accommodation confirmed', priority: 1 });
  }

  if (!trip.destination) {
    blockers.push({ type: 'no_destination', message: 'No destination set', priority: 2 });
  }

  if (!trip.start_date) {
    blockers.push({ type: 'no_dates', message: 'No trip dates set', priority: 3 });
  }

  const hasRequiredDoc = trip.documents && trip.documents.some(doc => doc.type === 'passport');
  if (!hasRequiredDoc) {
    blockers.push({ type: 'missing_required_document', message: 'Passport not added', priority: 4 });
  }

  if (!trip.emergency_contacts || trip.emergency_contacts.length === 0) {
    blockers.push({ type: 'missing_core_safety_setup', message: 'No emergency contacts set up', priority: 5 });
  }

  if (!trip.check_in_schedule) {
    blockers.push({ type: 'no_checkin_setup', message: 'Check-in schedule not configured', priority: 6 });
  }

  return blockers.sort((a, b) => a.priority - b.priority);
};

const getNextBestAction = (blockers, readinessLabel) => {
  if (blockers.length === 0 && readinessLabel === 'Ready') {
    return {
      title: 'You\'re all set!',
      description: 'Your trip is ready. Review your itinerary before you go.',
      action: 'Review Trip',
      route: '/trips',
    };
  }

  const actionMap = {
    missing_core_safety_setup: { title: 'Set up safety', action: 'Add Contacts', route: '/safety' },
    missing_required_document: { title: 'Add documents', action: 'Upload Passport', route: '/trips' },
    no_accommodation: { title: 'Book accommodation', action: 'Find Stay', route: '/trips' },
    no_checkin_setup: { title: 'Configure check-ins', action: 'Set Up Check-ins', route: '/safety' },
    no_destination: { title: 'Choose destination', action: 'Select Destination', route: '/destinations' },
    no_dates: { title: 'Set trip dates', action: 'Add Dates', route: '/trips' },
  };

  const topBlocker = blockers[0];
  const action = actionMap[topBlocker?.type] || { title: 'Complete setup', action: 'Continue', route: '/trips' };

  return {
    title: topBlocker?.message || 'Complete your trip setup',
    description: 'This is blocking your trip readiness.',
    action: action.action,
    route: action.route,
  };
};

const generateChecklist = (trip) => {
  const checklist = [];

  checklist.push(
    { id: 'trip_dates', category: 'Trip Basics', label: 'Trip dates confirmed', completed: !!trip.start_date, autoComplete: true },
    { id: 'destination', category: 'Trip Basics', label: 'Destination set', completed: !!trip.destination, autoComplete: true },
    { id: 'accommodation', category: 'Trip Basics', label: 'Accommodation added', completed: !!trip.accommodation_id, autoComplete: true },
    { id: 'arrival_transport', category: 'Trip Basics', label: 'Arrival transport planned', completed: trip.bookings?.some(b => b.type === 'transfer') || false, autoComplete: true }
  );

  checklist.push(
    { id: 'passport', category: 'Documents', label: 'Passport added', completed: trip.documents?.some(d => d.type === 'passport') || false, autoComplete: true },
    { id: 'visa', category: 'Documents', label: 'Visa checked (if relevant)', completed: trip.visa_required === false, autoComplete: false },
    { id: 'booking_confirmations', category: 'Documents', label: 'Booking confirmations available', completed: trip.documents?.some(d => d.type === 'booking') || false, autoComplete: true },
    { id: 'insurance', category: 'Documents', label: 'Travel insurance documented', completed: trip.documents?.some(d => d.type === 'insurance') || false, autoComplete: false }
  );

  checklist.push(
    { id: 'emergency_contacts', category: 'Safety', label: 'Emergency contacts added', completed: (trip.emergency_contacts?.length || 0) > 0, autoComplete: true },
    { id: 'checkin_schedule', category: 'Safety', label: 'Check-in schedule reviewed', completed: !!trip.check_in_schedule, autoComplete: true },
    { id: 'emergency_numbers', category: 'Safety', label: 'Emergency numbers available', completed: true, autoComplete: true },
    { id: 'safety_details', category: 'Safety', label: 'Safety details reviewed', completed: trip.safety_reviewed || false, autoComplete: false }
  );

  checklist.push(
    { id: 'local_time', category: 'Travel-Day Prep', label: 'Local time checked', completed: !!trip.destination, autoComplete: true },
    { id: 'weather', category: 'Travel-Day Prep', label: 'Weather forecast reviewed', completed: true, autoComplete: true },
    { id: 'connectivity', category: 'Travel-Day Prep', label: 'Connectivity plan ready', completed: trip.esim_status !== 'none', autoComplete: false },
    { id: 'offline_pack', category: 'Travel-Day Prep', label: 'Offline essentials saved', completed: trip.offline_ready || false, autoComplete: false }
  );

  return checklist;
};

const getTripReadiness = async (tripId, db) => {
  const tripResult = await db.query(`
    SELECT 
      t.*,
      (
        SELECT json_agg(json_build_object(
          'id', b.id,
          'type', b.type,
          'provider', b.provider,
          'departure_location', b.departure_location,
          'arrival_location', b.arrival_location,
          'travel_date', b.travel_date
        ))
        FROM bookings b
        WHERE b.trip_id = t.id
      ) as bookings,
      (
        SELECT json_agg(json_build_object(
          'id', td.id,
          'type', td.type,
          'name', td.name,
          'file_url', td.file_url
        ))
        FROM trip_documents td
        WHERE td.trip_id = t.id
      ) as documents,
      (
        SELECT json_agg(json_build_object(
          'id', ec.id,
          'name', ec.name,
          'phone', ec.phone,
          'verified', ec.verified
        ))
        FROM emergency_contacts ec
        WHERE ec.user_id = t.user_id
      ) as emergency_contacts,
      (
        SELECT json_build_object(
          'id', sci.id,
          'is_active', sci.is_active,
          'interval_minutes', sci.interval_minutes
        )
        FROM scheduled_check_ins sci
        WHERE sci.trip_id = t.id AND sci.is_active = true
        LIMIT 1
      ) as check_in_schedule
    FROM trips t
    WHERE t.id = $1
  `, [tripId]);

  if (tripResult.rows.length === 0) {
    return null;
  }

  const trip = tripResult.rows[0];
  
  const score = calculateReadinessScore(trip);
  const label = getReadinessLabel(score);
  const blockers = getBlockers(trip);
  const nextAction = getNextBestAction(blockers, label);
  const checklist = generateChecklist(trip);

  return {
    trip,
    readiness: {
      score,
      label,
      blockers,
      nextAction,
      checklist,
      lastUpdated: new Date().toISOString(),
    },
  };
};

const hasHardBlocker = (blockers) => {
  return blockers.some(b => HARD_BLOCKERS.includes(b.type));
};

export {
  calculateReadinessScore,
  getReadinessLabel,
  getBlockers,
  getNextBestAction,
  generateChecklist,
  getTripReadiness,
  hasHardBlocker,
  READINESS_BANDS,
  HARD_BLOCKERS,
};

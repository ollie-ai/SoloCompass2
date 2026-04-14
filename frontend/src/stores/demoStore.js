import { create } from 'zustand';

const DEMO_SAMPLE_TRIPS = [
  {
    id: 'demo-1',
    destination: 'Lisbon',
    country: 'Portugal',
    days: 5,
    travelStyle: 'Cultural Explorer',
    pace: 'Moderate',
    budget: 'Mid-range',
    startDate: '2026-05-15',
    endDate: '2026-05-19'
  },
  {
    id: 'demo-2',
    destination: 'Tokyo',
    country: 'Japan',
    days: 7,
    travelStyle: 'Adventure Seeker',
    pace: 'Fast-paced',
    budget: 'Premium',
    startDate: '2026-06-01',
    endDate: '2026-06-07'
  },
  {
    id: 'demo-3',
    destination: 'Barcelona',
    country: 'Spain',
    days: 4,
    travelStyle: 'Social Butterfly',
    pace: 'Relaxed',
    budget: 'Budget',
    startDate: '2026-07-10',
    endDate: '2026-07-13'
  }
];

const DEMO_ITINERARIES = {
  'demo-1': {
    days: [
      {
        day: 1,
        date: 'May 15',
        title: 'Arrival & Old Town Discovery',
        activities: [
          { time: '14:00', name: 'Check-in at hotel', location: 'Alfama', duration: '1 hour', cost_estimate: 'Included', notes: 'Ask for a room with city view' },
          { time: '16:00', name: 'Explore Alfama neighborhood', location: 'Alfama', duration: '2 hours', cost_estimate: 'Free', notes: 'Wander through the oldest district' },
          { time: '19:00', name: 'Dinner at Solo Traveller Friendly Restaurant', location: 'Baixa', duration: '1.5 hours', cost_estimate: '£20-30', notes: 'Busy, well-lit establishments recommended' }
        ]
      },
      {
        day: 2,
        date: 'May 16',
        title: 'Belem Cultural Day',
        activities: [
          { time: '09:00', name: 'Breakfast at Time Out Market', location: 'Mercado da Ribeira', duration: '1 hour', cost_estimate: '£8-15', notes: 'Great for solo dinings' },
          { time: '10:30', name: 'Visit Jeronimos Monastery', location: 'Belem', duration: '2 hours', cost_estimate: '£10', notes: 'Free entry on Sunday mornings' },
          { time: '14:00', name: 'Lunch by the river', location: 'Belem', duration: '1 hour', cost_estimate: '£15-20', notes: 'Try the pastel de nata' },
          { time: '15:30', name: 'Walk along riverside to Torre de Belem', location: 'Belem', duration: '1.5 hours', cost_estimate: 'Free', notes: 'Well-lit, popular path' }
        ]
      },
      {
        day: 3,
        date: 'May 17',
        title: 'Bairro Alto & Nightlife',
        activities: [
          { time: '10:00', name: 'Morning coffee at Fabrica', location: 'Bairro Alto', duration: '45 min', cost_estimate: '£3-5', notes: 'Local favorite' },
          { time: '11:00', name: 'Shopping on Rua Augusta', location: 'Baixa', duration: '2 hours', cost_estimate: '£varies', notes: 'Great for souvenirs' },
          { time: '14:00', name: 'Lunch at a tasca', location: 'Chiado', duration: '1 hour', cost_estimate: '£12-18', notes: 'Traditional Portuguese food' },
          { time: '18:00', name: 'Sunset at Miradouro de Sao Pedro de Alcantara', location: 'Bairro Alto', duration: '1 hour', cost_estimate: 'Free', notes: 'Beautiful city views' }
        ]
      },
      {
        day: 4,
        date: 'May 18',
        title: 'Sintra Day Trip',
        activities: [
          { time: '08:00', name: 'Train to Sintra', location: 'Rossio Station', duration: '40 min', cost_estimate: '£4.50 return', notes: 'Buy ticket at Rossio' },
          { time: '09:30', name: 'Explore Pena Palace', location: 'Sintra', duration: '3 hours', cost_estimate: '£14', notes: 'Book tickets online in advance' },
          { time: '13:30', name: 'Lunch in Sintra town', location: 'Sintra', duration: '1 hour', cost_estimate: '£15-20', notes: 'Try the travesseiros' },
          { time: '15:00', name: 'Visit Quinta da Regaleira', location: 'Sintra', duration: '2 hours', cost_estimate: '£10', notes: 'Bring comfortable shoes' }
        ]
      },
      {
        day: 5,
        date: 'May 19',
        title: 'Departure Day',
        activities: [
          { time: '09:00', name: 'Final breakfast at hotel', location: 'Alfama', duration: '1 hour', cost_estimate: '£10-15', notes: 'Pack and check out' },
          { time: '11:00', name: 'Last walk through Alfama', location: 'Alfama', duration: '1 hour', cost_estimate: 'Free', notes: 'Pick up last-minute souvenirs' },
          { time: '13:00', name: 'Transfer to airport', location: 'Airport', duration: '30 min', cost_estimate: '£6 metro or £20 taxi', notes: 'Metro is solo-traveller friendly' }
        ]
      }
    ]
  },
  'demo-2': {
    days: [
      {
        day: 1,
        date: 'June 1',
        title: 'Arrival & Shinjuku Introduction',
        activities: [
          { time: '15:00', name: 'Check into capsule hotel', location: 'Shinjuku', duration: '1 hour', cost_estimate: '£25-35', notes: 'Experience Japanese capsule culture' },
          { time: '17:00', name: 'Explore Shinjuku Golden Gai', location: 'Shinjuku', duration: '2 hours', cost_estimate: '£15-25', notes: 'Tiny bars, very solo-friendly' },
          { time: '20:00', name: 'Dinner at Ichiran Ramen', location: 'Shinjuku', duration: '45 min', cost_estimate: '£8-12', notes: 'Famous solo-dining ramen' }
        ]
      },
      {
        day: 2,
        date: 'June 2',
        title: 'Traditional Tokyo',
        activities: [
          { time: '08:00', name: 'Tsukiji Outer Market breakfast', location: 'Tsukiji', duration: '1.5 hours', cost_estimate: '£10-20', notes: 'Fresh sushi for breakfast' },
          { time: '10:00', name: 'Senso-ji Temple', location: 'Asakusa', duration: '2 hours', cost_estimate: 'Free', notes: 'Tokyos oldest temple' },
          { time: '13:00', name: 'Lunch in Akihabara', location: 'Akihabara', duration: '1 hour', cost_estimate: '£10-15', notes: 'Electric Town exploration' },
          { time: '15:00', name: 'TeamLab Borderless', location: 'Odaiba', duration: '2 hours', cost_estimate: '£20', notes: 'Incredible digital art museum' }
        ]
      },
      {
        day: 3,
        date: 'June 3',
        title: 'Harajuku & Shibuya',
        activities: [
          { time: '09:00', name: 'Meiji Shrine', location: 'Harajuku', duration: '1 hour', cost_estimate: 'Free', notes: 'Peaceful morning visit' },
          { time: '10:30', name: 'Takeshita Street', location: 'Harajuku', duration: '2 hours', cost_estimate: '£varies', notes: 'Crazy fashion and crepes' },
          { time: '13:00', name: 'Lunch at Harajuku Crepes', location: 'Harajuku', duration: '30 min', cost_estimate: '£5-8', notes: 'Sweet and savory options' },
          { time: '15:00', name: 'Shibuya Crossing & Sky Deck', location: 'Shibuya', duration: '2 hours', cost_estimate: '£15', notes: 'Iconic crossing view' }
        ]
      },
      {
        day: 4,
        date: 'June 4',
        title: 'Mount Fuji Day Trip',
        activities: [
          { time: '07:00', name: 'Bullet train to Hakone', location: 'Shinkansen', duration: '1 hour', cost_estimate: '£30', notes: 'Japan Rail Pass recommended' },
          { time: '09:00', name: 'Hakone Ropeway', location: 'Hakone', duration: '2 hours', cost_estimate: '£15', notes: 'Great views of Fuji' },
          { time: '12:00', name: 'Lakeside lunch', location: 'Lake Ashi', duration: '1 hour', cost_estimate: '£15-20', notes: 'Black egg specialities' },
          { time: '14:00', name: 'Return to Tokyo', location: 'Shinjuku', duration: '1.5 hours', cost_estimate: '£25', notes: 'Relax on the train' }
        ]
      },
      {
        day: 5,
        date: 'June 5',
        title: 'Anime & Gaming',
        activities: [
          { time: '10:00', name: 'Animate Akihabara', location: 'Akihabara', duration: '2 hours', cost_estimate: '£varies', notes: 'Manga and anime heaven' },
          { time: '13:00', name: 'Lunch at Gundam Cafe', location: 'Akihabara', duration: '1 hour', cost_estimate: '£12-18', notes: 'Themed cafe experience' },
          { time: '15:00', name: 'Round1 Stadium', location: 'Shinjuku', duration: '3 hours', cost_estimate: '£15-25', notes: 'Arcade, bowling, karaoke' }
        ]
      },
      {
        day: 6,
        date: 'June 6',
        title: 'Modern Art & Relaxation',
        activities: [
          { time: '10:00', name: 'Mori Art Museum', location: 'Roppongi', duration: '2 hours', cost_estimate: '£12', notes: 'Stunning Tokyo views' },
          { time: '13:00', name: 'Lunch at Roppongi Hills', location: 'Roppongi', duration: '1 hour', cost_estimate: '£15-25', notes: 'Upscale dining' },
          { time: '15:00', name: 'Explore Odaiba', location: 'Odaiba', duration: '3 hours', cost_estimate: '£varies', notes: 'Shopping and entertainment' }
        ]
      },
      {
        day: 7,
        date: 'June 7',
        title: 'Departure',
        activities: [
          { time: '09:00', name: 'Final breakfast', location: 'Shinjuku', duration: '1 hour', cost_estimate: '£10-15', notes: 'Pack and check out' },
          { time: '11:00', name: 'Last-minute shopping', location: 'Shinjuku', duration: '1.5 hours', cost_estimate: '£varies', notes: 'Souvenirs and snacks' },
          { time: '14:00', name: 'Transfer to Narita', location: 'Narita Airport', duration: '1.5 hours', cost_estimate: '£20-30', notes: 'Narita Express recommended' }
        ]
      }
    ]
  },
  'demo-3': {
    days: [
      {
        day: 1,
        date: 'July 10',
        title: 'La Rambla & Old Town',
        activities: [
          { time: '15:00', name: 'Check into hostel', location: 'Gotic Quarter', duration: '1 hour', cost_estimate: '£20-30', notes: 'Central location' },
          { time: '17:00', name: 'Walk La Rambla', location: 'La Rambla', duration: '1.5 hours', cost_estimate: 'Free', notes: 'Watch the street performers' },
          { time: '19:00', name: 'Tapas crawl in Barri Gotic', location: 'Gotic', duration: '2 hours', cost_estimate: '£15-25', notes: 'Try local tapas bars' }
        ]
      },
      {
        day: 2,
        date: 'July 11',
        title: 'Gaudi & Beach Day',
        activities: [
          { time: '09:00', name: 'Sagrada Familia', location: 'Eixample', duration: '2 hours', cost_estimate: '£20-30', notes: 'Book tickets in advance' },
          { time: '12:00', name: 'Park Guell', location: 'Gracia', duration: '2 hours', cost_estimate: '£10', notes: 'Gaudi masterpiece' },
          { time: '15:00', name: 'Beach time at Barceloneta', location: 'Barceloneta', duration: '3 hours', cost_estimate: 'Free', notes: 'Popular beach, safe area' }
        ]
      },
      {
        day: 3,
        date: 'July 12',
        title: 'Montjuic & Nightlife',
        activities: [
          { time: '10:00', name: 'Montjuic Cable Car', location: 'Montjuic', duration: '1 hour', cost_estimate: '£12', notes: 'Amazing city views' },
          { time: '11:00', name: 'MNAC Museum', location: 'Montjuic', duration: '2 hours', cost_estimate: '£12', notes: 'Catalan art collection' },
          { time: '14:00', name: 'Lunch at Port Olympica', location: 'Port Olympic', duration: '1 hour', cost_estimate: '£15-20', notes: 'Seafront dining' },
          { time: '21:00', name: 'Nightclub at Port Olympica', location: 'Port Olympic', duration: '4 hours', cost_estimate: '£15-25', notes: 'Famous clubs, safe area' }
        ]
      },
      {
        day: 4,
        date: 'July 13',
        title: 'Markets & Departure',
        activities: [
          { time: '09:00', name: 'La Boqueria Market', location: 'La Rambla', duration: '1.5 hours', cost_estimate: '£varies', notes: 'Fresh produce and snacks' },
          { time: '11:00', name: 'El Born neighborhood', location: 'El Born', duration: '2 hours', cost_estimate: 'Free', notes: 'Boutique shopping' },
          { time: '14:00', name: 'Transfer to airport', location: 'BCN Airport', duration: '40 min', cost_estimate: '£5 metro or £35 taxi', notes: 'Metro is safe and cheap' }
        ]
      }
    ]
  }
};

const DEMO_SAFETY_LAYER = {
  checkInSchedule: {
    enabled: true,
    frequency: 'twice daily',
    times: ['09:00', '21:00']
  },
  emergencyContacts: [
    { name: 'Emma (Sister)', type: 'email', verified: true },
    { name: 'Mike (Friend)', type: 'sms', verified: true }
  ],
  advisories: {
    status: 'Low',
    summary: 'No active FCDO warnings for Portugal',
    lastUpdated: 'April 2026'
  },
  safeHavens: {
    police: 3,
    hospitals: 2,
    embassies: 1,
    hotels: 12
  }
};

const DEMO_LOADING_MESSAGES = [
  'Checking FCDO advisories...',
  'Mapping safe havens...',
  'Building your check-in schedule...',
  'Calculating budget estimates...',
  'Generating activity recommendations...',
  'Finalizing your itinerary...'
];

const useDemoStore = create((set, get) => ({
  heroVariant: 'A',
  currentStep: 0,
  selectedTrip: null,
  selectedTravelStyle: null,
  isGenerating: false,
  generatedItinerary: null,
  generatedSafety: null,
  loadingMessageIndex: 0,
  sampleTrips: DEMO_SAMPLE_TRIPS,
  itineraries: DEMO_ITINERARIES,
  safetyLayer: DEMO_SAFETY_LAYER,
  loadingMessages: DEMO_LOADING_MESSAGES,

  setHeroVariant: (variant) => set({ heroVariant: variant }),
  
  selectTrip: (tripId) => {
    const trip = DEMO_SAMPLE_TRIPS.find(t => t.id === tripId);
    set({ selectedTrip: trip, currentStep: 1 });
  },
  
  selectTravelStyle: (style) => {
    set({ selectedTravelStyle: style, currentStep: 2 });
  },
  
  generateDemo: async () => {
    const { selectedTrip, itineraries, safetyLayer, loadingMessages } = get();
    set({ isGenerating: true, loadingMessageIndex: 0 });
    
    for (let i = 0; i < loadingMessages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      set({ loadingMessageIndex: i + 1 });
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const itinerary = itineraries[selectedTrip.id] || itineraries['demo-1'];
    set({
      isGenerating: false,
      generatedItinerary: itinerary,
      generatedSafety: safetyLayer,
      currentStep: 3
    });
  },
  
  resetDemo: () => set({
    currentStep: 0,
    selectedTrip: null,
    selectedTravelStyle: null,
    isGenerating: false,
    generatedItinerary: null,
    generatedSafety: null,
    loadingMessageIndex: 0
  })
}));

export default useDemoStore;

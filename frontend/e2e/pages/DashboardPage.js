export class DashboardPage {
  constructor(page) {
    this.page = page;
    
    // Dashboard states
    this.noTripsState = page.getByText(/no trips yet/i).or(page.getByRole('button', { name: /create your first trip/i }));
    this.planningState = page.getByText(/planning/i);
    this.upcomingState = page.getByText(/upcoming/i).or(page.getByText(/starting soon/i));
    this.liveTripState = page.getByText(/live trip/i).or(page.getByText(/currently active/i));
    this.completedState = page.getByText(/trip summary/i).or(page.getByText(/completed/i));
    
    // Dashboard elements
    this.dashboardHeading = page.getByRole('heading', { name: /welcome/i });
    this.createTripBtn = page.getByRole('button', { name: /create trip|new trip/i });
    this.subscriptionBanner = page.getByText(/upgrade to premium/i);
    this.systemPulse = page.locator('.system-pulse').or(page.locator('[class*="pulse"]'));
    this.countdownTimer = page.locator('[class*="countdown"]');
    this.weatherWidget = page.getByText(/weather/i);
    
    // Trip card elements
    this.tripCard = page.locator('[class*="trip-card"], [class*="TripCard"]');
    this.tripName = page.locator('[class*="trip-name"]').or(page.locator('h2').or(page.locator('h3'))).filter({ hasText: /\w/ });
    this.tripDestination = page.getByText(/tokyo/i).or(page.getByText(/paris/i)).or(page.getByText(/london/i));
    this.tripDates = page.getByText(/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i);
    this.statusBadge = page.locator('[class*="status-badge"], [class*="StatusBadge"]');
    
    // Navigation
    this.navMyTrips = page.getByRole('link', { name: /my trips|trips/i });
    this.navExplore = page.getByRole('link', { name: /explore|destinations/i });
    this.navSafety = page.getByRole('link', { name: /safety/i });
    this.navBuddies = page.getByRole('link', { name: /buddies|friends/i });
    this.navSettings = page.getByRole('link', { name: /settings/i });
    
    // User menu
    this.userMenuBtn = page.locator('[class*="user-menu"], [class*="UserMenu"]').first();
    this.userAvatar = page.locator('[class*="avatar"]').first();
    
    // Loading states
    this.loadingSkeleton = page.locator('[class*="skeleton"], .animate-pulse');
    this.spinner = page.locator('[class*="spinner"], .loading');
    
    // Error states
    this.errorMessage = page.getByText(/unable to load/i).or(page.getByText(/something went wrong/i));
    this.retryBtn = page.getByRole('button', { name: /retry|try again/i });
  }

  async gotoDashboard() {
    await this.page.goto('/dashboard');
  }

  async loginAndGoToDashboard(email, password) {
    const authPage = await import('./AuthPage.js').then(m => new m.AuthPage(this.page));
    await authPage.gotoLogin();
    await authPage.login(email, password);
    await this.page.waitForURL(/.*\/dashboard/);
  }

  async getStatusBadge() {
    return this.statusBadge.textContent();
  }

  async isSubscriptionBannerVisible() {
    return this.subscriptionBanner.isVisible();
  }

  async isSystemPulseVisible() {
    return this.systemPulse.isVisible();
  }

  async getTripCount() {
    return this.tripCard.count();
  }

  async waitForLoadingComplete() {
    await this.page.waitForSelector(this.loadingSkeleton, { state: 'hidden' }).catch(() => {});
    await this.page.waitForSelector(this.spinner, { state: 'hidden' }).catch(() => {});
  }
}

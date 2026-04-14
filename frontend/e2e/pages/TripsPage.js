export class TripsPage {
  constructor(page) {
    this.page = page;
    
    // Trips list
    this.tripsList = page.locator('[class*="trips-list"], .trips-grid');
    this.tripCard = page.locator('[class*="trip-card"], .TripCard');
    this.createTripBtn = page.getByRole('button', { name: /create trip|new trip/i });
    this.emptyState = page.locator('text=No trips yet|Create Your First Trip');
    
    // Trip filters
    this.statusFilter = page.locator('[class*="filter"], select').filter({ hasText: /status/i });
    this.allFilter = page.locator('option:has-text("All")');
    this.planningFilter = page.locator('option:has-text("Planning")');
    this.confirmedFilter = page.locator('option:has-text("Confirmed")');
    this.completedFilter = page.locator('option:has-text("Completed")');
    
    // New Trip Form
    this.tripNameInput = page.getByLabel('Trip Name').or(page.locator('input[name="name"]'));
    this.destinationInput = page.getByLabel('Destination').or(page.locator('input[name="destination"]'));
    this.startDateInput = page.locator('input[name="startDate"], input[name="start_date"]');
    this.endDateInput = page.locator('input[name="endDate"], input[name="end_date"]');
    this.budgetInput = page.getByLabel('Budget').or(page.locator('input[name="budget"]'));
    this.saveTripBtn = page.getByRole('button', { name: /save trip|create trip|submit/i });
    
    // Trip Detail
    this.tripDetail = page.locator('[class*="trip-detail"], .TripDetail');
    this.itinerarySection = page.locator('text=Itinerary');
    this.accommodationSection = page.locator('text=Accommodation|Accommodations');
    this.bookingSection = page.locator('text=Booking|Bookings');
    this.documentSection = page.locator('text=Document|Documents');
    this.placesSection = page.locator('text=Saved Places|Places');
    this.packingListSection = page.locator('text=Packing List');
    this.budgetSection = page.locator('text=Budget');
    
    // Trip actions
    this.editTripBtn = page.getByRole('button', { name: /edit|edit trip/i });
    this.deleteTripBtn = page.getByRole('button', { name: /delete|remove/i });
    this.confirmDeleteBtn = page.getByRole('button', { name: /confirm|yes|delete/i });
    this.generateItineraryBtn = page.getByRole('button', { name: /generate|ai itinerary/i });
    this.exportPdfBtn = page.getByRole('button', { name: /export pdf|pdf/i });
    
    // Status
    this.statusBadge = page.locator('[class*="status-badge"], .StatusBadge');
    
    // Loading & errors
    this.loadingSpinner = page.locator('[class*="spinner"], .loading');
    this.errorMessage = page.locator('text=Error|Something went wrong');
    this.successToast = page.locator('text=Trip created|Trip updated|Trip deleted');
    
    // Activities
    this.addActivityBtn = page.getByRole('button', { name: /add activity|new activity/i });
    this.activityCard = page.locator('[class*="activity"]');
  }

  async gotoTrips() {
    await this.page.goto('/trips');
  }

  async gotoNewTrip() {
    await this.page.goto('/trips/new');
  }

  async createTrip(name, destination, startDate, endDate, budget) {
    await this.tripNameInput.fill(name);
    await this.destinationInput.fill(destination);
    if (startDate) await this.startDateInput.fill(startDate);
    if (endDate) await this.endDateInput.fill(endDate);
    if (budget) await this.budgetInput.fill(budget.toString());
    await this.saveTripBtn.click();
  }

  async getTripCount() {
    return this.tripCard.count();
  }

  async deleteFirstTrip() {
    await this.deleteTripBtn.first().click();
    await this.confirmDeleteBtn.click();
  }

  async filterByStatus(status) {
    await this.statusFilter.click();
    switch (status.toLowerCase()) {
      case 'planning':
        await this.planningFilter.click();
        break;
      case 'confirmed':
        await this.confirmedFilter.click();
        break;
      case 'completed':
        await this.completedFilter.click();
        break;
      default:
        await this.allFilter.click();
    }
  }

  async waitForLoading() {
    await this.page.waitForSelector(this.loadingSpinner, { state: 'hidden' }).catch(() => {});
  }
}

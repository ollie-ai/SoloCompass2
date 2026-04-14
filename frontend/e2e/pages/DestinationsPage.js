export class DestinationsPage {
  constructor(page) {
    this.page = page;
    
    // Search & filters
    this.searchInput = page.getByPlaceholder('Search destinations').or(page.locator('input[name="search"]'));
    this.searchBtn = page.getByRole('button', { name: /search/i });
    
    // Filters
    this.budgetFilter = page.locator('select[name="budget"]');
    this.safetyFilter = page.locator('select[name="safety"]');
    this.sortDropdown = page.locator('select[name="sort"]');
    
    // Destination cards
    this.destinationCard = page.locator('[class*="destination-card"], [class*="DestinationCard"]');
    this.destinationImage = page.locator('[class*="destination-image"] img');
    this.destinationName = page.locator('[class*="destination-name"], h2, h3');
    this.safetyBadge = page.locator('[class*="safety-badge"], .SafetyBadge');
    
    // Pagination
    this.pagination = page.locator('[class*="pagination"]');
    this.nextPageBtn = page.getByRole('button', { name: /next|page \d+/i });
    this.pageNumber = page.locator('[class*="page-number"]');
    
    // Detail page
    this.detailPage = page.locator('[class*="detail-page"], .DestinationDetail');
    this.weatherWidget = page.locator('text=Weather');
    this.mapSection = page.locator('[class*="map"], text=Map');
    this.emergencyNumbers = page.locator('text=Emergency Numbers');
    this.fcdoAdvisory = page.locator('text=FCDO|Advisory');
    this.reviewsSection = page.locator('text=Reviews');
    
    // Back navigation
    this.backBtn = page.getByRole('button', { name: /back|return/i });
  }

  async gotoDestinations() {
    await this.page.goto('/destinations');
  }

  async searchDestination(query) {
    await this.searchInput.fill(query);
    await this.searchBtn.click();
  }

  async filterByBudget(budget) {
    await this.budgetFilter.selectOption(budget);
  }

  async filterBySafety(safety) {
    await this.safetyFilter.selectOption(safety);
  }

  async sortBy(sortOption) {
    await this.sortDropdown.selectOption(sortOption);
  }

  async clickFirstDestination() {
    await this.destinationCard.first().click();
  }

  async getDestinationCount() {
    return this.destinationCard.count();
  }

  async goToNextPage() {
    await this.nextPageBtn.click();
  }

  async selectFirstDestination() {
    await this.destinationCard.first().click();
  }

  async approveDestination() {
    const approveBtn = this.page.getByRole('button', { name: /approve/i });
    await approveBtn.first().click();
  }
}

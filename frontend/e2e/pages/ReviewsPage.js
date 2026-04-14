export class ReviewsPage {
  constructor(page) {
    this.page = page;
    
    // Page elements
    this.reviewsHeading = page.locator('h1:has-text("Reviews")');
    this.writeReviewBtn = page.getByRole('button', { name: /write.*review|add.*review/i });
    
    // Review list
    this.reviewCard = page.locator('[class*="review-card"], [class*="ReviewCard"]');
    this.reviewTitle = page.locator('[class*="review-title"]');
    this.reviewContent = page.locator('[class*="review-content"]');
    this.reviewRating = page.locator('[class*="rating"], [class*="stars"]');
    
    // Stars
    this.starRating = page.locator('[class*="star"], svg[class*="star"]');
    this.filledStar = page.locator('svg[class*="filled"]');
    
    // Filters
    this.searchInput = page.getByPlaceholder('Search reviews').or(page.locator('input[name="search"]'));
    this.destinationFilter = page.locator('select[name="destination"]');
    this.categoryFilter = page.locator('select[name="category"]');
    this.sortDropdown = page.locator('select[name="sort"]');
    this.soloVerifiedToggle = page.getByRole('switch', { name: /solo verified/i });
    
    // Review form
    this.reviewForm = page.locator('[class*="review-form"]');
    this.titleInput = page.getByLabel('Title').or(page.locator('input[name="title"]'));
    this.contentInput = page.getByLabel('Content').or(page.locator('textarea[name="content"]'));
    this.venueInput = page.getByLabel('Venue').or(page.locator('input[name="venue"]'));
    this.overallRating = page.locator('[class*="overall-rating"]');
    this.soloFriendlyRating = page.locator('[class*="solo-friendly"]');
    this.safetyRating = page.locator('[class*="safety-rating"]');
    this.valueRating = page.locator('[class*="value-rating"]');
    this.submitReviewBtn = page.getByRole('button', { name: /submit.*review|post.*review/i });
    
    // Empty state
    this.emptyState = page.locator('text=no reviews|be the first|write a review');
    this.clearFiltersBtn = page.getByRole('button', { name: /clear.*filters/i });
    
    // Pagination
    this.pagination = page.locator('[class*="pagination"]');
    this.nextPageBtn = page.getByRole('button', { name: /next/i });
    this.pageNumber = page.locator('[class*="page-number"]');
    
    // Stats sidebar
    this.statsSidebar = page.locator('[class*="stats-sidebar"], [class*="StatsSidebar"]');
    this.totalReviews = page.locator('text=Total Reviews');
    this.avgRating = page.locator('text=Average Rating');
  }

  async gotoReviews() {
    await this.page.goto('/reviews');
  }

  async writeReview(title, content, rating) {
    await this.writeReviewBtn.click();
    await this.titleInput.fill(title);
    await this.contentInput.fill(content);
    await this.submitReviewBtn.click();
  }

  async searchReviews(query) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async filterByDestination(destination) {
    await this.destinationFilter.selectOption(destination);
  }

  async filterByCategory(category) {
    await this.categoryFilter.selectOption(category);
  }

  async sortBy(sortOption) {
    await this.sortDropdown.selectOption(sortOption);
  }

  async toggleSoloVerified() {
    await this.soloVerifiedToggle.click();
  }

  async clearFilters() {
    await this.clearFiltersBtn.click();
  }

  async getReviewCount() {
    return this.reviewCard.count();
  }

  async goToNextPage() {
    await this.nextPageBtn.click();
  }
}
